import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

const schema = z.object({
  email: z.string().email(),
  code:  z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const { email, code } = validation.data;

    // Find token first (without deleting) so we can retry if the update fails
    const record = await prisma.verificationToken.findFirst({
      where: { email, code, type: 'EMAIL_VERIFICATION' },
    });

    if (!record) {
      return NextResponse.json({ error: 'Invalid code. Please check the email and try again.' }, { status: 400 });
    }

    if (record.expiresAt < new Date()) {
      // Token is expired — clean it up so resend can create a fresh one
      await prisma.verificationToken.delete({ where: { id: record.id } }).catch(() => {});
      return NextResponse.json({ error: 'Code expired. Click "Send a new code" to get a fresh one.' }, { status: 400 });
    }

    // Atomically mark user verified AND delete the token — if either fails, nothing changes
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { isVerified: true } }),
      prisma.verificationToken.delete({ where: { id: record.id } }),
    ]);

    return NextResponse.json({ message: 'Email verified successfully!' });
  } catch (err: any) {
    logError('[verify-email]', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
