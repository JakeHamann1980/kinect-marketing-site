create table if not exists waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  persona text,
  source_path text,
  utm jsonb,
  created_at timestamptz not null default now()
);
alter table waitlist_signups enable row level security;
-- No public policies: all writes go through the server action using the
-- service role key. RLS-on with no policies denies anon/authenticated access.
