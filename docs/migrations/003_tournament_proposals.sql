-- Tournaments proposed from the o!TMD desktop app, reviewed by a moderator. Run once in the Supabase SQL editor.
create table if not exists tournament_proposals (
  id bigint generated always as identity primary key,
  osu_user_id bigint not null,
  acronym text not null,
  name text not null,
  link text,
  created_at timestamptz not null default now(),
  unique (osu_user_id, acronym)
);

-- No policies on purpose: only the server's service key can read or write this table.
alter table tournament_proposals enable row level security;
