import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateInvoiceNumber } from "@/lib/numberGenerator";
import { postCustomerInvoice } from "@/lib/postingEngine";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const so = await prisma.salesOrder.findUnique({
      where: { id },
      include: { lines: { include: { product: true } }, invoice: true },
    });

    if (!so) {
      return NextResponse.json(
        { error: "Sales order not found" },
        { status: 404 },
      );
    }

    if (so.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Only CONFIRMED orders can generate an invoice" },
        { status: 400 },
      );
    }

    if (so.invoice) {
      return NextResponse.json(
        { error: "Invoice already exists for this SO" },
        { status: 400 },
      );
    }

    // Calculate total from SO lines (including tax)
    const totalAmount = so.lines.reduce(
      (sum, l) => sum + l.qty * l.unitPrice * (1 + l.taxPct / 100),
      0,
    );
    const invoiceNumber = await generateInvoiceNumber();
    const invoiceDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create invoice and update SO status in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const newInvoice = await tx.customerInvoice.create({
        data: {
          number: invoiceNumber,
          soId: id,
          customerId: so.customerId,
          invoiceDate,
          dueDate,
          totalAmount,
          status: "UNPAID",
          amountPaid: 0,
        },
      });

      await tx.salesOrder.update({
        where: { id },
        data: { status: "INVOICED" },
      });

      return newInvoice;
    });

    // Post the journal entry for the invoice
    const journalEntry = await postCustomerInvoice(invoice.id);

    return NextResponse.json({ invoice, journalEntry }, { status: 201 });
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 },
    );
  }
}
