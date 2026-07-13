/**
 * Panel de referidos para miembros VIP (Alicia Premium activo).
 * POST { code_id, visitante_id }
 */

const { corsHeaders, getSupabaseConfig, getReferralPanelForUser } = require('./premium-lib');

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

  const codeId = String(body.code_id || '').trim();
  const visitanteId = String(body.visitante_id || '').slice(0, 80);
  if (!codeId || !visitanteId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, error: 'Faltan code_id o visitante_id' }),
    };
  }

  try {
    const result = await getReferralPanelForUser(codeId, visitanteId);
    return {
      statusCode: result.ok ? 200 : 403,
      headers,
      body: JSON.stringify(result),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
