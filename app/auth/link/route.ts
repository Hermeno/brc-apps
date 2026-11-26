import { redirect } from 'next/navigation';

// Sign-in links in client emails were withdrawn on 11-26: anyone holding the email could
// enter the account. Links already sent land on the login page instead of a 404.
// shortcut: delete this route after 2026-12-03, once those emails are a week old.
export const dynamic = 'force-dynamic';

export function GET() {
  redirect('/auth/login?link=expired');
}
