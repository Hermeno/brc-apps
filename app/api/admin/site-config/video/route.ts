import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'node:crypto';
import { deleteObject, publicUrl, putObject } from '@/lib/storage';
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

    const VIDEO_EXT: Record<string, string> = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };
    const ext = VIDEO_EXT[file.type];
    if (!ext) return NextResponse.json({ error: 'Use an MP4, WEBM or MOV video.' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Delete old video if it exists
    const existing = await prisma.siteConfig.findUnique({ where: { id: 'singleton' } });
    if (existing?.heroVideoPublicId) {
      await deleteObject(existing.heroVideoPublicId).catch(() => {});
    }

    // heroVideoPublicId now holds the Spaces key, which is what deleting needs.
    const publicId = `videos/${randomUUID()}.${ext}`;
    await putObject(publicId, buffer, file.type, true);
    const url = publicUrl(publicId);

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
