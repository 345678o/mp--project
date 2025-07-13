import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/data/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { isMentor: false },
        { status: 401 }
      );
    }

    const user = validateSession(sessionToken);
    if (!user || user.role !== 'mentor') {
      return NextResponse.json(
        { isMentor: false },
        { status: 401 }
      );
    }

    return NextResponse.json({ isMentor: true });
  } catch (error) {
    console.error('Error checking mentor status:', error);
    return NextResponse.json(
      { isMentor: false },
      { status: 500 }
    );
  }
} 