import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const analytics = await prisma.analyticAccount.findMany({
    include: { budgets: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(analytics);
}

export async function POST(request: Request) {
  try {
    const { name, type } = await request.json();

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 });
    }

    const analytic = await prisma.analyticAccount.create({
      data: { name, type },
    });

    return NextResponse.json(analytic, { status: 201 });
  } catch (error) {
    console.error('Create analytic account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
