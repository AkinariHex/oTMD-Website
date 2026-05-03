'use server';

import supabase from '@/config/supabaseClient';
export async function getSettings(sessionID) {
  'use server';
  var { data, error } = await supabase
    .from('users')
    .select('UUID,api_key,sendMatchesDiscord,discordChannelsMatch')
    .eq('ID', sessionID);

  if (error) {
    return error;
  }

  return data;
}
