-- Ko-fi donations, entered by hand from /admin and assigned to an osu! account. Run once in the Supabase SQL editor.
-- Amounts are in the Ko-fi page currency (EUR).
create table if not exists donations (
  id bigint generated always as identity primary key,
  osu_user_id bigint not null,
  amount numeric(10, 2) not null check (amount > 0),
  donated_at date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists donations_osu_user_id_idx on donations (osu_user_id);

-- No policies on purpose: only the server's service key can read or write this table.
alter table donations enable row level security;

create or replace view supporters with (security_invoker = true) as
  select osu_user_id, count(*)::int as donations, sum(amount) as total, max(donated_at) as last_donated_at
  from donations
  group by osu_user_id;
