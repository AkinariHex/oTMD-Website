import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/config/supabaseClient';
import { randomBytes } from 'crypto';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// The user always comes from the session cookie (SameSite=Lax), never from the request body.
async function setOwnApiKey(apiKey) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update({ api_key: apiKey })
      .eq('ID', session.id);

    if (error) throw error;

    return NextResponse.json(
      apiKey ? { success: true, api_key: apiKey } : { success: true },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    console.error('API key update failed');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = () => setOwnApiKey(randomBytes(32).toString('hex'));
export const DELETE = () => setOwnApiKey(null);
