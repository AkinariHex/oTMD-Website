import { supabaseAdmin } from '@/config/supabaseClient';
import { validateApiKey } from '@/lib/auth';

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  const auth = await validateApiKey(req);
  if (auth.error) {
    return res.status(401).json({ error: auth.error });
  }

  if (method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('ranked_rooms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Room not found' });
        }
        console.error('Error fetching room:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ room: data });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (method === 'PUT') {
    try {
      const {
        room_id,
        ended_at,
        players,
        scores,
        winner_id,
        total_rounds,
        best_of,
        match_type,
        ruleset_id
      } = req.body;

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
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating room:', error);
        return res.status(400).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Room not found' });
      }

      return res.status(200).json({ room: data[0] });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (method === 'DELETE') {
    try {
      const { error } = await supabaseAdmin
        .from('ranked_rooms')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting room:', error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}