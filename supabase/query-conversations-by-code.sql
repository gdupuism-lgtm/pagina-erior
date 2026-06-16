-- Ver conversaciones de un código Premium (Supabase SQL Editor)
-- Cambia el código en la línea WHERE si necesitas otro.

-- 1) Código + dispositivos que lo activaron
SELECT
  c.code,
  c.client_name,
  c.client_whatsapp,
  c.client_email,
  c.active,
  a.visitante_id,
  a.activated_at,
  a.expires_at,
  a.revoked_at
FROM public.alicia_premium_codes c
LEFT JOIN public.alicia_premium_activations a ON a.code_id = c.id
WHERE c.code = 'ERIOR-RGTM-BKCJ'
ORDER BY a.activated_at DESC NULLS LAST;

-- 2) Mensajes completos (requiere alicia-crm.sql ejecutado)
SELECT
  c.code,
  conv.visitante_id,
  conv.tier,
  conv.created_at AS sesion_inicio,
  m.created_at AS mensaje_at,
  m.rol,
  m.contenido
FROM public.alicia_premium_codes c
JOIN public.alicia_premium_activations a ON a.code_id = c.id
JOIN public.alicia_conversaciones conv ON conv.visitante_id = a.visitante_id
JOIN public.alicia_mensajes m ON m.conversacion_id = conv.id
WHERE c.code = 'ERIOR-RGTM-BKCJ'
ORDER BY m.created_at ASC;
