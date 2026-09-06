import { prisma } from "./db";

/**
 * Auto-Posting Engine
 *
 * This is the core accounting logic. Every transaction produces a mathematically
 * balanced journal entry. There are exactly 4 posting rules:
 *
 * 1. Vendor Bill confirmed    → Debit: Purchase Expense, Credit: Creditors
 * 2. Payment to vendor        → Debit: Creditors, Credit: Bank or Cash
 * 3. Customer Invoice created → Debit: Debtors, Credit: Sales Income
 * 4. Payment from customer    → Debit: Cash or Bank, Credit: Debtors
 */

// --- Helpers ---

interface JournalLine {
  accountId: string;
  debit: number;
  credit: number;
}

async function getAccountByName(name: string) {
  const account = await prisma.account.findUnique({ where: { name } });
  if (!account) throw new Error(`Account not found: ${name}`);
  return account;
}

async function getJournalByType(type: string) {
  const journal = await prisma.journal.findFirst({ where: { type } });
  if (!journal) throw new Error(`Journal not found for type: ${type}`);
  return journal;
}

function assertBalanced(lines: JournalLine[]): void {
  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
  // Use a tiny epsilon for floating point comparison
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(
      `Unbalanced journal entry: Debit=${totalDebit}, Credit=${totalCredit}. ` +
        `Difference=${Math.abs(totalDebit - totalCredit)}`,
    );
  }
}

function computeBillStatus(amountPaid: number, totalAmount: number): string {
  if (amountPaid >= totalAmount) return "PAID";
  if (amountPaid > 0) return "PARTIAL";
  return "UNPAID";
}

// --- Posting Function 1: Vendor Bill Confirmed ---
// Debit: Purchase Expense | Credit: Creditors | Amount: Bill total

export async function postVendorBill(billId: string) {
  const bill = await prisma.vendorBill.findUnique({
    where: { id: billId },
    include: { vendor: true },
  });
  if (!bill) throw new Error(`Vendor bill not found: ${billId}`);

  const purchaseExpense = await getAccountByName("Purchase Expense");
  const creditors = await getAccountByName("Creditors");
  const purchaseJournal = await getJournalByType("PURCHASE");

  const lines: JournalLine[] = [
    { accountId: purchaseExpense.id, debit: bill.totalAmount, credit: 0 },
    { accountId: creditors.id, debit: 0, credit: bill.totalAmount },
  ];

  assertBalanced(lines);

  const journalEntry = await prisma.journalEntry.create({
    data: {
      journalId: purchaseJournal.id,
      reference: bill.number,
      partnerId: bill.vendorId,
      sourceType: "VENDOR_BILL",
      sourceId: bill.id,
      date: bill.billDate,
      lines: { create: lines },
    },
    include: { lines: { include: { account: true } } },
  });

  return journalEntry;
}

// --- Posting Function 2: Bill Payment (Payment to Vendor) ---
// Debit: Creditors | Credit: Bank or Cash | Amount: Payment amount

export async function postBillPayment(
  billId: string,
  method: string,
  amount: number,
  paymentDate: Date,
) {
  const bill = await prisma.vendorBill.findUnique({
    where: { id: billId },
    include: { vendor: true },
  });
  if (!bill) throw new Error(`Vendor bill not found: ${billId}`);

  // Validate no overpayment
  const newAmountPaid = bill.amountPaid + amount;
  if (newAmountPaid > bill.totalAmount + 0.001) {
    throw new Error(
      `Payment of ₹${amount} would exceed the bill total. ` +
        `Outstanding: ₹${(bill.totalAmount - bill.amountPaid).toFixed(2)}`,
    );
  }

  const creditors = await getAccountByName("Creditors");
  const paymentAccount = await getAccountByName(
    method === "BANK" ? "Bank" : "Cash",
  );
  const journal = await getJournalByType(method === "BANK" ? "BANK" : "CASH");

  const lines: JournalLine[] = [
    { accountId: creditors.id, debit: amount, credit: 0 },
    { accountId: paymentAccount.id, debit: 0, credit: amount },
  ];

  assertBalanced(lines);

  // Use $transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    const journalEntry = await tx.journalEntry.create({
      data: {
        journalId: journal.id,
        reference: `PAY-${bill.number}`,
        partnerId: bill.vendorId,
        sourceType: "BILL_PAYMENT",
        sourceId: billId,
        date: paymentDate,
        lines: { create: lines },
      },
      include: { lines: { include: { account: true } } },
    });

    const payment = await tx.billPayment.create({
      data: {
        billId: bill.id,
        method,
        amount,
        date: paymentDate,
        journalEntryId: journalEntry.id,
      },
    });

    // Update bill paid amount and status
    const updatedAmountPaid = bill.amountPaid + amount;
    await tx.vendorBill.update({
      where: { id: billId },
      data: {
        amountPaid: updatedAmountPaid,
        status: computeBillStatus(updatedAmountPaid, bill.totalAmount),
      },
    });

    return { journalEntry, payment };
  });

  return result;
}

