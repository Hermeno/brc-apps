import { prisma } from '@/lib/prisma';

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createVerificationCode(
  userId: string,
  email: string,
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET',
) {
  // invalidate any previous pending code for this email+type
  await prisma.verificationToken.deleteMany({ where: { email, type } });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.verificationToken.create({
    data: { userId, email, code, type, expiresAt },
  });

  return code;
}

export async function verifyCode(
  email: string,
  code: string,
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET',
) {
  const record = await prisma.verificationToken.findFirst({
    where: { email, code, type },
  });

  if (!record) return { valid: false, reason: 'Código inválido.' };
  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return { valid: false, reason: 'Código expirado. Solicite um novo.' };
  }

  await prisma.verificationToken.delete({ where: { id: record.id } });
  return { valid: true, userId: record.userId };
}
