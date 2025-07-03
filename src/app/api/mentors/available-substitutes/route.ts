import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export async function GET(request: Request) {
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Get the slot details from query params
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const timeSlot = searchParams.get('timeSlot');
  const slot = searchParams.get('slot');
  const currentMentor = searchParams.get('currentMentor');

  if (!date || !timeSlot || !slot || !currentMentor) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const client = new MongoClient(uri, {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverApi: { version: '1', strict: true, deprecationErrors: true }
  });

  try {
    await client.connect();
    const db = client.db();

    // Find all mentors who have sessions in the same slot
    const busyMentors = await db.collection('sessions')
      .find({
        date: new Date(date),
        timeSlot: timeSlot,
        slot: slot,
        $or: [
          { studentMentor1: { $exists: true } },
          { studentMentor2: { $exists: true } },
          { 'substitutedMentor1.substituteMentor': { $exists: true } },
          { 'substitutedMentor2.substituteMentor': { $exists: true } }
        ]
      })
      .project({
        studentMentor1: 1,
        studentMentor2: 1,
        'substitutedMentor1.substituteMentor': 1,
        'substitutedMentor2.substituteMentor': 1
      })
      .toArray();

    // Extract all busy mentor usernames
    const busyMentorSet = new Set<string>();
    busyMentors.forEach(session => {
      if (session.studentMentor1) busyMentorSet.add(session.studentMentor1);
      if (session.studentMentor2) busyMentorSet.add(session.studentMentor2);
      if (session.substitutedMentor1?.substituteMentor) {
        busyMentorSet.add(session.substitutedMentor1.substituteMentor);
      }
      if (session.substitutedMentor2?.substituteMentor) {
        busyMentorSet.add(session.substitutedMentor2.substituteMentor);
      }
    });

    // Get all mentors except those who are busy and the current mentor
    const availableMentors = await db.collection('mentors')
      .find({
        username: {
          $nin: [...busyMentorSet, currentMentor],
          $exists: true
        },
        isSubMentor: { $ne: true } // Exclude sub-mentors
      })
      .project({
        username: 1,
        email: 1,
        _id: 0
      })
      .toArray();

    return NextResponse.json(availableMentors);
  } catch (error: unknown) {
    console.error('Error fetching available mentors:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }, { status: 500 });
  } finally {
    await client.close();
  }
} 