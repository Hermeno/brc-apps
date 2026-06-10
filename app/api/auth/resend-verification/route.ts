import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createVerificationCode } from '@/lib/verification';
import { sendMail, emailVerificationHtml } from '@/lib/email';
import { logError } from '@/lib/logger';

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { email } = validation.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({ message: 'If that email exists, a new code was sent.' });
    }

    if (user.isVerified) {
      // Already verified — just tell them to log in
      return NextResponse.json({ message: 'This email is already verified. Please sign in.' });
    }

    const code = await createVerificationCode(user.id, email, 'EMAIL_VERIFICATION');

    await sendMail({
      to:      email,
      subject: 'Your new verification code — BrazilianClean',
      html:    emailVerificationHtml(code, user.name ?? 'there'),
    });

    return NextResponse.json({ message: 'New code sent to your email.' });
  } catch (err: any) {
    logError('[resend-verification]', err);
    return NextResponse.json({ error: 'Failed to send code. Please try again in a moment.' }, { status: 500 });
  }
}
