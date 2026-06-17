/**
 * Valida y activa un código Alicia Premium (público, sin listar códigos).
 */

const {
  corsHeaders,
  getSupabaseConfig,
  validateAndActivateCode,
  checkPremiumStatus,
  verifyPremiumCodeId,
  getPremiumQuotaStatus,
} = require('./premium-lib');

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
      body: JSON.stringify({
        ok: false,
        error: 'Premium no configurado. Agrega SUPABASE_SERVICE_ROLE_KEY en Netlify.',
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'JSON inválido' }) };
  }

  try {
    if (body.quota === true) {
      const vid = String(body.visitante_id || '').slice(0, 80);
      if (!vid) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ ok: false, error: 'Falta visitante_id' }),
        };
      }
      const codeId = String(body.code_id || '').trim();
      let active = false;
      if (codeId) {
        active = await verifyPremiumCodeId(codeId, vid);
      }
      const quota = await getPremiumQuotaStatus(vid, codeId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(Object.assign({ ok: true, active }, quota)),
      };
    }

    if (body.check === true && body.code_id) {
      const status = await checkPremiumStatus(body.code_id, body.visitante_id);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(status),
      };
    }

    const result = await validateAndActivateCode(body.code, body.visitante_id);
    return {
      statusCode: result.ok ? 200 : 400,
      headers,
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: err.message || 'Error del servidor' }),
    };
  }
};
