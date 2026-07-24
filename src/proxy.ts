import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// These routes require the user to be logged in
const protectedRoutes = ['/dashboard', '/resume'];

// These routes should not be accessible if the user is already logged in
const authRoutes = ['/auth/login', '/auth/register'];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));

  // 1. If accessing a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 2. If accessing an auth route with a token, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. API Route Protection
  // Return early 401 for protected API routes to save backend compute
  if (path.startsWith('/api/resume') || path.startsWith('/api/ai')) {
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
