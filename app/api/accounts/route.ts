import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const accounts = await prisma.account.findMany({ orderBy: { type: 'asc' } });
  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  try {
    const { name, type } = await request.json();

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 });
    }

    // Check uniqueness
    const existing = await prisma.account.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: 'Account name already exists' }, { status: 400 });
    }

    const account = await prisma.account.create({
      data: { name, type, isSeeded: false },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
