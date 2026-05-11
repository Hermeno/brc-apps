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
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const { email } = validation.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // always return success to avoid user enumeration
    if (!user) {
      return NextResponse.json({ message: 'Se o email existir, um código foi enviado.' });
    }

    const code = await createVerificationCode(user.id, email, 'PASSWORD_RESET');

    await sendMail({
      to: email,
      subject: 'Redefinição de senha — BrazilianClean',
      html: passwordResetHtml(code, user.name ?? 'usuário'),
    });

    return NextResponse.json({ message: 'Código de redefinição enviado para seu email.' });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
