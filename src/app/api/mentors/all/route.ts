import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
console.log('Server-side admin emails:', adminEmails);

export async function GET(req: NextRequest) {
  const adminEmail = req.headers.get('x-admin-email');
  console.log('Received admin email in header:', adminEmail);
  console.log('Admin emails from env:', adminEmails);
  
  if (!adminEmail || !adminEmails.includes(adminEmail)) {
    console.log('Unauthorized: Email not in admin list');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const mentors = await db.collection('mentors').find({}).toArray();
    return NextResponse.json({ mentors });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await client.close();
  }
} 