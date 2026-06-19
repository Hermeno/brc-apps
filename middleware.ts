import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes — always accessible
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/request', '/privacy', '/terms', '/about'];
  if (publicRoutes.includes(pathname)) {
    // Logged-in users trying to reach login/register → send to dashboard
    if (isLoggedIn && ['/auth/login', '/auth/register'].includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }
    return NextResponse.next();
  }

  // /app → logged-in goes to dashboard, guest goes to landing page
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
