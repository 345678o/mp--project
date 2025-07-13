import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { validateSession } from '@/data/auth';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest, context: { params: { projectId: string } }) {
  const { params } = context;
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

    const { db } = await connectToDatabase();
    const projectId = params.projectId;
    const updateData = await request.json();

    // Find project by projectCode and verify mentor has access
    const project = await db.collection('projects').findOne({ 
      projectCode: projectId,
      mentors: new ObjectId(user._id)
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Update project
    const result = await db.collection('projects').updateOne(
      { projectCode: projectId },
      {
        $set: {
          title: updateData.title,
          description: updateData.description,
          abstract: updateData.abstract,
          implementation: updateData.implementation,
          githubLink: updateData.githubLink,
          deployedLink: updateData.deployedLink,
          status: updateData.status,
          ppt: updateData.ppt,
          poster: updateData.poster,
          evaluationRubrics: updateData.evaluationRubrics,
          yuktiSubmission: updateData.yuktiSubmission,
          teamMembers: updateData.teamMembers,
          lastUpdated: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'No changes made' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 