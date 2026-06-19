import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { runMatching } from '@/lib/matching';
import { calculateLeadPrice, getLeadPriceConfig } from '@/lib/pricing';
import { coordsFromZip } from '@/lib/geo';
import dns from 'dns/promises';
import { logError } from '@/lib/logger';

// Extract a 5-digit US ZIP code from an address string
function extractZip(address: string): string | null {
  const match = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return match ? match[1] : null;
}

// Resolve MX records for an email domain; returns false on NXDOMAIN / timeout
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

  try {
    const dbUser = await prisma.user.findUnique({
      where:  { email: session.user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      where: { clientId: dbUser.id },
      include: {
        cleaner:       { select: { name: true, avatarUrl: true } },
        conversations: {
          where:  { status: { in: ['active', 'declined'] } },
          select: {
            id: true, cleanerId: true, status: true, feeStatus: true,
            cleaner: { select: { id: true, name: true, avatarUrl: true, isVerified: true } },
          },
        },
        review: { select: { rating: true, comment: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ leads });
  } catch (err: any) {
    logError('[GET /api/leads]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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

    const dbUser = await prisma.user.findUnique({
      where:  { email: session.user.email! },
      select: { id: true, phone: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const parsedDate = new Date(dateTime);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date/time' }, { status: 400 });
    }

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    if (parsedDate > maxDate) {
      return NextResponse.json(
        { error: 'Booking date must be within the next 90 days.' },
        { status: 400 },
      );
    }

    const activeCount = await prisma.lead.count({
      where: {
        clientId: dbUser.id,
        status:   { in: ['NEW', 'WAVE2', 'WAVE3', 'IN_REVIEW', 'ACCEPTED'] },
      },
    });
    if (activeCount >= 5) {
      return NextResponse.json(
        { error: 'You have too many active bookings. Please complete or cancel some first.' },
        { status: 429 },
      );
    }

    const priceConfig = await getLeadPriceConfig();

    // ── ZIP extraction + geocoding ────────────────────────────────────────────
    const zip       = extractZip(address ?? '');
    const zipCoords = zip ? coordsFromZip(zip) : null;

    // Coverage check (only active when admin has set specific ZIPs)
    if (priceConfig.coverageZips.length > 0 && zip && !priceConfig.coverageZips.includes(zip)) {
      return NextResponse.json(
        { error: 'Service is not available in your area yet. Check back soon!' },
        { status: 422 },
      );
    }

    const emailValid  = await hasMxRecords(session.user.email!);
    const qualityScore = emailValid ? 1 : 0;
    const leadPrice   = calculateLeadPrice(serviceType, parsedDate, frequency ?? 'once', priceConfig);

    const lead = await prisma.lead.create({
      data: {
        clientId:          dbUser.id,
        serviceType,
        address,
        notes:             notes         || null,
        dateTime:          parsedDate,
        // Store ZIP-derived coords so matching has real distance data from the start
        latitude:          zipCoords?.lat  ?? 0,
        longitude:         zipCoords?.lng  ?? 0,
        zipCode:           zip,
        status:            'NEW',
        bedrooms:          bedrooms      ?? 1,
        bathrooms:         bathrooms     ?? 1,
        squareMeters:      squareMeters  ?? 0,
        extras:            Array.isArray(extras) ? extras : [],
        frequency:         frequency     ?? 'once',
        photos:            Array.isArray(photos) ? photos.filter(Boolean).slice(0, 4) : [],
        clientPhone:       dbUser.phone  || clientPhone || null,
        estimatedMinPrice: estimatedMinPrice ?? null,
        estimatedMaxPrice: estimatedMaxPrice ?? null,
        estimatedHours:    estimatedHours    ?? null,
        leadPrice,
        qualityScore,
      },
    });

    // after() ensures matching runs AFTER the response is sent, never killed mid-flight
    after(() => runMatching(lead.id).catch(e => logError('[matching]', e)));

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err: any) {
    logError('[POST /api/leads]', err);
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 });
  }
}
