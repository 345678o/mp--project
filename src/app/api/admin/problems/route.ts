import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { ProblemStatement } from '@/data/problem.model';

const uri = process.env.MONGODB_URI!;
const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');

// Get all problem statements
export async function GET(_req: NextRequest) {
  // Admin check removed for public access
  // const adminEmail = req.headers.get('x-admin-email');
  // if (!adminEmail || !adminEmails.includes(adminEmail)) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const client = new MongoClient(uri, {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true,
  });

  try {
    await client.connect();
    const db = client.db();
    const problems = await db.collection('problems').find({}).toArray();
    return NextResponse.json({ problems });
  } catch (error) {
    console.error('Error fetching problems:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// Create a new problem statement
export async function POST(req: NextRequest) {
  const adminEmail = req.headers.get('x-admin-email');
  if (!adminEmail || !adminEmails.includes(adminEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = new MongoClient(uri, {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true,
  });

  try {
    await client.connect();
    const db = client.db();
    
    const problemData = await req.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'domain', 'techStacks', 'source'];
    const missingFields = requiredFields.filter(field => !problemData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Create the problem statement
    const newProblem: Partial<ProblemStatement> = {
      ...problemData,
      submissions: [],
      previousImplementations: [],
      previousAttempts: [],
      isActive: true,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    const result = await db.collection('problems').insertOne(newProblem);

    return NextResponse.json({ 
      message: 'Problem statement created successfully',
      problemId: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating problem statement:', error);
    return NextResponse.json({ 
      error: 'Failed to create problem statement',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }, { status: 500 });
  } finally {
    await client.close();
  }
}

// Update a problem statement
export async function PUT(req: NextRequest) {
  const adminEmail = req.headers.get('x-admin-email');
  if (!adminEmail || !adminEmails.includes(adminEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = new MongoClient(uri, {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true,
  });

  try {
    await client.connect();
    const db = client.db();
    
    const { problemId, updates } = await req.json();
    
    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    const result = await db.collection('problems').updateOne(
      { _id: new ObjectId(problemId) },
      { 
        $set: {
          ...updates,
          lastUpdated: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Problem statement not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Problem statement updated successfully'
    });

  } catch (error) {
    console.error('Error updating problem statement:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// Delete a problem statement
export async function DELETE(req: NextRequest) {
  const adminEmail = req.headers.get('x-admin-email');
  if (!adminEmail || !adminEmails.includes(adminEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = new MongoClient(uri, {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true,
  });

  try {
    await client.connect();
    const db = client.db();
    
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get('problemId');
    
    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    const result = await db.collection('problems').deleteOne({ _id: new ObjectId(problemId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Problem statement not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Problem statement deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting problem statement:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await client.close();
  }
} 