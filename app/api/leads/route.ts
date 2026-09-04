import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { runMatching, dispatchDirect } from '@/lib/matching';
import { calculateLeadPrice, getLeadPriceConfig } from '@/lib/pricing';
import { geocodeAddressOffline, geocodeAddress } from '@/lib/geo';
import dns from 'dns/promises';
import { logError, logWarn } from '@/lib/logger';

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
      targetCleanerId, targetCleanerIds,
    } = body;

    // Direct request (Thumbtack-style): client chose specific cleaner(s) to
    // contact instead of the automatic wave dispatch. Accept one or many.
    const directTargets: string[] = Array.from(new Set(
      [
        ...(typeof targetCleanerId === 'string' ? [targetCleanerId] : []),
        ...(Array.isArray(targetCleanerIds) ? targetCleanerIds.filter((x: unknown) => typeof x === 'string') : []),
      ].filter(Boolean),
    )).slice(0, 10);

    // The address is free text from the client and feeds the geocoder, the DB and
    // notification emails. Pin down type and length before any of that runs — an
    // oversized or non-string value would otherwise reach String methods and 500.
    const MAX_ADDRESS_LEN = 200;
    if (typeof address !== 'string' || address.trim().length > MAX_ADDRESS_LEN) {
      return NextResponse.json(
        { error: `Address must be text, up to ${MAX_ADDRESS_LEN} characters.` },
        { status: 400 },
      );
    }

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

    // ── Geocoding ─────────────────────────────────────────────────────────────
    // Offline resolution runs inline so the lead always has coordinates and the
    // response stays fast; a street-level refinement happens in after(), before
    // matching. Parsing is shared with the cleaner side via lib/geo.
    const geo = geocodeAddressOffline(address ?? '');
    const zip = geo?.zip ?? null;

    if (!geo) {
      logWarn('[POST /api/leads]', 'address did not resolve to coordinates', { address });
    }

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
        // Store resolved coords so matching has real distance data from the start
        latitude:          geo?.lat ?? 0,
        longitude:         geo?.lng ?? 0,
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

    // Street-level refinement: a ZIP centroid can sit miles from the actual house,
    // which decides whether a cleaner at the edge of their radius sees this lead.
    // It runs after the response so the network call never slows down booking, and
    // before matching so the waves use the sharpest coordinates available.
    const refineCoords = async () => {
      try {
        const precise = await geocodeAddress(address ?? '');
        if (!precise || precise.precision === 'city') return;
        if (geo && precise.lat === geo.lat && precise.lng === geo.lng) return;

        await prisma.lead.update({
          where: { id: lead.id },
          data:  { latitude: precise.lat, longitude: precise.lng, zipCode: precise.zip ?? zip },
        });
      } catch (e) {
        // Matching still has the offline coordinates — never block on this.
        logError('[POST /api/leads] refineCoords', e);
      }
    };

    // after() ensures dispatch runs AFTER the response is sent, never killed mid-flight.
    if (directTargets.length > 0) {
      // Direct request → route straight to the chosen cleaner(s), skip the waves.
      after(() =>
        refineCoords().then(() => Promise.all(
          directTargets.map(cid => dispatchDirect(lead.id, cid).catch(e => logError('[dispatchDirect]', e))),
        )).then(results => {
          // If none of the chosen cleaners were valid, fall back to auto-matching
          // so the request still gets served rather than sitting unanswered.
          if (!results.some(Boolean)) return runMatching(lead.id).catch(e => logError('[matching fallback]', e));
        }),
      );
    } else {
      after(() => refineCoords().then(() => runMatching(lead.id)).catch(e => logError('[matching]', e)));
    }

    return NextResponse.json({ lead, direct: directTargets.length > 0 }, { status: 201 });
  } catch (err: any) {
    logError('[POST /api/leads]', err);
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 });
  }
}
