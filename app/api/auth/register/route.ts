import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createVerificationCode } from '@/lib/verification';
import { sendMail, emailVerificationHtml } from '@/lib/email';

const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role:     z.enum(['CLIENT', 'CLEANER']).default('CLIENT'),
  phone:    z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { name, email, password, role, phone } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name, email, password: hashedPassword,
          role: role as 'CLIENT' | 'CLEANER',
          isVerified: role === 'CLIENT',
          ...(phone ? { phone } : {}),
        },
      });
      if (role === 'CLEANER') {
        await tx.cleanerStats.create({ data: { cleanerId: created.id } });
      }
      return created;
    });

    if (role === 'CLEANER') {
      // Send verification email — non-fatal if email provider is misconfigured
      try {
        const code = await createVerificationCode(user.id, email, 'EMAIL_VERIFICATION');
        await sendMail({
          to:      email,
          subject: 'Confirm your email — BrazilianClean',
          html:    emailVerificationHtml(code, name),
        });
      } catch (mailErr: any) {
        // Log but don't fail registration — user can request a new verification email
        console.error('[register] email send failed:', mailErr?.message ?? mailErr);
      }

      return NextResponse.json(
        { message: 'Account created! Check your email to verify your account.' },
        { status: 201 },
      );
    }

    return NextResponse.json({ message: 'Account created successfully!' }, { status: 201 });

  } catch (error: any) {
    console.error('[register] error:', error?.message ?? error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
