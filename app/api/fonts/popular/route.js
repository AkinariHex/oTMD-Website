import { supabaseAdmin } from '@/config/supabaseClient';
import { clientIp, consumeRateLimit } from '@/lib/osuOAuthBroker';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CACHE_SECONDS = 3600;

export async function GET(request) {
  const retryAfter = consumeRateLimit(`fonts-ip:${clientIp(request)}`, Date.now());
  if (retryAfter) return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } });

  try {
    const { data, error } = await supabaseAdmin.from('popular_fonts').select('font');
    if (error) throw error;
    return NextResponse.json(
      { fonts: data.map((row) => row.font) },
      { headers: { 'Cache-Control': `public, s-maxage=${CACHE_SECONDS}` } }
    );
  } catch {
    console.error('Popular fonts failed');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
