import { NextRequest, NextResponse } from 'next/server';

// This endpoint has been retired. Lead acceptance now happens through
// /api/leads/[id]/respond (Stripe Checkout) + /api/conversations/[id]/confirm (client side).
export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: 'This endpoint is no longer available.' }, { status: 410 });
}
