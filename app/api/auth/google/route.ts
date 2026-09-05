import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/db';
import { signToken, setAuthCookie, hashPassword } from '@/lib/auth';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid Google token payload' }, { status: 400 });
    }

    const { email, name, sub } = payload;

    // Check if user exists in our database
    let user = await prisma.user.findUnique({ where: { email } });

    // If not, automatically sign them up
    if (!user) {
      const plainPassword = `google_${sub}_${Date.now()}`;
      const passwordHash = await hashPassword(plainPassword);

      user = await prisma.user.create({
        data: {
          email,
          fullName: name || 'Google User',
          mobile: '0000000000', // Default or prompt later
          passwordHash, // Random secure dummy password
          role: 'ACCOUNTANT'
        }
      });
    }

    // Generate our own JWT for session management
    const sessionToken = signToken(user.id, user.role, user.email);
    const cookie = setAuthCookie(sessionToken);

    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
    response.cookies.set(cookie as any); // Type assertion for next/server cookie options
    return response;
  } catch (error) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
