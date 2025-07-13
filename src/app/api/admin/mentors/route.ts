import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { hashPassword } from '@/data/auth';
import { Mentor } from '@/data/mentor.model';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const mentorData = await request.json();
    
    // Validate required fields
    const requiredFields = ['username', 'password', 'email', 'phone', 'Branch', 'Section', 'CIE_Department', 'GraduationYear', 'CurrentYear', 'academicYear', 'role'];
    for (const field of requiredFields) {
      if (!mentorData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const mentorsCollection = await getCollection('mentors');
    
    // Check if username already exists
    const existingMentor = await mentorsCollection.findOne({ username: mentorData.username });
    if (existingMentor) {
      return NextResponse.json(
        { success: false, message: 'Username already exists' },
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingEmail = await mentorsCollection.findOne({ email: mentorData.email });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }
      );
    }

    // Create new mentor
    const newMentor: Mentor = {
      username: mentorData.username,
      password: hashPassword(mentorData.password),
      email: mentorData.email,
      phone: mentorData.phone,
      Branch: mentorData.Branch,
      Section: mentorData.Section,
      CIE_Department: mentorData.CIE_Department,
      GraduationYear: mentorData.GraduationYear,
      CurrentYear: mentorData.CurrentYear,
      sessions_taken_overall: '0',
      current_sem_sessions_taken: '0',
      projects: [],
      current_mentoring_class: null,
      skills: mentorData.skills || [],
      hobbies: mentorData.hobbies || [],
      linkedin: mentorData.linkedin || '',
      github: mentorData.github || '',
      projects_mentored: [],
      academicYear: mentorData.academicYear,
      role: mentorData.role,
      isActive: true,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    const result = await mentorsCollection.insertOne(newMentor);

    return NextResponse.json({
      success: true,
      message: 'Mentor created successfully',
      mentorId: result.insertedId
    });
  } catch (error) {
    console.error('Error creating mentor:', error);
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
    
    const mentorsCollection = await getCollection('mentors');
    
    const filter: { academicYear?: string } = {};
    if (academicYear) {
      filter.academicYear = academicYear;
    }
    
    const mentors = await mentorsCollection.find(filter).toArray();
    
    return NextResponse.json({
      success: true,
      mentors: mentors.map(mentor => ({
        _id: mentor._id,
        username: mentor.username,
        email: mentor.email,
        phone: mentor.phone,
        Branch: mentor.Branch,
        Section: mentor.Section,
        CIE_Department: mentor.CIE_Department,
        GraduationYear: mentor.GraduationYear,
        CurrentYear: mentor.CurrentYear,
        sessions_taken_overall: mentor.sessions_taken_overall,
        current_sem_sessions_taken: mentor.current_sem_sessions_taken,
        skills: mentor.skills,
        hobbies: mentor.hobbies,
        linkedin: mentor.linkedin,
        github: mentor.github,
        academicYear: mentor.academicYear,
        role: mentor.role,
        isActive: mentor.isActive,
        createdAt: mentor.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get('id');
    
    if (!mentorId) {
      return NextResponse.json(
        { success: false, message: 'Mentor ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const mentorsCollection = await getCollection('mentors');
    
    const result = await mentorsCollection.updateOne(
      { _id: new ObjectId(mentorId) },
      { 
        $set: {
          ...updateData,
          lastUpdated: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Mentor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mentor updated successfully'
    });
  } catch (error) {
    console.error('Error updating mentor:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get('id');
    
    if (!mentorId) {
      return NextResponse.json(
        { success: false, message: 'Mentor ID is required' },
        { status: 400 }
      );
    }

    const mentorsCollection = await getCollection('mentors');
    
    const result = await mentorsCollection.deleteOne({ _id: new ObjectId(mentorId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Mentor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mentor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 