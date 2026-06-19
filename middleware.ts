import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes — always accessible (auth/* excluded from matcher below)
  if (['/', '/request', '/privacy', '/terms', '/about'].includes(pathname)) {
    return NextResponse.next();
  }

  // /app → logged-in: dashboard, guest: landing page
  if (pathname === '/app') {
    return NextResponse.redirect(new URL(isLoggedIn ? '/dashboard' : '/', req.nextUrl));
  }

  // Protected: admin dashboard
  if (pathname.startsWith('/dashboard/admin')) {
    const role = (req.auth as any)?.user?.role;
    if (!isLoggedIn || role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }
    return NextResponse.next();
  }

  // Protected: all other dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/login', req.nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  // Exclude: Next.js internals, static assets, NextAuth API routes, and auth pages.
  // Auth pages (/auth/*) MUST be excluded — if the NextAuth wrapper runs for /auth/login
  // and encounters a proxy/HTTPS detection error, it redirects to the error page (/auth/login)
  // which triggers the middleware again → infinite redirect loop.
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/auth|auth/).*)',],
};
