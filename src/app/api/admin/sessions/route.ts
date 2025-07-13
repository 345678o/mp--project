import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { Session, SessionStatus } from '@/data/session.model';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json();
    
    // Validate required fields
    const requiredFields = ['classId', 'day', 'date', 'slot', 'className', 'section', 'batch', 'academicYear', 'facultyMentor'];
    for (const field of requiredFields) {
      if (!sessionData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate that mentors are different
    if (sessionData.studentMentor1 && sessionData.studentMentor2 && 
        sessionData.studentMentor1 === sessionData.studentMentor2) {
      return NextResponse.json(
        { success: false, message: 'Student mentors cannot be the same' },
        { status: 400 }
      );
    }

    const sessionsCollection = await getCollection('sessions');
    
    if (sessionData.createMultipleSessions) {
      // Create multiple sessions for the next 8 weeks
      const sessions = [];
      const startDate = new Date(sessionData.date);
      
      for (let i = 0; i < 8; i++) {
        const sessionDate = new Date(startDate);
        sessionDate.setDate(startDate.getDate() + (i * 7)); // Add 7 days for each week
        
        const newSession: Session = {
          classId: new ObjectId(sessionData.classId),
          day: sessionData.day,
          date: sessionDate,
          timeSlot: sessionData.slot,
          slot: sessionData.slot,
          className: sessionData.className,
          section: sessionData.section,
          batch: sessionData.batch,
          studentMentor1: sessionData.studentMentor1 || '',
          studentMentor2: sessionData.studentMentor2 || '',
          facultyMentor: sessionData.facultyMentor,
          subMentor: sessionData.subMentor || '',
          sessionProgress: '',
          attendanceImage: '',
          projectStatus: '',
          projects: [],
          status: 'pending' as SessionStatus,
          academicYear: sessionData.academicYear,
          lastUpdated: new Date(),
          createdAt: new Date()
        };
        
        sessions.push(newSession);
      }
      
      const result = await sessionsCollection.insertMany(sessions);
      
      return NextResponse.json({
        success: true,
        message: 'Multiple sessions created successfully',
        sessionsCreated: result.insertedCount,
        sessionIds: Object.values(result.insertedIds)
      });
    } else {
      // Create single session
      const newSession: Session = {
        classId: new ObjectId(sessionData.classId),
        day: sessionData.day,
        date: new Date(sessionData.date),
        timeSlot: sessionData.slot,
        slot: sessionData.slot,
        className: sessionData.className,
        section: sessionData.section,
        batch: sessionData.batch,
        studentMentor1: sessionData.studentMentor1 || '',
        studentMentor2: sessionData.studentMentor2 || '',
        facultyMentor: sessionData.facultyMentor,
        subMentor: sessionData.subMentor || '',
        sessionProgress: '',
        attendanceImage: '',
        projectStatus: '',
        projects: [],
        status: 'pending' as SessionStatus,
        academicYear: sessionData.academicYear,
        lastUpdated: new Date(),
        createdAt: new Date()
      };

      const result = await sessionsCollection.insertOne(newSession);

      return NextResponse.json({
        success: true,
        message: 'Session created successfully',
        sessionId: result.insertedId
      });
    }
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear');
    const status = searchParams.get('status');
    
    const sessionsCollection = await getCollection('sessions');
    
    const filter: { academicYear?: string; status?: SessionStatus } = {};
    if (academicYear) {
      filter.academicYear = academicYear;
    }
    if (status) {
      filter.status = status as SessionStatus;
    }
    
    const sessions = await sessionsCollection.find(filter).toArray();
    
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
      }))
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const sessionsCollection = await getCollection('sessions');
    
    const result = await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      { 
        $set: {
          ...updateData,
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    const sessionsCollection = await getCollection('sessions');
    
    const result = await sessionsCollection.deleteOne({ _id: new ObjectId(sessionId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    const completionData = await request.json();
    
    // Validate required fields for session completion
    const requiredFields = ['sessionProgress', 'attendanceImage', 'projectStatus', 'completedBy'];
    for (const field of requiredFields) {
      if (!completionData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required for session completion` },
          { status: 400 }
        );
      }
    }

    const sessionsCollection = await getCollection('sessions');
    const mentorsCollection = await getCollection('mentors');
    
    // Get the session to find the mentors
    const session = await sessionsCollection.findOne({ _id: new ObjectId(sessionId) });
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Update session status to completed
    const result = await sessionsCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      { 
        $set: {
          sessionProgress: completionData.sessionProgress,
          attendanceImage: completionData.attendanceImage,
          projectStatus: completionData.projectStatus,
          status: 'completed' as SessionStatus,
          completedBy: completionData.completedBy,
          completedAt: new Date(),
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

    // Update session counts for all mentors (including substitutes)
    const mentorsToUpdate = new Set([
      session.studentMentor1,
      session.studentMentor2,
      session.facultyMentor
    ]);

    // Add substitute mentors if they exist
    if (session.substitutedMentor1?.substituteMentor) {
      mentorsToUpdate.add(session.substitutedMentor1.substituteMentor);
    }
    if (session.substitutedMentor2?.substituteMentor) {
      mentorsToUpdate.add(session.substitutedMentor2.substituteMentor);
    }

    // Update session counts for each mentor
    for (const mentorUsername of mentorsToUpdate) {
      if (mentorUsername) {
        const mentor = await mentorsCollection.findOne({ username: mentorUsername });
        if (mentor) {
          // Check if this mentor was a substitute
          const isSubstitute = (session.substitutedMentor1?.substituteMentor === mentorUsername) ||
                              (session.substitutedMentor2?.substituteMentor === mentorUsername);
          
          if (!isSubstitute) {
            // Only count towards completed sessions if not a substitute
            const currentOverallSessions = parseInt(mentor.sessions_taken_overall) || 0;
            const currentSemSessions = parseInt(mentor.current_sem_sessions_taken) || 0;
            
            await mentorsCollection.updateOne(
              { username: mentorUsername },
              {
                $set: {
                  sessions_taken_overall: (currentOverallSessions + 1).toString(),
                  current_sem_sessions_taken: (currentSemSessions + 1).toString(),
                  lastUpdated: new Date()
                }
              }
            );
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Session completed successfully'
    });
  } catch (error) {
    console.error('Error completing session:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 