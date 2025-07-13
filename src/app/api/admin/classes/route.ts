import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { Class } from '@/data/class.model';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const classData = await request.json();
    
    // Validate required fields
    const requiredFields = ['className', 'section', 'batch', 'academicYear', 'facultyMentor', 'studentMentor1', 'studentMentor2', 'totalStudents'];
    for (const field of requiredFields) {
      if (!classData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const classesCollection = await getCollection('classes');
    
    // Check if class already exists for the same academic year and batch
    const existingClass = await classesCollection.findOne({ 
      className: classData.className,
      section: classData.section,
      batch: classData.batch,
      academicYear: classData.academicYear
    });
    if (existingClass) {
      return NextResponse.json(
        { success: false, message: 'Class already exists for this academic year and batch' },
        { status: 409 }
      );
    }

    // Create new class
    const newClass: Class = {
      className: classData.className,
      section: classData.section,
      batch: classData.batch,
      academicYear: classData.academicYear,
      facultyMentor: new ObjectId(classData.facultyMentor),
      studentMentor1: new ObjectId(classData.studentMentor1),
      studentMentor2: new ObjectId(classData.studentMentor2),
      totalStudents: classData.totalStudents,
      activeProjects: [],
      completedProjects: [],
      sessions: [],
      isActive: true,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    const result = await classesCollection.insertOne(newClass);

    return NextResponse.json({
      success: true,
      message: 'Class created successfully',
      classId: result.insertedId
    });
  } catch (error) {
    console.error('Error creating class:', error);
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
    
    const classesCollection = await getCollection('classes');
    
    const filter: { academicYear?: string } = {};
    if (academicYear) {
      filter.academicYear = academicYear;
    }
    
    const classes = await classesCollection.find(filter).toArray();
    
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
        createdAt: cls.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('id');
    
    if (!classId) {
      return NextResponse.json(
        { success: false, message: 'Class ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const classesCollection = await getCollection('classes');
    
    const result = await classesCollection.updateOne(
      { _id: new ObjectId(classId) },
      { 
        $set: {
          ...updateData,
          lastUpdated: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Class updated successfully'
    });
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('id');
    
    if (!classId) {
      return NextResponse.json(
        { success: false, message: 'Class ID is required' },
        { status: 400 }
      );
    }

    const classesCollection = await getCollection('classes');
    
    const result = await classesCollection.deleteOne({ _id: new ObjectId(classId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 