import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { validateSession } from '@/data/auth';
import { ObjectId } from 'mongodb';

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

    const classesCollection = await getCollection('classes');
    const mentorsCollection = await getCollection('mentors');
    
    // Get mentor by _id from session
    const mentor = await mentorsCollection.findOne({ _id: new ObjectId(user._id) });
    if (!mentor) {
      return NextResponse.json(
        { success: false, message: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Ensure mentor._id is an ObjectId
    const mentorId = mentor._id;

    // Find classes where the mentor is assigned as faculty mentor or student mentor
    const classes = await classesCollection.find({
      $or: [
        { facultyMentor: mentorId },
        { studentMentor1: mentorId },
        { studentMentor2: mentorId }
      ]
    }).toArray();
    
    return NextResponse.json({
      success: true,
      classes: classes.map(cls => ({
        _id: cls._id,
        className: cls.className,
        section: cls.section,
        batch: cls.batch,
        academicYear: cls.academicYear,
        facultyMentor: cls.facultyMentor,
        studentMentor1: cls.studentMentor1,
        studentMentor2: cls.studentMentor2,
        totalStudents: cls.totalStudents,
        activeProjects: cls.activeProjects,
        completedProjects: cls.completedProjects,
        sessions: cls.sessions,
        isActive: cls.isActive,
        createdAt: cls.createdAt,
        // Add role information for the current mentor
        mentorRole: cls.facultyMentor?.toString() === mentorId.toString() ? 'faculty' : 
                   cls.studentMentor1?.toString() === mentorId.toString() ? 'student1' : 'student2'
      }))
    });
  } catch (error) {
    console.error('Error fetching mentor classes:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 