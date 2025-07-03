import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI!;
const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');

export async function POST(req: NextRequest) {
  const adminEmail = req.headers.get('x-admin-email');
  if (!adminEmail || !adminEmails.includes(adminEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await req.json();
  const { username, password, ...rest } = data;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const exists = await db.collection('mentors').findOne({ username });
    if (exists) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.collection('mentors').insertOne({ username, password: hashed, ...rest });
    return NextResponse.json({ message: 'Mentor created' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await client.close();
  }
} 