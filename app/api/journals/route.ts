import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const journals = await prisma.journal.findMany({
    include: { defaultAccount: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(journals);
}

export async function POST(request: Request) {
  try {
    const { name, type, defaultAccountId } = await request.json();

    if (!name || !type || !defaultAccountId) {
      return NextResponse.json({ error: 'Name, Type and Default Account are required' }, { status: 400 });
    }

    const existing = await prisma.journal.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: 'Journal name already exists' }, { status: 400 });
    }

    const journal = await prisma.journal.create({
      data: { name, type, defaultAccountId },
      include: { defaultAccount: true },
    });

    return NextResponse.json(journal, { status: 201 });
  } catch (error) {
    console.error('Create journal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
