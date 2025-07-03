import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');

export async function POST(req: NextRequest) {
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Create MongoDB client with specific TLS options
    const client = new MongoClient(uri, {
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true, // Only for development
      serverApi: { version: '1', strict: true, deprecationErrors: true }
    });
    
    try {
      await client.connect();
      const db = client.db();
      const mentor = await db.collection('mentors').findOne({ username });
      
      if (!mentor) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      
      const valid = await bcrypt.compare(password, mentor.password);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // Check if mentor's email is in admin list
      const isAdmin = adminEmails.includes(mentor.email);
      console.log('Login - Email:', mentor.email, 'Is admin:', isAdmin);

      return NextResponse.json({ 
        message: 'Login successful',
        email: mentor.email,
        isAdmin
      });
    } finally {
      await client.close();
    }
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined 
    }, { status: 500 });
  }
} 