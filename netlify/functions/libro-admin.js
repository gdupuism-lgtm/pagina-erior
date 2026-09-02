/**
 * Admin: crear / listar / desactivar códigos del libro.
 * Header: X-Admin-Key = ALICIA_ADMIN_PASSWORD
 */
const {
  corsHeaders,
  getSupabaseConfig,
  checkAdminKey,
  normalizeCode,
  generateLibroCode,
  sbFetch,
} = require('./libro-lib');

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
    const res = await sbFetch(
      'erior_libro_codes?select=id,code,client_name,client_contact,notes,active,max_activations,activation_count,created_at,last_activated_at,last_visitante_id&order=created_at.desc&limit=300',
      { method: 'GET' }
    );
    if (!res.ok) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          ok: false,
          error: 'Error al leer códigos. ¿Ejecutaste supabase/erior-libro.sql?',
        }),
      };
    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, codes: Array.isArray(res.data) ? res.data : [] }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'JSON inválido' }) };
  }

  const action = String(body.action || 'create').toLowerCase();

  if (action === 'deactivate' || action === 'activate') {
    const id = String(body.id || '').trim();
    if (!id) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Falta id' }) };
    }
    const res = await sbFetch(`erior_libro_codes?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ active: action === 'activate' }),
    });
    if (!res.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: 'No se pudo actualizar' }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, row: res.data && res.data[0] }) };
  }

  if (action === 'reset') {
    const id = String(body.id || '').trim();
    if (!id) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Falta id' }) };
    }
    await sbFetch(`erior_libro_activations?code_id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    });
    const res = await sbFetch(`erior_libro_codes?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        activation_count: 0,
        last_activated_at: null,
        last_visitante_id: null,
        active: true,
      }),
    });
    if (!res.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: 'No se pudo resetear' }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, row: res.data && res.data[0] }) };
  }

  // create (single or bulk)
  const count = Math.min(Math.max(parseInt(body.count, 10) || 1, 1), 30);
  const maxAct = Math.min(Math.max(parseInt(body.max_activations, 10) || 1, 1), 5);
  const clientName = String(body.client_name || '').trim().slice(0, 120);
  const clientContact = String(body.client_contact || body.client_whatsapp || '').trim().slice(0, 120);
  const notes = String(body.notes || '').trim().slice(0, 500);
  const custom = body.code ? normalizeCode(body.code) : '';

  const created = [];
  for (let i = 0; i < count; i += 1) {
    const code = count === 1 && custom ? custom : generateLibroCode();
    const res = await sbFetch('erior_libro_codes', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        code,
        client_name: clientName || null,
        client_contact: clientContact || null,
        notes: notes || null,
        max_activations: maxAct,
        active: true,
      }),
    });
    if (!res.ok) {
      const errMsg =
        (res.data && (res.data.message || res.data.error || res.data.hint)) ||
        (code === custom ? 'Ese código ya existe' : 'Error al crear código');
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ ok: false, error: String(errMsg), created }),
      };
    }
    if (Array.isArray(res.data) && res.data[0]) created.push(res.data[0]);
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      codes: created,
      code: created[0] ? created[0].code : null,
    }),
  };
};
