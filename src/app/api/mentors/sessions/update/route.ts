import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

export async function PUT(req: NextRequest) {
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { sessionId, updates } = await req.json();
    
    if (!sessionId || !updates) {
      return NextResponse.json({ error: 'Session ID and updates are required' }, { status: 400 });
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
      
      // Verify the session exists
      const session = await db.collection('sessions').findOne({
        _id: new ObjectId(sessionId)
      });

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      // Update the session
      const result = await db.collection('sessions').updateOne(
        { _id: new ObjectId(sessionId) },
        { 
          $set: {
            ...updates,
            lastUpdated: new Date()
          }
        }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json({ error: 'No changes made to session' }, { status: 400 });
      }

      // Get the updated session
      const updatedSession = await db.collection('sessions').findOne({
        _id: new ObjectId(sessionId)
      });

      return NextResponse.json(updatedSession);
    } finally {
      await client.close();
    }
  } catch (error: unknown) {
    console.error('Error updating session:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }, { status: 500 });
  }
} 