import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { enforceRateLimit, AUTH_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const schema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(8),
  secret:   z.string(),
});

export async function POST(request: NextRequest) {
  // The only thing between a caller and an ADMIN account is this secret.
  const limited = await enforceRateLimit(request, 'auth:setup-admin', AUTH_LIMITS.setupAdmin);
  if (limited) return limited;

  const setupSecret = process.env.ADMIN_SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json({ error: 'Setup not configured' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { name, email, password, secret } = validation.data;

    if (secret !== setupSecret) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await prisma.user.upsert({
      where:  { email },
      update: { name, password: hashedPassword, role: 'ADMIN', isVerified: true },
      create: { name, email, password: hashedPassword, role: 'ADMIN', isVerified: true },
    });

    return NextResponse.json({ message: 'Admin created successfully' }, { status: 201 });
  } catch (err: any) {
    console.error('[setup-admin]', err?.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
