import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/csrf';

/**
 * GET /api/csrf - Returns a CSRF token and sets it in a cookie.
 * Required for contact form and other POST requests that need CSRF protection.
 */
export async function GET() {
  try {
    const token = generateToken();
    const response = NextResponse.json({ csrfToken: token });
    response.cookies.set('csrfToken', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return response;
  } catch (error) {
    console.error('CSRF token generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
