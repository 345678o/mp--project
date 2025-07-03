import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');

export async function GET(req: NextRequest) {
  const adminEmail = req.headers.get('x-admin-email');
  if (!adminEmail || !adminEmails.includes(adminEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    const sessions = await db.collection('sessions').find({
      date: { $gte: today, $lt: dayAfter }
    }).sort({ date: 1, slot: 1 }).toArray();
    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await client.close();
  }
}

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
    
    const sessionData = await req.json();
    
    // Validate required fields
    const requiredFields = ['className', 'section', 'day', 'timeSlot', 'date', 'studentMentor1', 'studentMentor2', 'facultyMentor'];
    const missingFields = requiredFields.filter(field => !sessionData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Find or create the class
    let classDoc = await db.collection('classes').findOne({
      name: sessionData.className,
      section: sessionData.section,
      isActive: true
    });

    if (!classDoc) {
      // Create a new class
      const newClass = {
        name: sessionData.className,
        section: sessionData.section,
        startDate: new Date(sessionData.date),
        isActive: true,
        mentors: [sessionData.studentMentor1, sessionData.studentMentor2],
        facultyMentor: sessionData.facultyMentor,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      const result = await db.collection('classes').insertOne(newClass);
      classDoc = { ...newClass, _id: result.insertedId };
    }

    // Ensure date is a valid Date object
    sessionData.date = new Date(sessionData.date);
    if (isNaN(sessionData.date.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Create the session with class reference
    const newSession = {
      ...sessionData,
      classId: classDoc._id,
      slot: sessionData.timeSlot, // For backward compatibility
      createdAt: new Date(),
      lastUpdated: new Date(),
      status: 'pending'
    };

    const result = await db.collection('sessions').insertOne(newSession);

    return NextResponse.json({ 
      message: 'Session created successfully',
      sessionId: result.insertedId,
      classId: classDoc._id
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ 
      error: 'Failed to create session',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }, { status: 500 });
  } finally {
    await client.close();
  }
} 