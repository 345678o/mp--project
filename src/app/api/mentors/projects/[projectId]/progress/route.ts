import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { validateSession } from '@/data/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const resolvedParams = await params;
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    const user = validateSession(sessionToken);
    if (!user || user.role !== 'mentor') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, message: 'Progress report text is required' }, { status: 400 });
    }

    const projectsCollection = await getCollection('projects');
    
    // Try to find project by _id first, then by projectCode
    let project = null;
    try {
      // Try as ObjectId first
      project = await projectsCollection.findOne({ _id: new ObjectId(resolvedParams.projectId) });
    } catch (error) {
      // If ObjectId conversion fails, try as projectCode
      project = await projectsCollection.findOne({ projectCode: resolvedParams.projectId });
    }
    
    if (!project) {
      return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
    }

    // Check if mentor is assigned to this project
    console.log('Mentor ID from session:', user._id);
    console.log('Project mentors:', project.mentors);
    console.log('Mentor ObjectId:', new ObjectId(user._id));
    
    const mentorObjectId = new ObjectId(user._id);
    const isMentorAssigned = project.mentors.some((mentorId: any) => 
      mentorId.toString() === mentorObjectId.toString()
    );
    
    if (!isMentorAssigned) {
      return NextResponse.json({ success: false, message: 'Not authorized to update this project' }, { status: 403 });
    }

    // Get mentor details from database
    const mentorsCollection = await getCollection('mentors');
    const mentor = await mentorsCollection.findOne({ _id: new ObjectId(user._id) });
    const mentorName = mentor?.username || 'Unknown Mentor';

    const progressReport = {
      date: new Date(),
      text: text.trim(),
      mentorId: user._id,
      mentorName: mentorName
    };

    await projectsCollection.updateOne(
      { _id: project._id },
      { 
        $push: { progressReport },
        $set: { lastUpdated: new Date() }
      }
    );

    return NextResponse.json({ success: true, progressReport });
  } catch (error) {
    console.error('Error adding progress report:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 