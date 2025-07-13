import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { comparePassword, createSession } from '@/data/auth';
import { Mentor } from '@/data/mentor.model';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const mentorsCollection = await getCollection('mentors');
    const mentor = await mentorsCollection.findOne({ username }) as Mentor | null;

    if (!mentor) {
      return NextResponse.json(
        { success: false, message: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Simple password comparison
    if (!comparePassword(password, mentor.password)) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    if (!mentor.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated' },
        { status: 403 }
      );
    }

    const sessionToken = createSession({
      _id: mentor._id?.toString() || '',
      username: mentor.username,
      email: mentor.email,
      role: 'mentor'
    });

    const response = NextResponse.json({
      success: true,
      message: 'Mentor login successful',
      user: {
        _id: mentor._id,
        username: mentor.username,
        email: mentor.email,
        role: 'mentor',
        Branch: mentor.Branch,
        Section: mentor.Section
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
  } catch (error) {
    console.error('Mentor login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 