import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createVerificationCode } from '@/lib/verification';
import { sendMail, emailVerificationHtml } from '@/lib/email';

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

    // always return success to avoid user enumeration
    if (!user || user.isVerified) {
      return NextResponse.json({ message: 'A new code was sent if that email exists.' });
    }

    const code = await createVerificationCode(user.id, email, 'EMAIL_VERIFICATION');

    try {
      await sendMail({
        to:      email,
        subject: 'Verification code — BrazilianClean',
        html:    emailVerificationHtml(code, user.name ?? 'there'),
      });
    } catch (mailErr: any) {
      console.error('[resend-verification] email send failed:', mailErr?.message ?? mailErr);
    }

    return NextResponse.json({ message: 'New code sent to your email.' });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
