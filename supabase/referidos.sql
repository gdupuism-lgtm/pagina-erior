-- SISTEMA DE REFERIDOS ERIOR CENTER
-- Ejecuta en Supabase → SQL Editor (proyecto moamgixswoykfamysavs)
-- Requiere: supabase/alicia-premium.sql ya ejecutado

create table if not exists public.erior_referidos (
  id uuid primary key default gen_random_uuid(),
  ref_code text unique not null,
  owner_name text,
  owner_contact text,
  owner_visitante_id text,
  premium_code_id uuid references public.alicia_premium_codes(id) on delete set null,
  hit_count int not null default 0 check (hit_count >= 0),
  lead_count int not null default 0 check (lead_count >= 0),
  conversion_count int not null default 0 check (conversion_count >= 0),
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.erior_referral_hits (
  id uuid primary key default gen_random_uuid(),
  ref_code text not null,
  visitante_id text not null,
  event_type text not null,
  detalle text,
  created_at timestamptz not null default now()
);

create index if not exists idx_referidos_code on public.erior_referidos (ref_code);
create index if not exists idx_referidos_active on public.erior_referidos (active);
create index if not exists idx_referral_hits_code on public.erior_referral_hits (ref_code);
create index if not exists idx_referral_hits_visitante on public.erior_referral_hits (visitante_id);

alter table public.erior_referidos enable row level security;
alter table public.erior_referral_hits enable row level security;

-- Columna opcional en prospectos (si la tabla ya existe)
alter table public.prospectos add column if not exists referrer_code text;
