import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const publicRoutes = [
    '/auth/login', '/auth/register',
    '/', '/request', '/about', '/privacy', '/terms', '/app',
  ];

  if (publicRoutes.includes(pathname)) {
    if (isLoggedIn && ['/auth/login', '/auth/register'].includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/dashboard/admin')) {
    const role = (req.auth as any)?.user?.role;
    if (!isLoggedIn || role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }
  } else if (pathname.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/login', req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
