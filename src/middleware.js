import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Only run middleware on admin dashboard and video modification APIs
  const isDashboardRoute = pathname.startsWith('/admin/dashboard');
  
  const isApiVideoRoute = pathname.startsWith('/api/videos');
  const isProtectedApiMethod = ['POST', 'PUT', 'DELETE'].includes(request.method);
  
  if (isDashboardRoute || (isApiVideoRoute && isProtectedApiMethod)) {
    // Check for cookie
    const token = request.cookies.get('admin_session')?.value;
    
    if (!token) {
      if (isApiVideoRoute) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    // Verify token
    const parsed = await decrypt(token);
    if (!parsed || parsed.role !== 'admin') {
      if (isApiVideoRoute) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/api/videos/:path*'],
};
