import { supabaseAdmin } from '@/config/supabaseClient';
import { validateApiKey } from '@/lib/auth';

export default async function handler(req, res) {
  const { method, query } = req;
  const { room_id } = query;

  const auth = await validateApiKey(req);
  if (auth.error) {
    return res.status(401).json({ error: auth.error });
  }

  if (method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('ranked_rooms')
        .select('*')
        .eq('room_id', room_id)
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

  return res.status(405).json({ error: 'Method not allowed' });
}