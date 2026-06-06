import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, phone: true, address: true, avatarUrl: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ user });
  } catch (err: any) {
    console.error('[GET /api/client/profile]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, phone, address, avatarUrl } = await req.json();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name      !== undefined && { name:      name || null }),
        ...(phone     !== undefined && { phone:     phone || null }),
        ...(address   !== undefined && { address:   address || null }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }),
      },
      select: { name: true, phone: true, address: true, avatarUrl: true },
    });

    return NextResponse.json({ user: updated });
  } catch (err: any) {
    console.error('[PUT /api/client/profile]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
