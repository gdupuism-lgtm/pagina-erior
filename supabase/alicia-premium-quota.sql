-- Cuota diaria Alicia Premium por visitante (ejecutar en Supabase SQL Editor)

create table if not exists public.alicia_premium_usage (
  visitante_id text primary key,
  code_id uuid references public.alicia_premium_codes(id) on delete set null,
  day_key text not null default '',
  messages_today int not null default 0 check (messages_today >= 0),
  blocked_until timestamptz,
  last_message_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists idx_premium_usage_blocked on public.alicia_premium_usage (blocked_until);
create index if not exists idx_premium_usage_day on public.alicia_premium_usage (day_key);

alter table public.alicia_premium_usage enable row level security;
