import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const DEFAULTS = [
  { id: 'BASIC',   price: 29 },
  { id: 'PREMIUM', price: 49 },
  { id: 'PRO',     price: 79 },
];

export async function GET() {
  try {
    const configs = await prisma.planConfig.findMany();
    const result = DEFAULTS.map(d => {
      const db = configs.find(c => c.id === d.id);
      return { id: d.id, price: db?.price ?? d.price };
    });
    return NextResponse.json(result);
  } catch {
    // Table doesn't exist yet — return defaults
    return NextResponse.json(DEFAULTS);
  }
}
