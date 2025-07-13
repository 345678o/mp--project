import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { validateSession } from '@/data/auth';

export async function GET(request: NextRequest) {
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

    const sessionsCollection = await getCollection('sessions');
    const mentorsCollection = await getCollection('mentors');
    
    // Find sessions where the mentor is involved
    const sessions = await sessionsCollection.find({
      $or: [
        { studentMentor1: user.username },
        { studentMentor2: user.username },
        { facultyMentor: user.username },
        { subMentor: user.username }
      ]
    }).toArray();

    // Get mentor statistics
    const mentor = await mentorsCollection.findOne({ username: user.username });
    
    return NextResponse.json({
      success: true,
      sessions: sessions.map(session => ({
        _id: session._id,
        classId: session.classId,
        day: session.day,
        date: session.date,
        timeSlot: session.timeSlot,
        slot: session.slot,
        className: session.className,
        section: session.section,
        batch: session.batch,
        studentMentor1: session.studentMentor1,
        studentMentor2: session.studentMentor2,
        facultyMentor: session.facultyMentor,
        subMentor: session.subMentor,
        sessionProgress: session.sessionProgress,
        attendanceImage: session.attendanceImage,
        projectStatus: session.projectStatus,
        projects: session.projects,
        status: session.status,
        academicYear: session.academicYear,
        completedBy: session.completedBy,
        lastUpdated: session.lastUpdated,
        createdAt: session.createdAt
      })),
      mentorStats: mentor ? {
        sessions_taken_overall: mentor.sessions_taken_overall,
        current_sem_sessions_taken: mentor.current_sem_sessions_taken
      } : null
    });
  } catch (error) {
    console.error('Error fetching mentor sessions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 