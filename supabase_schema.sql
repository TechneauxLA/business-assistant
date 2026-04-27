-- Run this once in your Supabase project SQL editor
-- Dashboard → SQL Editor → New query → paste this → Run

-- ── Estimates table ───────────────────────────────────────────
create table if not exists public.estimates (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  name         text not null default 'Untitled Estimate',
  project_type text,
  total_hours  numeric,
  total_cost   numeric,
  phases       jsonb,
  subphases    jsonb,
  rates        jsonb,
  breakdown    jsonb,
  notes        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Enable Row Level Security (users only see their own estimates)
alter table public.estimates enable row level security;

create policy "Users can view own estimates"
  on public.estimates for select
  using (auth.uid() = user_id);

create policy "Users can insert own estimates"
  on public.estimates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own estimates"
  on public.estimates for update
  using (auth.uid() = user_id);

create policy "Users can delete own estimates"
  on public.estimates for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger estimates_updated_at
  before update on public.estimates
  for each row execute function update_updated_at();

-- ── Engine config table ───────────────────────────────────────
-- Stores the estimation engine JSON (phases, rates, benchmarks).
-- Readable by all authenticated users; writes are admin-only (dashboard or service role).
-- Seed initial data by running supabase_seed_engine.sql after this script.

create table if not exists public.engine_config (
  key        text primary key,
  data       jsonb not null,
  updated_at timestamptz default now()
);

alter table public.engine_config enable row level security;

create policy "Authenticated users can read engine config"
  on public.engine_config for select
  to authenticated
  using (true);

create or replace function update_engine_config_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger engine_config_updated_at
  before update on public.engine_config
  for each row execute function update_engine_config_updated_at();

-- ── Confirm ───────────────────────────────────────────────────
select 'Setup complete. Estimates + engine_config tables ready.' as status;
