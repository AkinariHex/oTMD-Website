import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY || "";

// Next.js can keep fetch results in its Data Cache; server reads must always hit the database.
export const supabaseAdmin = createClient(supabaseAdminUrl, supabaseAdminKey, {
  global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) },
});

export default supabase;