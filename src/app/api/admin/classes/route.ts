import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { Class } from '@/data/class.model';

const uri = process.env.MONGODB_URI!;
const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');

// Get all classes
export async function GET(req: NextRequest) {
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
    const classes = await db.collection('classes').find({}).toArray();
    return NextResponse.json({ classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// Create a new class
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
    
    const classData = await req.json();
    
    // Validate required fields
    const requiredFields = ['name', 'section', 'startDate', 'facultyMentor', 'mentors'];
    const missingFields = requiredFields.filter(field => !classData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Create the class
    const newClass: Partial<Class> = {
      ...classData,
      startDate: new Date(classData.startDate),
      isActive: true,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    const result = await db.collection('classes').insertOne(newClass);

    return NextResponse.json({ 
      message: 'Class created successfully',
      classId: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// Update a class (including ending the spell)
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
    
    const { classId, updates } = await req.json();
    
    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    // If ending the spell
    if (updates.endSpell) {
      updates.endDate = new Date();
      updates.isActive = false;
    }

    const result = await db.collection('classes').updateOne(
      { _id: new ObjectId(classId) },
      { 
        $set: {
          ...updates,
          lastUpdated: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Class updated successfully'
    });

  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await client.close();
  }
} 