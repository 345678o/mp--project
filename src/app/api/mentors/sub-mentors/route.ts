import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export async function GET() {
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
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
    
    // Get mentors who are marked as sub-mentors
    const subMentors = await db.collection('mentors')
      .find({ isSubMentor: true })
      .project({ username: 1, email: 1, _id: 0 })
      .toArray();

    return NextResponse.json(subMentors);
  } catch (error: unknown) {
    console.error('Error fetching sub-mentors:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }, { status: 500 });
  } finally {
    await client.close();
  }
} 