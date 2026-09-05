import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';

  const where: Record<string, unknown> = {};
  if (status && status !== 'ALL') where.status = status;

  const bills = await prisma.vendorBill.findMany({
    where,
    include: {
      vendor: true,
      po: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(bills);
}
