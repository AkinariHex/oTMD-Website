import { supabaseAdmin } from '@/config/supabaseClient';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_ACRONYM_LENGTH = 64;
const notFound = () => NextResponse.json({ error: 'No tournament found' });

export async function GET(request) {
  const acronym = new URL(request.url).searchParams.get('t');
  if (!acronym || acronym.length > MAX_ACRONYM_LENGTH) return notFound();

  try {
    const { data, error } = await supabaseAdmin
      .from(process.env.NEXT_PUBLIC_DB_TOURNAMENTS)
      .select('name, multipliers')
      .match({ isActive: true, acronym })
      .limit(1);

    if (error) throw error;
    if (!data?.length) return notFound();

    const { name, multipliers } = data[0];
    return NextResponse.json({
      tournamentName: name,
      multipliers: typeof multipliers === 'string' ? JSON.parse(multipliers) : multipliers,
    });
  } catch {
    console.error('Tournament lookup failed');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
