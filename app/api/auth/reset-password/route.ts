import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { verifyCode } from '@/lib/verification';

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, code, password } = validation.data;
    const result = await verifyCode(email, code, 'PASSWORD_RESET');

    if (!result.valid) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    await prisma.user.update({
      where: { id: result.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Senha redefinida com sucesso!' });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
