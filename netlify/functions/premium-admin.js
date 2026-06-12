/**
 * Panel admin: crear, listar y desactivar códigos Alicia Premium.
 * Header requerido: X-Admin-Key = ALICIA_ADMIN_PASSWORD (Netlify env)
 */

const {
  corsHeaders,
  getSupabaseConfig,
  checkAdminKey,
  generatePremiumCode,
  sbFetch,
} = require('./premium-lib');

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (!checkAdminKey(event)) {
    return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: 'No autorizado' }) };
  }

  if (!getSupabaseConfig()) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ ok: false, error: 'Falta SUPABASE_SERVICE_ROLE_KEY en Netlify' }),
    };
  }

  if (event.httpMethod === 'GET') {
    try {
      const res = await sbFetch(
        'alicia_premium_codes?select=id,code,client_name,client_email,client_whatsapp,notes,active,max_activations,activation_count,expires_at,created_at,last_activated_at&order=created_at.desc&limit=200',
        { method: 'GET' }
      );
      if (!res.ok) {
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({ ok: false, error: 'Error al leer códigos. ¿Ejecutaste supabase/alicia-premium.sql?' }),
        };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, codes: res.data || [] }) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'Método no permitido' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'JSON inválido' }) };
  }

  const action = body.action || 'create';

  try {
    if (action === 'create') {
      const code = (body.code || generatePremiumCode()).trim().toUpperCase();
      const row = {
        code,
        client_name: (body.client_name || '').trim() || null,
        client_email: (body.client_email || '').trim() || null,
        client_whatsapp: (body.client_whatsapp || '').trim() || null,
        notes: (body.notes || '').trim() || null,
        max_activations: Math.max(1, parseInt(body.max_activations, 10) || 1),
        active: true,
        created_by: 'admin',
      };
      if (body.expires_at) row.expires_at = body.expires_at;

      const res = await sbFetch('alicia_premium_codes', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify([row]),
      });
      if (!res.ok) {
        const msg =
          res.data && res.data.message ? res.data.message : 'No se pudo crear el código';
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: msg }) };
      }
      const created = Array.isArray(res.data) ? res.data[0] : res.data;
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, code: created }) };
    }

    if (action === 'toggle') {
      const id = body.id;
      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Falta id' }) };
      }
      const active = body.active !== false;
      const res = await sbFetch(`alicia_premium_codes?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) {
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'No se pudo actualizar' }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Acción desconocida' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
