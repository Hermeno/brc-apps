import { NextResponse } from 'next/server';

// Files are now served directly from Cloudinary.
// This route exists only for backwards compatibility with any old /tmp URLs.
export async function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
