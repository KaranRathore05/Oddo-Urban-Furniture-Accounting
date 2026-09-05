import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bill = await prisma.vendorBill.findUnique({
    where: { id },
    include: {
      vendor: true,
      po: {
        include: {
          lines: { include: { product: true } },
        },
      },
      payments: true,
    },
  });

  if (!bill) {
    return NextResponse.json({ error: 'Vendor bill not found' }, { status: 404 });
  }

  return NextResponse.json(bill);
}
