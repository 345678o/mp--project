import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { validateSession } from '@/data/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const sessionId = formData.get('sessionId') as string;
    const attendanceImage = formData.get('attendanceImage') as File;

    if (!sessionId || !attendanceImage) {
      return NextResponse.json(
        { success: false, message: 'Session ID and attendance image are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!attendanceImage.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (attendanceImage.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const sessionsCollection = await getCollection('sessions');
    
    // Check if session exists and mentor has access
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

    // Convert image to base64 for storage
    const arrayBuffer = await attendanceImage.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:${attendanceImage.type};base64,${buffer.toString('base64')}`;

    // Update session with attendance image
    await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      { 
        $set: { 
          attendanceImage: base64Image,
          lastUpdated: new Date()
        } 
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Attendance image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading attendance image:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 