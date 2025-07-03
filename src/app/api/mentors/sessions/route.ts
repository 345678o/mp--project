import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { Session, SessionStatus } from '@/data/session.model';

const uri = process.env.MONGODB_URI!;
const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');

export async function GET(req: NextRequest) {
  const username = req.headers.get('x-mentor-username');
  if (!username) {
    return NextResponse.json({ error: 'Mentor username required' }, { status: 400 });
  }

  const client = new MongoClient(uri, {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true, // Only for development
    serverApi: { version: '1', strict: true, deprecationErrors: true }
  });

  try {
    await client.connect();
    const db = client.db();
    // Find sessions where the mentor is involved
    const sessions = await db.collection('sessions').find({
      $or: [
        { facultyMentor: username },
        { studentMentor1: username },
        { studentMentor2: username },
        { 'substitutedMentor1.originalMentor': username },
        { 'substitutedMentor1.substituteMentor': username },
        { 'substitutedMentor2.originalMentor': username },
        { 'substitutedMentor2.substituteMentor': username },
        { subMentor: username }
      ],
    }).toArray();

    // Ensure all sessions have a status
    const processedSessions = sessions.map(session => ({
      ...session,
      status: session.status || 'pending' as SessionStatus,
      lastUpdated: session.lastUpdated || new Date()
    }));

    return NextResponse.json({ sessions: processedSessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(req: NextRequest) {
  const client = new MongoClient(uri, {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true, // Only for development
    serverApi: { version: '1', strict: true, deprecationErrors: true }
  });

  try {
    await client.connect();
    const db = client.db();
    if (req.headers.get('content-type')?.includes('multipart/form-data')) {
      // Mentor updating session progress and attendance image
      const formData = await req.formData();
      const sessionId = formData.get('sessionId') as string;
      const sessionProgress = formData.get('sessionProgress') as string;
      let attendanceImage = '';
      const file = formData.get('attendanceImage') as File | null;
      if (file && file.name) attendanceImage = `/uploads/${file.name}`;
      
      await db.collection('sessions').updateOne(
        { _id: new ObjectId(sessionId) },
        { 
          $set: { 
            sessionProgress, 
            attendanceImage,
            status: 'in-progress' as SessionStatus,
            lastUpdated: new Date()
          } 
        }
      );
      return NextResponse.json({ message: 'Session updated' });
    } else {
      // Auto-populate next week's session or admin creates session
      const adminEmail = req.headers.get('x-admin-email');
      if (!adminEmail || !adminEmails.includes(adminEmail)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const data = await req.json();
      if (data._id) delete data._id;
      
      // Convert date string to Date object if needed
      if (typeof data.date === 'string') {
        data.date = new Date(data.date);
      }

      // Ensure required fields
      const sessionData: Partial<Session> = {
        ...data,
        status: data.status || 'pending',
        lastUpdated: new Date()
      };

      await db.collection('sessions').insertOne(sessionData);
      return NextResponse.json({ message: 'Session created' });
    }
  } catch (error) {
    console.error('Error handling session:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await client.close();
  }
} 