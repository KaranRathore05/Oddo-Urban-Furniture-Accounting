import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: { archived: !contact.archived },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Archive contact error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
