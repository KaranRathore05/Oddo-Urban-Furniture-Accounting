import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function randomDatePast90Days() {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 90));
  return date;
}

async function main() {
  console.log('🌱 Seeding database with rich random mock data...');

  // 1. Chart of Accounts
  const accountsData = [
    { name: 'Cash', type: 'ASSET' },
    { name: 'Bank', type: 'ASSET' },
    { name: 'Debtors', type: 'ASSET' },
    { name: 'Creditors', type: 'LIABILITY' },
    { name: 'Sales Income', type: 'INCOME' },
    { name: 'Purchase Expense', type: 'EXPENSE' },
    { name: 'Rent Expense', type: 'EXPENSE' },
    { name: 'Salary Expense', type: 'EXPENSE' },
    { name: 'Other Expense', type: 'EXPENSE' },
  ];

  for (const acc of accountsData) {
    await prisma.account.upsert({
      where: { name: acc.name },
      update: {},
      create: { name: acc.name, type: acc.type, isSeeded: true },
    });
  }
  const allAccounts = await prisma.account.findMany();
  const accountMap = Object.fromEntries(allAccounts.map(a => [a.name, a]));

  // 2. Journals
  const journalsData = [
    { name: 'Sales Journal', type: 'SALES', defaultAccountId: accountMap['Sales Income'].id },
    { name: 'Purchase Journal', type: 'PURCHASE', defaultAccountId: accountMap['Purchase Expense'].id },
    { name: 'Bank Journal', type: 'BANK', defaultAccountId: accountMap['Bank'].id },
    { name: 'Cash Journal', type: 'CASH', defaultAccountId: accountMap['Cash'].id },
  ];
  for (const j of journalsData) {
    await prisma.journal.upsert({
      where: { name: j.name },
      update: {},
      create: { name: j.name, type: j.type, defaultAccountId: j.defaultAccountId },
    });
  }
  const allJournals = await prisma.journal.findMany();
  const journalMap = Object.fromEntries(allJournals.map(j => [j.name, j]));

  // 3. Contacts
  const contacts = await Promise.all([
    prisma.contact.upsert({ where: { id: 'vendor-1' }, update: {}, create: { id: 'vendor-1', name: 'Azure Furniture Ltd', type: 'VENDOR', city: 'Mumbai' } }),
    prisma.contact.upsert({ where: { id: 'vendor-2' }, update: {}, create: { id: 'vendor-2', name: 'Timber & Co.', type: 'VENDOR', city: 'Delhi' } }),
    prisma.contact.upsert({ where: { id: 'vendor-3' }, update: {}, create: { id: 'vendor-3', name: 'SteelWorks India', type: 'VENDOR', city: 'Pune' } }),
    prisma.contact.upsert({ where: { id: 'vendor-4' }, update: {}, create: { id: 'vendor-4', name: 'Global Logistics', type: 'VENDOR', city: 'Chennai' } }),
    prisma.contact.upsert({ where: { id: 'customer-1' }, update: {}, create: { id: 'customer-1', name: 'Nakash Pathak', type: 'CUSTOMER', city: 'Pune' } }),
    prisma.contact.upsert({ where: { id: 'customer-2' }, update: {}, create: { id: 'customer-2', name: 'Riya Singh', type: 'CUSTOMER', city: 'Bangalore' } }),
    prisma.contact.upsert({ where: { id: 'customer-3' }, update: {}, create: { id: 'customer-3', name: 'Rahul Sharma', type: 'CUSTOMER', city: 'Mumbai' } }),
    prisma.contact.upsert({ where: { id: 'customer-4' }, update: {}, create: { id: 'customer-4', name: 'Priya Patel', type: 'CUSTOMER', city: 'Ahmedabad' } }),
  ]);

  // 4. Products
  const products = await Promise.all([
    prisma.product.upsert({ where: { id: 'prod-1' }, update: {}, create: { id: 'prod-1', name: 'Ergonomic Office Chair', type: 'GOODS', salesPrice: 8500, cost: 4500, category: 'Seating' } }),
    prisma.product.upsert({ where: { id: 'prod-2' }, update: {}, create: { id: 'prod-2', name: 'Oak Dining Table', type: 'GOODS', salesPrice: 25000, cost: 12000, category: 'Tables' } }),
    prisma.product.upsert({ where: { id: 'prod-3' }, update: {}, create: { id: 'prod-3', name: 'Lounge Sofa', type: 'GOODS', salesPrice: 35000, cost: 18000, category: 'Seating' } }),
    prisma.product.upsert({ where: { id: 'prod-4' }, update: {}, create: { id: 'prod-4', name: 'Standing Desk', type: 'GOODS', salesPrice: 15000, cost: 8000, category: 'Desks' } }),
    prisma.product.upsert({ where: { id: 'prod-5' }, update: {}, create: { id: 'prod-5', name: 'Bookshelf', type: 'GOODS', salesPrice: 12000, cost: 5000, category: 'Storage' } }),
    prisma.product.upsert({ where: { id: 'prod-6' }, update: {}, create: { id: 'prod-6', name: 'Coffee Table', type: 'GOODS', salesPrice: 6500, cost: 2500, category: 'Tables' } }),
  ]);

  // 5. Generate Random Purchase Orders & Bills with Payments
  console.log('Generating random Purchase Orders & Payments...');
  for (let i = 1; i <= 60; i++) {
    const vendor = contacts[Math.floor(Math.random() * 4)];
    const product = products[Math.floor(Math.random() * 6)];
    const qty = Math.floor(Math.random() * 15) + 1;
    const date = randomDatePast90Days();
    const totalAmount = qty * product.cost;

    const po = await prisma.purchaseOrder.create({
      data: {
        number: `PO-2026-${String(i).padStart(3, '0')}-${Math.floor(Math.random() * 10000)}`, vendorId: vendor.id, date: date, status: 'BILLED',
        lines: { create: [{ productId: product.id, qty, unitPrice: product.cost }] }
      }
    });

    const isPaid = Math.random() > 0.3; // 70% chance to be paid

    const bill = await prisma.vendorBill.create({
      data: {
        number: `BILL-2026-${String(i).padStart(3, '0')}-${Math.floor(Math.random() * 10000)}`, poId: po.id, vendorId: vendor.id, billDate: date,
        dueDate: new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000), totalAmount: totalAmount,
        status: isPaid ? 'PAID' : 'UNPAID', amountPaid: isPaid ? totalAmount : 0
      }
    });

    if (isPaid) {
      const paymentDate = new Date(date.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);
      
      const je = await prisma.journalEntry.create({
        data: {
          journalId: journalMap['Bank Journal'].id, date: paymentDate, reference: `PAY-${bill.number}`,
          partnerId: vendor.id, sourceType: 'BILL_PAYMENT', sourceId: bill.id,
          lines: {
            create: [
              { accountId: accountMap['Creditors'].id, debit: totalAmount, credit: 0 },
              { accountId: accountMap['Bank'].id, debit: 0, credit: totalAmount } // Outflow
            ]
          }
        }
      });

      await prisma.billPayment.create({
        data: { billId: bill.id, method: 'BANK', amount: totalAmount, date: paymentDate, journalEntryId: je.id }
      });
    }
  }

  // 6. Generate Random Sales Orders & Invoices with Payments
  console.log('Generating random Sales Orders & Receipts...');
  for (let i = 1; i <= 80; i++) {
    const customer = contacts[Math.floor(Math.random() * 4) + 4];
    const product = products[Math.floor(Math.random() * 6)];
    const qty = Math.floor(Math.random() * 8) + 1;
    const date = randomDatePast90Days();
    const totalAmount = qty * product.salesPrice * 1.18;

    const so = await prisma.salesOrder.create({
      data: {
        number: `SO-2026-${String(i).padStart(3, '0')}-${Math.floor(Math.random() * 10000)}`, customerId: customer.id, date: date, status: 'INVOICED',
        lines: { create: [{ productId: product.id, qty, unitPrice: product.salesPrice, taxPct: 18 }] }
      }
    });

    const isPaid = Math.random() > 0.4; // 60% chance to be paid

    const invoice = await prisma.customerInvoice.create({
      data: {
        number: `INV-2026-${String(i).padStart(3, '0')}-${Math.floor(Math.random() * 10000)}`, soId: so.id, customerId: customer.id, invoiceDate: date,
        dueDate: new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000), totalAmount: totalAmount,
        status: isPaid ? 'PAID' : 'UNPAID', amountPaid: isPaid ? totalAmount : 0
      }
    });

    if (isPaid) {
      const paymentDate = new Date(date.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);
      
      const je = await prisma.journalEntry.create({
        data: {
          journalId: journalMap['Bank Journal'].id, date: paymentDate, reference: `REC-${invoice.number}`,
          partnerId: customer.id, sourceType: 'INVOICE_PAYMENT', sourceId: invoice.id,
          lines: {
            create: [
              { accountId: accountMap['Bank'].id, debit: totalAmount, credit: 0 }, // Inflow
              { accountId: accountMap['Debtors'].id, debit: 0, credit: totalAmount }
            ]
          }
        }
      });

      await prisma.invoicePayment.create({
        data: { invoiceId: invoice.id, method: 'BANK', amount: totalAmount, date: paymentDate, journalEntryId: je.id }
      });
    }
  }

  // Create starting balance for Bank account
  await prisma.journalEntry.create({
    data: {
      journalId: journalMap['Bank Journal'].id, date: new Date('2026-01-01'), reference: 'OPENING-BAL',
      sourceType: 'OPENING', sourceId: 'OPENING',
      lines: {
        create: [
          { accountId: accountMap['Bank'].id, debit: 500000, credit: 0 },
          { accountId: accountMap['Cash'].id, debit: 0, credit: 500000 }
        ]
      }
    }
  });

  const passwordHash = await bcrypt.hash('Demo@1234', 10);
  await prisma.user.upsert({
    where: { email: 'admin@urbanfurniture.com' }, update: {},
    create: { fullName: 'Admin User', loginId: 'admin01', email: 'admin@urbanfurniture.com', mobile: '9999999999', passwordHash, role: 'ADMIN' },
  });

  // 7. Analytic Accounts & Budgets
  console.log('Generating Analytic Accounts & Budgets...');
  const analyticAccounts = await Promise.all([
    prisma.analyticAccount.create({ data: { name: 'Marketing Department', type: 'EXPENSE' } }),
    prisma.analyticAccount.create({ data: { name: 'Sales Department', type: 'INCOME' } }),
    prisma.analyticAccount.create({ data: { name: 'Operations', type: 'EXPENSE' } }),
    prisma.analyticAccount.create({ data: { name: 'R&D', type: 'EXPENSE' } }),
  ]);

  const budgetData = [
    { name: 'Q3 Marketing Budget', periodStart: '2026-07-01', periodEnd: '2026-09-30', responsiblePerson: 'Karan', analyticAccountId: analyticAccounts[0].id, plannedAmount: 250000 },
    { name: 'Q3 Sales Target', periodStart: '2026-07-01', periodEnd: '2026-09-30', responsiblePerson: 'Riya', analyticAccountId: analyticAccounts[1].id, plannedAmount: 500000 },
    { name: 'Operations Q3', periodStart: '2026-07-01', periodEnd: '2026-09-30', responsiblePerson: 'Nakash', analyticAccountId: analyticAccounts[2].id, plannedAmount: 180000 },
    { name: 'R&D Innovation', periodStart: '2026-06-01', periodEnd: '2026-12-31', responsiblePerson: 'Rahul', analyticAccountId: analyticAccounts[3].id, plannedAmount: 350000 },
    { name: 'Marketing Campaign H2', periodStart: '2026-07-01', periodEnd: '2026-12-31', responsiblePerson: 'Priya', analyticAccountId: analyticAccounts[0].id, plannedAmount: 400000 },
  ];

  for (const b of budgetData) {
    await prisma.budget.create({
      data: { ...b, periodStart: new Date(b.periodStart), periodEnd: new Date(b.periodEnd) },
    });
  }

  console.log('🎉 Rich random seed complete!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
