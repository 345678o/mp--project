import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_CREDENTIALS, createSession } from '@/data/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Check against hardcoded admin credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const sessionToken = createSession({
        _id: 'admin',
        username: ADMIN_CREDENTIALS.username,
        email: ADMIN_CREDENTIALS.email,
        role: 'admin'
      });

      const response = NextResponse.json({
        success: true,
        message: 'Admin login successful',
        user: {
          username: ADMIN_CREDENTIALS.username,
          email: ADMIN_CREDENTIALS.email,
          role: 'admin'
        }
      });

      // Set session cookie
      response.cookies.set('session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 // 24 hours
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 