import { supabaseAdmin } from '@/config/supabaseClient';
import { validateApiKey } from '@/lib/auth';

export default async function handler(req, res) {
  const { method } = req;

  const auth = await validateApiKey(req);
  if (auth.error) {
    return res.status(401).json({ error: auth.error });
  }

  if (method === 'GET') {
    try {
      const { 
        page = 1, 
        limit = 20, 
        created_by, 
        winner_id,
        sort = 'ended_at',
        order = 'desc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      let query = supabaseAdmin
        .from('ranked_rooms')
        .select('*', { count: 'exact' });

      if (created_by) {
        query = query.eq('created_by', parseInt(created_by));
      }

      if (winner_id) {
        query = query.eq('winner_id', parseInt(winner_id));
      }

      query = query
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + parseInt(limit) - 1);

      const { data, count, error } = await query;

      if (error) {
        console.error('Error fetching rooms:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        rooms: data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (method === 'POST') {
    try {
      const { 
        room_id,
        ended_at,
        players,
        scores,
        winner_id,
        created_by,
        total_rounds,
        best_of,
        match_type,
        ruleset_id
      } = req.body;

      if (!room_id || !ended_at || !players || !scores || !created_by || !total_rounds) {
        return res.status(400).json({ 
          error: 'Missing required fields: room_id, ended_at, players, scores, created_by, total_rounds' 
        });
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
          ruleset_id: ruleset_id || 0
        }])
        .select();

      if (error) {
        console.error('Error creating room:', error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ room: data[0] });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}