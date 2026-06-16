/**
 * CRM Alicia IA: registrar leads, conversaciones y mensajes.
 * Público: POST log / upsert_lead / start_conversation
 * Admin: GET ?leads=1 | ?messages=conversacion_id
 */

const { corsHeaders, getSupabaseConfig, checkAdminKey, sbFetch } = require('./premium-lib');

function trimStr(v, max) {
  return String(v || '')
    .trim()
    .slice(0, max || 500);
}

async function upsertLead(payload) {
  const vid = trimStr(payload.visitante_id, 80);
  if (!vid) return null;

  const tier = payload.tier === 'premium' ? 'premium' : 'free';
  const patch = {
    updated_at: new Date().toISOString(),
    tier,
  };
  const nombre = trimStr(payload.nombre, 80);
  const telefono = trimStr(payload.telefono, 40);
  const email = trimStr(payload.email, 120);
  const audio = trimStr(payload.audio_interes, 120);
  const ref = trimStr(payload.referrer_code, 40);
  if (nombre) patch.nombre = nombre;
  if (telefono) patch.telefono = telefono;
  if (email) patch.email = email;
  if (audio) patch.audio_interes = audio;
  if (ref) patch.referrer_code = ref;

  const existing = await sbFetch(
    `alicia_leads?visitante_id=eq.${encodeURIComponent(vid)}&select=id&limit=1`,
    { method: 'GET' }
  );
  if (existing.ok && Array.isArray(existing.data) && existing.data[0]) {
    await sbFetch(`alicia_leads?visitante_id=eq.${encodeURIComponent(vid)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(patch),
    });
    return existing.data[0].id;
  }

  const ins = await sbFetch('alicia_leads', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify([{ visitante_id: vid, ...patch }]),
  });
  if (!ins.ok) return null;
  const row = Array.isArray(ins.data) ? ins.data[0] : ins.data;
  return row ? row.id : null;
}

async function startConversation(payload) {
  const vid = trimStr(payload.visitante_id, 80);
  if (!vid) return { ok: false, error: 'Falta visitante_id' };

  const tier = payload.tier === 'premium' ? 'premium' : 'free';
  const leadId = await upsertLead(payload);
  const row = {
    visitante_id: vid,
    lead_id: leadId,
    tier,
    audio_mencionado: trimStr(payload.audio_interes, 120) || null,
  };
  const ins = await sbFetch('alicia_conversaciones', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify([row]),
  });
  if (!ins.ok) return { ok: false, error: 'No se pudo crear conversación' };
  const conv = Array.isArray(ins.data) ? ins.data[0] : ins.data;
  return { ok: true, conversacion_id: conv.id };
}

async function logMessage(payload) {
  const vid = trimStr(payload.visitante_id, 80);
  const convId = trimStr(payload.conversacion_id, 80);
  const rol = payload.rol === 'assistant' ? 'assistant' : 'user';
  const contenido = trimStr(payload.contenido, 4000);
  if (!vid || !convId || !contenido) {
    return { ok: false, error: 'Datos incompletos' };
  }

  await upsertLead(payload);

  const ins = await sbFetch('alicia_mensajes', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify([{ conversacion_id: convId, visitante_id: vid, rol, contenido }]),
  });
  if (!ins.ok) return { ok: false, error: 'No se pudo guardar mensaje' };

  const now = new Date().toISOString();
  const convRes = await sbFetch(
    `alicia_conversaciones?id=eq.${encodeURIComponent(convId)}&select=mensajes_count&limit=1`,
    { method: 'GET' }
  );
  const prevCount =
    convRes.ok && Array.isArray(convRes.data) && convRes.data[0]
      ? convRes.data[0].mensajes_count || 0
      : 0;

  await sbFetch(`alicia_conversaciones?id=eq.${encodeURIComponent(convId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      mensajes_count: prevCount + 1,
      updated_at: now,
      audio_mencionado: trimStr(payload.audio_interes, 120) || undefined,
    }),
  });

  const leadRes = await sbFetch(
    `alicia_leads?visitante_id=eq.${encodeURIComponent(vid)}&select=mensajes_count&limit=1`,
    { method: 'GET' }
  );
  const leadPrev =
    leadRes.ok && Array.isArray(leadRes.data) && leadRes.data[0]
      ? leadRes.data[0].mensajes_count || 0
      : 0;

  await sbFetch(`alicia_leads?visitante_id=eq.${encodeURIComponent(vid)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      mensajes_count: leadPrev + 1,
      ultima_conversacion_at: now,
      updated_at: now,
    }),
  });

  return { ok: true };
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (!getSupabaseConfig()) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ ok: false, error: 'Supabase no configurado' }),
    };
  }

  if (event.httpMethod === 'GET') {
    if (!checkAdminKey(event)) {
      return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: 'No autorizado' }) };
    }
    const qs = event.queryStringParameters || {};
    try {
      if (qs.messages && qs.conversacion_id) {
        const res = await sbFetch(
          `alicia_mensajes?conversacion_id=eq.${encodeURIComponent(qs.conversacion_id)}&select=id,rol,contenido,created_at&order=created_at.asc&limit=200`,
          { method: 'GET' }
        );
        if (!res.ok) {
          return {
            statusCode: 502,
            headers,
            body: JSON.stringify({ ok: false, error: 'Error al leer mensajes. ¿Ejecutaste supabase/alicia-crm.sql?' }),
          };
        }
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, messages: res.data || [] }) };
      }

      if (qs.conversaciones && qs.visitante_id) {
        const res = await sbFetch(
          `alicia_conversaciones?visitante_id=eq.${encodeURIComponent(qs.visitante_id)}&select=id,tier,audio_mencionado,mensajes_count,created_at,updated_at&order=created_at.desc&limit=50`,
          { method: 'GET' }
        );
        if (!res.ok) {
          return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: 'Error al leer conversaciones' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, conversaciones: res.data || [] }) };
      }

      const res = await sbFetch(
        'alicia_leads?select=id,visitante_id,nombre,telefono,email,audio_interes,tier,referrer_code,mensajes_count,ultima_conversacion_at,created_at,updated_at&order=updated_at.desc&limit=300',
        { method: 'GET' }
      );
      if (!res.ok) {
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({ ok: false, error: 'Error al leer clientes. ¿Ejecutaste supabase/alicia-crm.sql?' }),
        };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, leads: res.data || [] }) };
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

  const action = body.action || 'log_message';

  try {
    if (action === 'upsert_lead') {
      const leadId = await upsertLead(body);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: !!leadId, lead_id: leadId }) };
    }
    if (action === 'start_conversation') {
      const result = await startConversation(body);
      return {
        statusCode: result.ok ? 200 : 400,
        headers,
        body: JSON.stringify(result),
      };
    }
    if (action === 'log_message') {
      const result = await logMessage(body);
      return {
        statusCode: result.ok ? 200 : 400,
        headers,
        body: JSON.stringify(result),
      };
    }
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Acción desconocida' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
