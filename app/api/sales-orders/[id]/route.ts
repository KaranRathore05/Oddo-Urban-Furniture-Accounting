import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const so = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      lines: { include: { product: true } },
      invoice: true,
    },
  });

  if (!so) {
    return NextResponse.json({ error: 'Sales order not found' }, { status: 404 });
  }

  return NextResponse.json(so);
}
