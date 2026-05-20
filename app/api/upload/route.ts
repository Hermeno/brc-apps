import { auth } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { NextRequest, NextResponse } from 'next/server';

const MAX_SIZE    = 8 * 1024 * 1024; // 8 MB
const ALLOWED     = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const FOLDER_MAP: Record<string, string> = {
  avatar:       'brazilianclean/avatars',
  verification: 'brazilianclean/verification',
  lead:         'brazilianclean/leads',
  gallery:      'brazilianclean/gallery',
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file     = formData.get('file') as File | null;
  const type     = (formData.get('type') as string | null) ?? 'avatar';

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type. Use JPG, PNG, WEBP or GIF.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum 8 MB.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = FOLDER_MAP[type] ?? 'brazilianclean/misc';

  const url = await uploadToCloudinary(buffer, { folder });
  return NextResponse.json({ url });
}
