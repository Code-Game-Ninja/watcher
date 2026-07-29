import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/auth';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    // Check against env password
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return NextResponse.json({ success: false, error: 'Admin password not configured on server' }, { status: 500 });
    }
    
    if (password !== adminPassword) {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }
    
    // Create JWT and set cookie
    const token = await encrypt({ role: 'admin' });
    
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set({
      name: 'admin_session',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 500 });
  }
}
