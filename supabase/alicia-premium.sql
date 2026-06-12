-- ALICIA PREMIUM — códigos de acceso
-- Ejecuta en Supabase → SQL Editor (proyecto moamgixswoykfamysavs)

create table if not exists public.alicia_premium_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  client_name text,
  client_email text,
  client_whatsapp text,
  notes text,
  active boolean not null default true,
  max_activations int not null default 1 check (max_activations >= 1),
  activation_count int not null default 0 check (activation_count >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  created_by text default 'admin',
  last_activated_at timestamptz,
  last_visitante_id text
);

create table if not exists public.alicia_premium_activations (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.alicia_premium_codes(id) on delete cascade,
  visitante_id text not null,
  activated_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (code_id, visitante_id)
);

alter table public.alicia_premium_activations
  add column if not exists expires_at timestamptz;

create index if not exists idx_premium_codes_code on public.alicia_premium_codes (code);
create index if not exists idx_premium_codes_active on public.alicia_premium_codes (active);
create index if not exists idx_premium_activations_code on public.alicia_premium_activations (code_id);

alter table public.alicia_premium_codes enable row level security;
alter table public.alicia_premium_activations enable row level security;

insert into public.alicia_premium_codes (code, client_name, notes, max_activations)
values ('ERIOR2024', 'Legacy', 'Código inicial antes del panel admin', 999)
on conflict (code) do nothing;
