-- Cuota Premium universal por código (no por dispositivo)
-- Ejecuta en Supabase → SQL Editor después de alicia-premium-quota.sql

create unique index if not exists idx_premium_usage_code_id_unique
  on public.alicia_premium_usage (code_id)
  where code_id is not null;

-- Opcional: fusionar filas duplicadas del mismo código (conserva la que más mensajes lleva hoy)
-- Revisa el resultado antes de borrar duplicados en producción.
