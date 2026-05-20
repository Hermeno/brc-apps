import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { runMatching } from '@/lib/matching';
import { calculateLeadPrice, getLeadPriceConfig } from '@/lib/pricing';
import dns from 'dns/promises';

// Extract a 5-digit US ZIP code from an address string
function extractZip(address: string): string | null {
  const match = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return match ? match[1] : null;
}

// Resolve MX records for an email's domain; returns false on NXDOMAIN / timeout
async function hasMxRecords(email: string): Promise<boolean> {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;
    const records = await Promise.race([
      dns.resolveMx(domain),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ]) as Awaited<ReturnType<typeof dns.resolveMx>>;
    return records.length > 0;
  } catch {
    return false;
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({
    where: { clientId: dbUser.id },
    include: {
      cleaner: { select: { name: true, email: true } },
      conversations: {
        where: { status: { in: ['active', 'declined'] } },
        select: { id: true, cleanerId: true, status: true, cleaner: { select: { id: true, name: true, avatarUrl: true, isVerified: true } } },
      },
      review: { select: { rating: true, comment: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ leads });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    serviceType, address, notes, dateTime,
    bedrooms, bathrooms, squareMeters, extras, frequency,
    estimatedMinPrice, estimatedMaxPrice, estimatedHours,
    photos, clientPhone,
  } = body;

  if (!serviceType || !address || !dateTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Resolve user ID from DB using email (reliable regardless of JWT version)
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const parsedDate = new Date(dateTime);
  if (isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date/time' }, { status: 400 });
  }

  // Load DB-backed pricing config (multipliers + coverage)
  const priceConfig = await getLeadPriceConfig();

  // ── ZIP coverage check ────────────────────────────────────────────────────────
  const zip = extractZip(address ?? '');
  if (priceConfig.coverageZips.length > 0 && zip && !priceConfig.coverageZips.includes(zip)) {
    return NextResponse.json(
      { error: 'Service is not available in your area yet. Check back soon!' },
      { status: 422 },
    );
  }

  // ── Email MX validation (quality flag — non-blocking) ────────────────────────
  const emailValid = await hasMxRecords(session.user.email!);
  const qualityScore = emailValid ? 1 : 0;

  // ── Calculate lead price at creation time ────────────────────────────────────
  const leadPrice = calculateLeadPrice(serviceType, parsedDate, frequency ?? 'once', priceConfig);

  try {
    const lead = await prisma.lead.create({
      data: {
        clientId: dbUser.id,
        serviceType,
        address,
        notes:            notes || null,
        dateTime:         parsedDate,
        latitude:         0,
        longitude:        0,
        status:           'NEW',
        bedrooms:         bedrooms     ?? 1,
        bathrooms:        bathrooms    ?? 1,
        squareMeters:     squareMeters ?? 0,
        extras:           Array.isArray(extras) ? extras : [],
        frequency:        frequency    ?? 'once',
        photos:           Array.isArray(photos) ? photos.filter(Boolean).slice(0, 4) : [],
        clientPhone:      clientPhone  || null,
        estimatedMinPrice: estimatedMinPrice ?? null,
        estimatedMaxPrice: estimatedMaxPrice ?? null,
        estimatedHours:   estimatedHours    ?? null,
        zipCode:          zip,
        leadPrice,
        qualityScore,
      },
    });

    // Trigger matching asynchronously (fire-and-forget)
    runMatching(lead.id).catch(e => console.error('[matching]', e));

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/leads] Prisma error:', err);
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 });
  }
}
