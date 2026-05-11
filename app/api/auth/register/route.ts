import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createVerificationCode } from '@/lib/verification';
import { sendMail, emailVerificationHtml } from '@/lib/email';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  role: z.enum(['CLIENT', 'CLEANER']).default('CLIENT'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 },
      );
    }

    const { name, email, password, role } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 },
      );
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role as 'CLIENT' | 'CLEANER' },
    });

    if (role === 'CLEANER') {
      await prisma.cleanerStats.create({ data: { cleanerId: user.id } });
    }

    const code = await createVerificationCode(user.id, email, 'EMAIL_VERIFICATION');

    await sendMail({
      to: email,
      subject: 'Confirme seu email — BrazilianClean',
      html: emailVerificationHtml(code, name),
    });

    return NextResponse.json(
      { message: 'Conta criada! Verifique seu email para continuar.' },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
