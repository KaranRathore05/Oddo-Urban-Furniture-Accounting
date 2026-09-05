import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { salesOrderSchema } from '@/lib/validations';
import { generateSONumber } from '@/lib/numberGenerator';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';

  const where: Record<string, unknown> = {};
  if (status && status !== 'ALL') where.status = status;

  const orders = await prisma.salesOrder.findMany({
    where,
    include: {
      customer: true,
      lines: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = salesOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { customerId, date, lines } = parsed.data;
    const number = await generateSONumber();

    const so = await prisma.salesOrder.create({
      data: {
        number,
        customerId,
        date: new Date(date),
        status: 'DRAFT',
        lines: {
          create: lines.map((l) => ({
            productId: l.productId,
            qty: l.qty,
            unitPrice: l.unitPrice,
            taxPct: l.taxPct || 0,
          })),
        },
      },
      include: {
        customer: true,
        lines: { include: { product: true } },
      },
    });

    return NextResponse.json(so, { status: 201 });
  } catch (error) {
    console.error('Create SO error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
