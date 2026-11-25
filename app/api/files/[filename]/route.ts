import { auth } from '@/lib/auth';
import { getObject } from '@/lib/storage';
import { NextResponse } from 'next/server';

// Private files (ID documents and selfies) stay off the public CDN. Only the cleaner
// who uploaded them and the admins can read them, always through this route.
// Name: v-<ownerId>-<uuid>.<ext>, as /api/upload writes it.
const PRIVATE_NAME = /^v-([A-Za-z0-9_-]+)-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/;

export async function GET(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const session  = await auth();
  const user     = session?.user as { id?: string; role?: string } | undefined;
  const { filename } = await params;
  const owner    = PRIVATE_NAME.exec(filename)?.[1];

  // One answer for "missing" and "not yours": a stranger learns nothing about the file.
  const notFound = NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!user?.id || !owner || (user.role !== 'ADMIN' && user.id !== owner)) return notFound;

  const res = await getObject(`private/${filename}`);
  if (!res.ok || !res.body) return notFound;

  return new Response(res.body, {
    headers: {
      'Content-Type':           res.headers.get('content-type') ?? 'application/octet-stream',
      'Cache-Control':          'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
