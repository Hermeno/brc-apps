import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';

// The button in client emails (lib/login-link.ts). Signing in here, on the server, means
// the browser never renders a page with the token in its URL, where the Meta Pixel in the
// root layout would report it to Facebook.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t') ?? '';
  const next  = req.nextUrl.searchParams.get('next') ?? '';
  // Our own dashboard only; a relative redirect never leaves the site, whatever the proxy says the host is.
  const dest  = next.startsWith('/dashboard') ? next : '/dashboard/client';
  try {
    await signIn('link', { token, redirectTo: dest, redirect: false }); // sets the session cookie
  } catch (e) {
    if (!(e instanceof AuthError)) throw e;
    redirect('/auth/login?link=expired');
  }
  redirect(dest);
}
