import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { purchaseOrderSchema } from '@/lib/validations';
import { generatePONumber } from '@/lib/numberGenerator';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';

  const where: Record<string, unknown> = {};
  if (status && status !== 'ALL') where.status = status;

  const orders = await prisma.purchaseOrder.findMany({
    where,
    include: {
      vendor: true,
      lines: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = purchaseOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { vendorId, date, lines } = parsed.data;
    const number = await generatePONumber();

    const po = await prisma.purchaseOrder.create({
      data: {
        number,
        vendorId,
        date: new Date(date),
        status: 'DRAFT',
        lines: {
          create: lines.map((l) => ({
            productId: l.productId,
            qty: l.qty,
            unitPrice: l.unitPrice,
          })),
        },
      },
      include: {
        vendor: true,
        lines: { include: { product: true } },
      },
    });

    return NextResponse.json(po, { status: 201 });
  } catch (error) {
    console.error('Create PO error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
