-- ERIOR LIBRO — códigos de acceso únicos
-- Ejecuta en Supabase → SQL Editor (proyecto moamgixswoykfamysavs)
-- Después: Storage → New bucket → id/name: erior-libro → Private
-- Sube el archivo: mental-tech-es.pdf (el PDF del libro MENTAL TECH)

create table if not exists public.erior_libro_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  client_name text,
  client_contact text,
  notes text,
  active boolean not null default true,
  max_activations int not null default 1 check (max_activations >= 1),
  activation_count int not null default 0 check (activation_count >= 0),
  created_at timestamptz not null default now(),
  created_by text default 'admin',
  last_activated_at timestamptz,
  last_visitante_id text
);

create table if not exists public.erior_libro_activations (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.erior_libro_codes(id) on delete cascade,
  visitante_id text not null,
  activated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (code_id, visitante_id)
);

create index if not exists idx_libro_codes_code on public.erior_libro_codes (code);
create index if not exists idx_libro_codes_active on public.erior_libro_codes (active);
create index if not exists idx_libro_activations_code on public.erior_libro_activations (code_id);

alter table public.erior_libro_codes enable row level security;
alter table public.erior_libro_activations enable row level security;

-- Bucket privado para el PDF (si falla por permisos, créalo a mano en Storage UI)
insert into storage.buckets (id, name, public, file_size_limit)
values ('erior-libro', 'erior-libro', false, 52428800)
on conflict (id) do nothing;
