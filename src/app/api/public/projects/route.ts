import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear');
    const status = searchParams.get('status');

    const projectsCollection = await getCollection('projects');
    
    // Build filter - only show completed projects publicly
    const filter: { academicYear?: string; status?: string } = {};
    if (academicYear) {
      filter.academicYear = academicYear;
    }
    if (status) {
      filter.status = status;
    } else {
      // Default to showing only completed projects publicly
      filter.status = 'completed';
    }

    const projects = await projectsCollection.find(filter).toArray();
    
    return NextResponse.json({
      success: true,
      projects: projects.map(project => ({
        _id: project._id,
        title: project.title,
        description: project.description,
        projectCode: project.projectCode,
        status: project.status,
        academicYear: project.academicYear,
        teamMembers: project.teamMembers,
        githubLink: project.githubLink,
        deployedLink: project.deployedLink,
        createdAt: project.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching public projects:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 