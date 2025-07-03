import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
const TEMP_ADMIN_EMAIL = process.env.TEMP_ADMIN_EMAIL || 'admin@example.com';

export async function POST() {
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

    // Generate random username and password
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const username = `admin${randomNum}`;
    const password = `Admin${randomNum}!${Math.random().toString(36).slice(2, 6)}`;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    await db.collection('mentors').insertOne({
      username,
      password: hashedPassword,
      email: TEMP_ADMIN_EMAIL,
      isAdmin: true,
      Branch: 'Admin',
      Section: 'Admin',
      CIE_Department: 'Admin',
      GraduationYear: 'N/A',
      CurrentYear: 'N/A',
      sessions_taken_overall: '0',
      current_sem_sessions_taken: '0',
      createdAt: new Date(),
      lastLogin: null
    });

    // Add email to ADMIN_EMAILS in .env if not already present
    const currentEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!currentEmails.includes(TEMP_ADMIN_EMAIL)) {
      process.env.ADMIN_EMAILS = [...currentEmails, TEMP_ADMIN_EMAIL].filter(Boolean).join(',');
    }

    return NextResponse.json({
      message: 'Admin credentials generated successfully',
      credentials: {
        username,
        password,
        email: TEMP_ADMIN_EMAIL
      }
    });
  } catch (error) {
    console.error('Error generating admin credentials:', error);
    return NextResponse.json({ error: 'Failed to generate admin credentials' }, { status: 500 });
  } finally {
    await client.close();
  }
} 