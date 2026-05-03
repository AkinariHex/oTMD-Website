'use server';

import { supabaseAdmin } from '@/config/supabaseClient';
export async function getSettings(sessionID) {
  'use server';
  var { data, error } = await supabaseAdmin
    .from('users')
    .select('UUID,api_key,sendMatchesDiscord,discordChannelsMatch')
    .eq('ID', sessionID);

  if (error) {
    return error;
  }

  return data;
}
