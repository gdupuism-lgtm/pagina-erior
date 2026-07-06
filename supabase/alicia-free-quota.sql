-- Cuota diaria Alicia IA gratuita por visitante (ejecutar en Supabase SQL Editor)

create table if not exists public.alicia_free_usage (
  visitante_id text primary key,
  day_key text not null default '',
  messages_today int not null default 0 check (messages_today >= 0),
  last_message_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists idx_free_usage_day on public.alicia_free_usage (day_key);

alter table public.alicia_free_usage enable row level security;
