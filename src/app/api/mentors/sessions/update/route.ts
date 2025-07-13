import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { validateSession } from '@/data/auth';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = validateSession(sessionToken);
    if (!user || user.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionId, updates } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    const sessionsCollection = await getCollection('sessions');
    
    // Verify the mentor has access to this session
    const session = await sessionsCollection.findOne({
      _id: new ObjectId(sessionId),
      $or: [
        { studentMentor1: user.username },
        { studentMentor2: user.username },
        { facultyMentor: user.username },
        { subMentor: user.username }
      ]
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    // Update the session
    const result = await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      { 
        $set: {
          ...updates,
          lastUpdated: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully'
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 