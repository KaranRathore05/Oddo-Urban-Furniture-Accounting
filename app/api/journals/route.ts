import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const journals = await prisma.journal.findMany({
    include: { defaultAccount: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(journals);
}
