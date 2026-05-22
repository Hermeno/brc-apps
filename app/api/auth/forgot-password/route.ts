import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createVerificationCode } from '@/lib/verification';
import { sendMail, passwordResetHtml } from '@/lib/email';

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
    if (!user) {
      return NextResponse.json({ message: 'A reset code was sent if that email exists.' });
    }

    const code = await createVerificationCode(user.id, email, 'PASSWORD_RESET');

    try {
      await sendMail({
        to:      email,
        subject: 'Password reset — BrazilianClean',
        html:    passwordResetHtml(code, user.name ?? 'there'),
      });
    } catch (mailErr: any) {
      console.error('[forgot-password] email send failed:', mailErr?.message ?? mailErr);
    }

    return NextResponse.json({ message: 'Password reset code sent to your email.' });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
