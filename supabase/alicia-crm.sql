-- CRM Alicia IA — clientes y conversaciones (ejecutar en Supabase SQL Editor)

create table if not exists public.alicia_leads (
  id uuid primary key default gen_random_uuid(),
  visitante_id text unique not null,
  nombre text,
  telefono text,
  email text,
  audio_interes text,
  tier text not null default 'free' check (tier in ('free', 'premium')),
  referrer_code text,
  mensajes_count int not null default 0 check (mensajes_count >= 0),
  ultima_conversacion_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alicia_conversaciones (
  id uuid primary key default gen_random_uuid(),
  visitante_id text not null,
  lead_id uuid references public.alicia_leads(id) on delete set null,
  tier text not null default 'free' check (tier in ('free', 'premium')),
  audio_mencionado text,
  mensajes_count int not null default 0 check (mensajes_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alicia_mensajes (
  id uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references public.alicia_conversaciones(id) on delete cascade,
  visitante_id text not null,
  rol text not null check (rol in ('user', 'assistant')),
  contenido text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_alicia_leads_updated on public.alicia_leads (updated_at desc);
create index if not exists idx_alicia_leads_tier on public.alicia_leads (tier);
create index if not exists idx_alicia_conv_visitante on public.alicia_conversaciones (visitante_id, created_at desc);
create index if not exists idx_alicia_msg_conv on public.alicia_mensajes (conversacion_id, created_at);

alter table public.alicia_leads enable row level security;
alter table public.alicia_conversaciones enable row level security;
alter table public.alicia_mensajes enable row level security;

-- Solo Netlify (service_role) escribe/lee; el cliente usa la función alicia-crm.
