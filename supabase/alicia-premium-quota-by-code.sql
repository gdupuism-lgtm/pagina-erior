-- Cuota Premium universal por código (no por dispositivo)
-- Ejecuta TODO este script en Supabase → SQL Editor
-- Si falla el índice único, es porque ya hay filas duplicadas del mismo code_id
-- (laptop + celular). Este script las fusiona y luego crea el índice.

-- ── PASO 1 (opcional): ver duplicados ──
-- SELECT code_id, count(*) AS filas, max(messages_today) AS max_msgs
-- FROM public.alicia_premium_usage
-- WHERE code_id IS NOT NULL
-- GROUP BY code_id
-- HAVING count(*) > 1;

BEGIN;

-- ── PASO 2: fusionar duplicados en una sola fila por código ──
-- Conserva la fila con más mensajes hoy (cuota más restrictiva) y borra el resto.

WITH keeper AS (
  SELECT DISTINCT ON (code_id)
    visitante_id,
    code_id
  FROM public.alicia_premium_usage
  WHERE code_id IS NOT NULL
  ORDER BY
    code_id,
    messages_today DESC,
    blocked_until DESC NULLS LAST,
    updated_at DESC
),
agg AS (
  SELECT
    code_id,
    MAX(messages_today) AS messages_today,
    MAX(blocked_until) AS blocked_until,
    MAX(last_message_at) AS last_message_at,
    MAX(day_key) AS day_key
  FROM public.alicia_premium_usage
  WHERE code_id IS NOT NULL
  GROUP BY code_id
)
UPDATE public.alicia_premium_usage u
SET
  messages_today = a.messages_today,
  blocked_until = a.blocked_until,
  last_message_at = a.last_message_at,
  day_key = a.day_key,
  updated_at = now()
FROM keeper k
JOIN agg a ON a.code_id = k.code_id
WHERE u.visitante_id = k.visitante_id
  AND u.code_id = k.code_id;

DELETE FROM public.alicia_premium_usage u
WHERE u.code_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM (
      SELECT DISTINCT ON (code_id)
        visitante_id,
        code_id
      FROM public.alicia_premium_usage
      WHERE code_id IS NOT NULL
      ORDER BY
        code_id,
        messages_today DESC,
        blocked_until DESC NULLS LAST,
        updated_at DESC
    ) keep
    WHERE keep.code_id = u.code_id
      AND keep.visitante_id = u.visitante_id
  );

-- ── PASO 3: índice único (un code_id = una sola fila de cuota) ──
CREATE UNIQUE INDEX IF NOT EXISTS idx_premium_usage_code_id_unique
  ON public.alicia_premium_usage (code_id)
  WHERE code_id IS NOT NULL;

COMMIT;
