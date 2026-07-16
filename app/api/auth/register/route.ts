import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createVerificationCode } from '@/lib/verification';
import { sendMail, emailVerificationHtml } from '@/lib/email';
import { logError } from '@/lib/logger';

const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role:     z.enum(['CLIENT', 'CLEANER']).default('CLIENT'),
  phone:    z.string().optional(),
  ref:      z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { name, email, password, role, phone, ref } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isVerified: true },
    });

    // A fully verified account is a real conflict. But an UNVERIFIED account
    // means the person signed up before and never confirmed their email
    // (e.g. the code never arrived) — let them restart signup instead of
    // getting permanently locked out with "email already registered".
    if (existingUser && existingUser.isVerified) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    // Cleaner referral program: only cleaner → cleaner referrals count.
    let referredById: string | undefined;
    if (role === 'CLEANER' && ref) {
      const referrer = await prisma.user.findUnique({ where: { id: ref }, select: { id: true, role: true } });
      if (referrer && referrer.role === 'CLEANER' && referrer.id !== existingUser?.id) {
        referredById = referrer.id;
      }
    }

    const user = await prisma.$transaction(async (tx) => {
      if (existingUser) {
        // Reclaim the unverified account: refresh credentials & details, keep the same id.
        const updated = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            name, password: hashedPassword,
            role: role as 'CLIENT' | 'CLEANER',
            isVerified: role === 'CLIENT',
            ...(phone ? { phone } : {}),
            ...(referredById ? { referredById } : {}),
          },
        });
        if (role === 'CLEANER') {
          await tx.cleanerStats.upsert({
            where:  { cleanerId: updated.id },
            create: { cleanerId: updated.id },
            update: {},
          });
        }
        return updated;
      }

      const created = await tx.user.create({
        data: {
          name, email, password: hashedPassword,
          role: role as 'CLIENT' | 'CLEANER',
          isVerified: role === 'CLIENT',
          ...(phone ? { phone } : {}),
          ...(referredById ? { referredById } : {}),
        },
      });
      if (role === 'CLEANER') {
        await tx.cleanerStats.create({ data: { cleanerId: created.id } });
      }
      return created;
    });

    if (role === 'CLEANER') {
      // Send verification email. Report whether it actually went out so the
      // client can tell the user to use "resend" rather than hitting a dead end.
      let emailSent = false;
      try {
        const code = await createVerificationCode(user.id, email, 'EMAIL_VERIFICATION');
        await sendMail({
          to:      email,
          subject: 'Confirm your email — Verliks',
          html:    emailVerificationHtml(code, name),
        });
        emailSent = true;
      } catch (mailErr: any) {
        // Don't fail registration — but log it (AppLog) so email outages are visible.
        logError('[register] email send failed', mailErr);
      }

      return NextResponse.json(
        {
          message: emailSent
            ? 'Account created! Check your email to verify your account.'
            : "Account created, but we couldn't send your code right now. Use \"Resend code\" in a moment.",
          emailSent,
        },
        { status: 201 },
      );
    }

    return NextResponse.json({ message: 'Account created successfully!' }, { status: 201 });

  } catch (error: any) {
    logError('[register]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
