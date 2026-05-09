import { supabaseAdmin } from '@/config/supabaseClient';
import { validateApiKey } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const auth = await validateApiKey(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const created_by = searchParams.get('created_by');
    const winner_id = searchParams.get('winner_id');
    const sort = searchParams.get('sort') || 'ended_at';
    const order = searchParams.get('order') || 'desc';
    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from('ranked_rooms').select('*', { count: 'exact' });

    if (created_by) query = query.eq('created_by', parseInt(created_by));
    if (winner_id) query = query.eq('winner_id', parseInt(winner_id));

    query = query.order(sort, { ascending: order === 'asc' }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching rooms:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      rooms: data,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await validateApiKey(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { room_id, ended_at, players, scores, winner_id, created_by, total_rounds, best_of, match_type, ruleset_id } = body;

    if (!room_id || !ended_at || !players || !scores || !created_by || !total_rounds) {
      return NextResponse.json(
        { error: 'Missing required fields: room_id, ended_at, players, scores, created_by, total_rounds' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('ranked_rooms')
      .insert([{
        room_id,
        ended_at,
        players,
        scores,
        winner_id: winner_id || null,
        created_by,
        total_rounds,
        best_of: best_of || null,
        match_type: match_type || 'ranked_play',
        ruleset_id: ruleset_id || 0,
      }])
      .select();

    if (error) {
      console.error('Error creating room:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ room: data[0] }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
