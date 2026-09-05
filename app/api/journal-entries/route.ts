import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const journalId = searchParams.get('journalId') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  const where: Record<string, unknown> = {};
  if (journalId) where.journalId = journalId;
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = new Date(from);
    if (to) (where.date as Record<string, unknown>).lte = new Date(to + 'T23:59:59.999Z');
  }

  const entries = await prisma.journalEntry.findMany({
    where,
    include: {
      journal: true,
      partner: true,
      lines: {
        include: { account: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(entries);
}
