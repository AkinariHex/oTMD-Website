import { supabaseAdmin } from '@/config/supabaseClient';
import { clientIp, consumeRateLimit } from '@/lib/osuOAuthBroker';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CACHE_SECONDS = 600;

// Active tournaments for the desktop app's tournament picker.
export async function GET(request) {
  const retryAfter = consumeRateLimit(`tournaments-ip:${clientIp(request)}`, Date.now());
  if (retryAfter) return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } });

  try {
    const { data, error } = await supabaseAdmin
      .from(process.env.NEXT_PUBLIC_DB_TOURNAMENTS)
      .select('acronym, name')
      .eq('isActive', true)
      .order('name');
    if (error) throw error;
    return NextResponse.json(
      { tournaments: data.map(({ acronym, name }) => ({ acronym, name })) },
      { headers: { 'Cache-Control': `public, s-maxage=${CACHE_SECONDS}` } }
    );
  } catch {
    console.error('Tournament list failed');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
