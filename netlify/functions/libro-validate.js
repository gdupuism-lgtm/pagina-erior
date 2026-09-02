/**
 * Cliente: canjea código del libro → URL firmada temporal del PDF.
 * POST { code, visitante_id }
 */
const { corsHeaders, validateAndActivateLibroCode } = require('./libro-lib');

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'POST only' }) };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'JSON inválido' }) };
  }

  const result = await validateAndActivateLibroCode(body.code, body.visitante_id);
  return {
    statusCode: result.status || (result.ok ? 200 : 400),
    headers,
    body: JSON.stringify(result),
  };
};
