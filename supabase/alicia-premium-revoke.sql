-- Revocación de accesos Premium (ejecutar en Supabase SQL Editor)
-- Permite cortar el acceso al desactivar un código desde el admin.

alter table public.alicia_premium_activations
  add column if not exists revoked_at timestamptz;

create index if not exists idx_premium_activations_revoked
  on public.alicia_premium_activations (code_id, revoked_at);
