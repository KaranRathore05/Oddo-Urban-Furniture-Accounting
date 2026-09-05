import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { signupSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, loginId, email, mobile, password, role } = parsed.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Validation failed', details: { email: ['Email already registered'] } },
        { status: 400 }
      );
    }

    // Check if loginId already exists
    const existingLoginId = await prisma.user.findUnique({ where: { loginId } });
    if (existingLoginId) {
      return NextResponse.json(
        { error: 'Validation failed', details: { loginId: ['Login ID already taken'] } },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { fullName, loginId, email, mobile, passwordHash, role },
    });

    const token = signToken(user.id, user.role, user.email);
    const cookie = setAuthCookie(token);

    const response = NextResponse.json(
      { message: 'Account created', user: { id: user.id, fullName: user.fullName, email: user.email } },
      { status: 201 }
    );
    response.cookies.set(cookie);

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
