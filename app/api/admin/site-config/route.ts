import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteVideoFromCloudinary } from '@/lib/cloudinary';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'ADMIN') return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const config = await prisma.siteConfig.findUnique({ where: { id: 'singleton' } });
  return NextResponse.json({ heroVideoUrl: config?.heroVideoUrl ?? null });
}

export async function DELETE() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const config = await prisma.siteConfig.findUnique({ where: { id: 'singleton' } });
    if (config?.heroVideoPublicId) {
      await deleteVideoFromCloudinary(config.heroVideoPublicId);
    }
    await prisma.siteConfig.upsert({
      where:  { id: 'singleton' },
      update: { heroVideoUrl: null, heroVideoPublicId: null },
      create: { id: 'singleton', heroVideoUrl: null, heroVideoPublicId: null },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logError('[DELETE /api/admin/site-config]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
