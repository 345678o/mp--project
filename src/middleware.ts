import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get stored credentials from cookies
  const adminEmail = request.cookies.get('adminEmail')?.value;
  const mentorUsername = request.cookies.get('mentorUsername')?.value;

  // Check if trying to access admin routes (except login)
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.includes('login')) {
    // If no admin email is stored, redirect to admin login
    if (!adminEmail) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Check if trying to access mentor routes (except login)
  if (request.nextUrl.pathname.startsWith('/mentors') && 
      !request.nextUrl.pathname.includes('login')) {
    // If no mentor username is stored, redirect to login
    if (!mentorUsername && !adminEmail) {
      return NextResponse.redirect(new URL('/mentors/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/mentors/:path*']
}; 