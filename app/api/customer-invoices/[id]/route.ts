import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invoice = await prisma.customerInvoice.findUnique({
    where: { id },
    include: {
      customer: true,
      so: {
        include: {
          lines: { include: { product: true } },
        },
      },
      payments: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: 'Customer invoice not found' }, { status: 404 });
  }

  return NextResponse.json(invoice);
}
