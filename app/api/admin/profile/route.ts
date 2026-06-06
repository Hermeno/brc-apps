import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true, id: true } });
    if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { name, email, phone, newPassword } = await req.json();

    const data: Record<string, any> = {};
    if (name)        data.name  = name;
    if (email)       data.email = email;
    if (phone)       data.phone = phone;
    if (newPassword) data.password = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({ where: { id: me.id }, data });
    return NextResponse.json({ ok: true, name: user.name, email: user.email });
  } catch (err: any) {
    console.error('[PATCH /api/admin/profile]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
