import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await prisma.siteConfig.findUnique({ where: { id: 'singleton' } });
  const res = NextResponse.json({
    heroVideoUrl: config?.heroVideoUrl ?? null,
  });
  res.headers.set('Access-Control-Allow-Origin', '*');
  return res;
}
