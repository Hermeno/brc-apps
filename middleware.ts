import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

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
  // Only run middleware on routes that actually need auth checking.
  // A broad matcher that includes public routes (like /) causes the NextAuth
  // wrapper to run for those requests; behind DO App Platform's proxy it emits
  // a 307 redirect to the same URL before our callback is reached → redirect loop.
  // /auth/* and /api/auth/* are handled directly by NextAuth handlers — no middleware needed.
  matcher: ['/app', '/dashboard/:path*'],
};
