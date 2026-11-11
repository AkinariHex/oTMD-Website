-- Site-wide settings edited from /admin (e.g. the Discord webhook for tournament proposals). Run once in the Supabase SQL editor.
create table if not exists admin_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- No policies on purpose: only the server's service key can read or write this table.
alter table admin_settings enable row level security;
