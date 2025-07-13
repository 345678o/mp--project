import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { validateSession } from '@/data/auth';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    const user = validateSession(sessionToken);
    if (!user || user.role !== 'mentor') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const { status } = await request.json();
    if (!['completed', 'on-hold', 'in-progress'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }
    const projectsCollection = await getCollection('projects');
    const project = await projectsCollection.findOne({ _id: new ObjectId(params.projectId) });
    if (!project) {
      return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
    }
    await projectsCollection.updateOne(
      { _id: new ObjectId(params.projectId) },
      { $set: { status, lastUpdated: new Date(), completed: status === 'completed' } }
    );
    const updated = await projectsCollection.findOne({ _id: new ObjectId(params.projectId) });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating project status:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 