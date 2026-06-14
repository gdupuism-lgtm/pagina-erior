/**
 * Registro público de eventos de referidos (llegada, lead, compra).
 * POST { ref_code, visitante_id, event_type, detalle }
 */

const { corsHeaders, getSupabaseConfig, trackReferralHit } = require('./premium-lib');

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'Método no permitido' }) };
  }

  if (!getSupabaseConfig()) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ ok: false, error: 'Referidos no configurado en Supabase' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'JSON inválido' }) };
  }

  const refCode = body.ref_code;
  const visitanteId = body.visitante_id;
  const eventType = body.event_type || 'llegada';

  if (!refCode || !visitanteId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, error: 'Faltan ref_code o visitante_id' }),
    };
  }

  try {
    const result = await trackReferralHit(refCode, visitanteId, eventType, body.detalle || '');
    if (!result.ok) {
      return { statusCode: 404, headers, body: JSON.stringify(result) };
    }
    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
