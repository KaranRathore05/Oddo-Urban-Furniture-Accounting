import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entry = await prisma.journalEntry.findUnique({
    where: { id },
    include: {
      journal: true,
      partner: true,
      lines: {
        include: { account: true },
      },
    },
  });

  if (!entry) {
    return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
  }

  return NextResponse.json(entry);
}
