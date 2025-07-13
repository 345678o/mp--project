import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

export async function GET() {
  try {
    const mentorsCollection = await getCollection('mentors');
    const classesCollection = await getCollection('classes');
    const sessionsCollection = await getCollection('sessions');
    const projectsCollection = await getCollection('projects');
    const problemsCollection = await getCollection('problemStatements');

    const [totalMentors, totalClasses, totalSessions, totalProjects, totalProblemStatements] = await Promise.all([
      mentorsCollection.countDocuments(),
      classesCollection.countDocuments(),
      sessionsCollection.countDocuments(),
      projectsCollection.countDocuments(),
      problemsCollection.countDocuments()
    ]);

    return NextResponse.json({
      totalMentors,
      totalClasses,
      totalSessions,
      totalProjects,
      totalProblemStatements
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
} 