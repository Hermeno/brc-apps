import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadVideoToCloudinary, deleteVideoFromCloudinary } from '@/lib/cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== 'ADMIN') return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('video') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const maxMb = 200;
    if (file.size > maxMb * 1024 * 1024) {
      return NextResponse.json({ error: `File exceeds ${maxMb}MB limit` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Delete old video if it exists
    const existing = await prisma.siteConfig.findUnique({ where: { id: 'singleton' } });
    if (existing?.heroVideoPublicId) {
      await deleteVideoFromCloudinary(existing.heroVideoPublicId).catch(() => {});
    }

    const { url, publicId } = await uploadVideoToCloudinary(buffer, {
      folder: 'brazilianclean/landing',
    });

    await prisma.siteConfig.upsert({
      where:  { id: 'singleton' },
      update: { heroVideoUrl: url, heroVideoPublicId: publicId },
      create: { id: 'singleton', heroVideoUrl: url, heroVideoPublicId: publicId },
    });

    return NextResponse.json({ heroVideoUrl: url });
  } catch (err) {
    logError('[POST /api/admin/site-config/video]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
