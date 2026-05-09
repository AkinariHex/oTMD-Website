import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/config/supabaseClient';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const value = searchParams.get('v');

    if (value === null) {
      return NextResponse.json({ error: 'Missing value parameter' }, { status: 400 });
    }

    const sendMatches = value === 'true';

    const { error } = await supabaseAdmin
      .from('users')
      .update({ sendMatchesDiscord: sendMatches })
      .eq('ID', session.id);

    if (error) {
      console.error('Error updating sendMatchesDiscord:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, sendMatchesDiscord: sendMatches });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
