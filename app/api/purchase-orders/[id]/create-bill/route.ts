import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateBillNumber } from '@/lib/numberGenerator';
import { postVendorBill } from '@/lib/postingEngine';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { lines: { include: { product: true } }, bill: true },
    });

    if (!po) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 });
    }

    if (po.status !== 'CONFIRMED') {
      return NextResponse.json({ error: 'Only CONFIRMED orders can generate a bill' }, { status: 400 });
    }

    if (po.bill) {
      return NextResponse.json({ error: 'Bill already exists for this PO' }, { status: 400 });
    }

    // Calculate total from PO lines
    const totalAmount = po.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
    const billNumber = await generateBillNumber();
    const billDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create bill and update PO status in a transaction
    const bill = await prisma.$transaction(async (tx) => {
      const newBill = await tx.vendorBill.create({
        data: {
          number: billNumber,
          poId: id,
          vendorId: po.vendorId,
          billDate,
          dueDate,
          totalAmount,
          status: 'UNPAID',
          amountPaid: 0,
        },
      });

      await tx.purchaseOrder.update({
        where: { id },
        data: { status: 'BILLED' },
      });

      return newBill;
    });

    // Post the journal entry for the bill
    const journalEntry = await postVendorBill(bill.id);

    return NextResponse.json({ bill, journalEntry }, { status: 201 });
  } catch (error) {
    console.error('Create bill error:', error);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}
