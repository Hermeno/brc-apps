import { randomUUID } from 'node:crypto';
import { auth } from '@/lib/auth';
import { imageType, publicUrl, putObject } from '@/lib/storage';
import { logError } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

const PUBLIC_FOLDERS: Record<string, string> = {
  avatar:  'avatars',
  lead:    'leads',
  gallery: 'gallery',
};

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId  = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file     = formData.get('file') as File | null;
  const type     = (formData.get('type') as string | null) ?? 'avatar';

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum 8 MB.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const kind   = imageType(buffer);
  if (!kind) {
    return NextResponse.json({ error: 'Unsupported file type. Use JPG, PNG, WEBP or GIF.' }, { status: 400 });
  }

  try {
    // ID documents are never public: stored privately and read through /api/files,
    // by their owner or an admin. The owner's id is part of the name for that check.
    if (type === 'verification') {
      const name = `v-${userId}-${randomUUID()}.${kind.ext}`;
      await putObject(`private/${name}`, buffer, kind.mime, false);
      return NextResponse.json({ url: `/api/files/${name}` });
    }

    const key = `${PUBLIC_FOLDERS[type] ?? 'misc'}/${randomUUID()}.${kind.ext}`;
    await putObject(key, buffer, kind.mime, true);
    return NextResponse.json({ url: publicUrl(key) });
  } catch (err) {
    logError('[POST /api/upload]', err);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
