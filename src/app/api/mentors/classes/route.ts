import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;

export async function GET(req: NextRequest) {
  const username = req.headers.get('x-mentor-username');
  if (!username) {
    return NextResponse.json({ error: 'Mentor username required' }, { status: 400 });
  }

  const client = new MongoClient(uri, {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true,
  });

  try {
    await client.connect();
    const db = client.db();
    
    // Get all classes where the mentor is listed
    const classes = await db.collection('classes')
      .find({
        $or: [
          { mentors: username },
          { facultyMentor: username }
        ]
      })
      .toArray();

    // Separate active and inactive classes
    const activeClasses = classes.filter(c => c.isActive);
    const previousClasses = classes.filter(c => !c.isActive);

    // For each class, get the associated sessions
    const classesWithSessions = await Promise.all([...activeClasses, ...previousClasses].map(async (cls) => {
      const sessions = await db.collection('sessions')
        .find({ classId: cls._id })
        .sort({ date: -1 })
        .toArray();

      return {
        ...cls,
        sessions
      };
    }));

    // Split back into active and previous
    const activeClassesWithSessions = classesWithSessions.slice(0, activeClasses.length);
    const previousClassesWithSessions = classesWithSessions.slice(activeClasses.length);

    return NextResponse.json({ 
      activeClasses: activeClassesWithSessions,
      previousClasses: previousClassesWithSessions
    });

  } catch (error) {
    console.error('Error fetching mentor classes:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch classes',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }, { status: 500 });
  } finally {
    await client.close();
  }
} 