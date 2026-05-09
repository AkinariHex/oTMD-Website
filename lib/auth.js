import { supabaseAdmin } from '@/config/supabaseClient';

export async function validateApiKey(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header' };
  }

  const apiKey = authHeader.replace('Bearer ', '');

  if (!apiKey) {
    return { error: 'API key is required' };
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('ID, username, api_key')
    .eq('api_key', apiKey)
    .single();

  if (error || !data) {
    return { error: 'Invalid API key' };
  }

  return { user: data };
}

export function withApiKey(handler) {
  return async function (req, res) {
    const auth = await validateApiKey(req);
    
    if (auth.error) {
      return res.status(401).json({ error: auth.error });
    }

    req.user = auth.user;
    return handler(req, res);
  };
}