// --- Posting Function 3: Customer Invoice Generated ---
// Debit: Debtors | Credit: Sales Income | Amount: Invoice total

export async function postCustomerInvoice(invoiceId: string) {
  const invoice = await prisma.customerInvoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true },
  });
  if (!invoice) throw new Error(`Customer invoice not found: ${invoiceId}`);

  const debtors = await getAccountByName("Debtors");
  const salesIncome = await getAccountByName("Sales Income");
  const salesJournal = await getJournalByType("SALES");

  const lines: JournalLine[] = [
    { accountId: debtors.id, debit: invoice.totalAmount, credit: 0 },
    { accountId: salesIncome.id, debit: 0, credit: invoice.totalAmount },
  ];

  assertBalanced(lines);

  const journalEntry = await prisma.journalEntry.create({
    data: {
      journalId: salesJournal.id,
      reference: invoice.number,
      partnerId: invoice.customerId,
      sourceType: "CUSTOMER_INVOICE",
      sourceId: invoice.id,
      date: invoice.invoiceDate,
      lines: { create: lines },
    },
    include: { lines: { include: { account: true } } },
  });

  return journalEntry;
}

// --- Posting Function 4: Invoice Payment (Payment from Customer) ---
// Debit: Cash or Bank | Credit: Debtors | Amount: Payment amount

export async function postInvoicePayment(
  invoiceId: string,
  method: string,
  amount: number,
  paymentDate: Date,
) {
  const invoice = await prisma.customerInvoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true },
  });
  if (!invoice) throw new Error(`Customer invoice not found: ${invoiceId}`);

  // Validate no overpayment
  const newAmountPaid = invoice.amountPaid + amount;
  if (newAmountPaid > invoice.totalAmount + 0.001) {
    throw new Error(
      `Payment of ₹${amount} would exceed the invoice total. ` +
        `Outstanding: ₹${(invoice.totalAmount - invoice.amountPaid).toFixed(2)}`,
    );
  }

  const paymentAccount = await getAccountByName(
    method === "BANK" ? "Bank" : "Cash",
  );
  const debtors = await getAccountByName("Debtors");
  const journal = await getJournalByType(method === "BANK" ? "BANK" : "CASH");

  const lines: JournalLine[] = [
    { accountId: paymentAccount.id, debit: amount, credit: 0 },
    { accountId: debtors.id, debit: 0, credit: amount },
  ];

  assertBalanced(lines);

  const result = await prisma.$transaction(async (tx) => {
    const journalEntry = await tx.journalEntry.create({
      data: {
        journalId: journal.id,
        reference: `PAY-${invoice.number}`,
        partnerId: invoice.customerId,
        sourceType: "INVOICE_PAYMENT",
        sourceId: invoiceId,
        date: paymentDate,
        lines: { create: lines },
      },
      include: { lines: { include: { account: true } } },
    });

    const payment = await tx.invoicePayment.create({
      data: {
        invoiceId: invoice.id,
        method,
        amount,
        date: paymentDate,
        journalEntryId: journalEntry.id,
      },
    });

    // Update invoice paid amount and status
    const updatedAmountPaid = invoice.amountPaid + amount;
    await tx.customerInvoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: updatedAmountPaid,
        status: computeBillStatus(updatedAmountPaid, invoice.totalAmount),
      },
    });

    return { journalEntry, payment };
  });

  return result;
}
