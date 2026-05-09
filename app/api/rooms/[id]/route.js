import { supabaseAdmin } from '@/config/supabaseClient';
import { validateApiKey } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const auth = await validateApiKey(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('ranked_rooms')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
      console.error('Error fetching room:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ room: data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await validateApiKey(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { room_id, ended_at, players, scores, winner_id, total_rounds, best_of, match_type, ruleset_id } = body;

    const updateData = {};
    if (room_id !== undefined) updateData.room_id = room_id;
    if (ended_at !== undefined) updateData.ended_at = ended_at;
    if (players !== undefined) updateData.players = players;
    if (scores !== undefined) updateData.scores = scores;
    if (winner_id !== undefined) updateData.winner_id = winner_id;
    if (total_rounds !== undefined) updateData.total_rounds = total_rounds;
    if (best_of !== undefined) updateData.best_of = best_of;
    if (match_type !== undefined) updateData.match_type = match_type;
    if (ruleset_id !== undefined) updateData.ruleset_id = ruleset_id;

    const { data, error } = await supabaseAdmin
      .from('ranked_rooms')
      .update(updateData)
      .eq('id', params.id)
      .select();

    if (error) {
      console.error('Error updating room:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ room: data[0] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await validateApiKey(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('ranked_rooms')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting room:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
