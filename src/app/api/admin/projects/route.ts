import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const academicYear = searchParams.get('academicYear');
    const status = searchParams.get('status');

    const projectsCollection = await getCollection('projects');
    
    // Build filter
    const filter: { classId?: ObjectId; academicYear?: string; status?: string } = {};
    if (classId) {
      filter.classId = new ObjectId(classId);
    }
    if (academicYear) {
      filter.academicYear = academicYear;
    }
    if (status) {
      filter.status = status;
    }

    const projects = await projectsCollection.find(filter).toArray();
    
    return NextResponse.json({
      success: true,
      projects: projects.map(project => ({
        _id: project._id,
        title: project.title,
        description: project.description,
        image: project.image,
        problemStatementId: project.problemStatementId,
        problemStatementSource: project.problemStatementSource,
        problemStatementSubmission: project.problemStatementSubmission,
        yuktiSubmission: project.yuktiSubmission,
        abstract: project.abstract,
        ppt: project.ppt,
        poster: project.poster,
        innovationChallengeDoc: project.innovationChallengeDoc,
        evaluationRubrics: project.evaluationRubrics,
        everythingDoc: project.everythingDoc,
        mentors: project.mentors,
        teamMembers: project.teamMembers,
        submittedAt: project.submittedAt,
        projectCode: project.projectCode,
        implementation: project.implementation,
        githubLink: project.githubLink,
        deployedLink: project.deployedLink,
        status: project.status,
        academicYear: project.academicYear,
        completed: project.completed,
        createdAt: project.createdAt,
        lastUpdated: project.lastUpdated
      }))
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 