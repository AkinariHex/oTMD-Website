import { supabaseAdmin } from '@/config/supabaseClient';

/**
 * Validates a Bearer API key from an App Router Request object.
 * Usage: const auth = await validateApiKey(request); if (auth.error) ...
 */
export async function validateApiKey(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header' };
  }

  const apiKey = authHeader.slice(7).trim();

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
