import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { verifyCode } from '@/lib/verification';

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const { email, code } = validation.data;
    const result = await verifyCode(email, code, 'EMAIL_VERIFICATION');

    if (!result.valid) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: result.userId },
      data: { isVerified: true },
    });

    return NextResponse.json({ message: 'Email verificado com sucesso!' });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
