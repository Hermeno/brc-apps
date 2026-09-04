import { auth } from '@/lib/auth';
import { geocodeAddressOffline, parseUsAddress } from '@/lib/geo';
import { NextRequest, NextResponse } from 'next/server';

// Echoes back what the matching engine will understand from a typed address.
//
// Parsing lives on the server because it needs the ZIP dataset, which is far too
// large to ship to the browser. Exposing it lets the booking form show the client
// the city and ZIP we resolved *before* they submit, so a typo that would send
// their lead to the wrong county is caught by the person who can fix it.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { address } = await req.json().catch(() => ({ address: '' }));
  if (typeof address !== 'string' || !address.trim()) {
    return NextResponse.json({ resolved: false });
  }

  const parsed = parseUsAddress(address);
  const geo    = geocodeAddressOffline(address);

  if (!geo) {
    return NextResponse.json({
      resolved: false,
      // Tells the UI which half is missing so it can prompt for the right thing.
      hasState: parsed.state !== null,
      hasCity:  parsed.city  !== null,
    });
  }

  return NextResponse.json({
    resolved:  true,
    zip:       geo.zip,
    city:      geo.city,
    state:     geo.state,
    precision: geo.precision,
  });
}
