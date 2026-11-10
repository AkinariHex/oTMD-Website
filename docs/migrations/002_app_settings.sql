-- Settings of the o!TMD desktop app, per osu! account. Run once in the Supabase SQL editor.
create table if not exists app_settings (
  osu_user_id bigint primary key,
  settings jsonb not null,
  fonts text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- No policies on purpose: only the server's service key can read or write this table.
alter table app_settings enable row level security;

create or replace view popular_fonts with (security_invoker = true) as
  select font, count(*)::int as users
  from app_settings, unnest(fonts) as font
  group by font
  having count(*) >= 3
  order by users desc
  limit 30;
