/**
 * Sirve el PDF solo si el código+dispositivo son válidos.
 * Misma origen → PDF.js sin CORS ni toolbar de descarga del navegador.
 * GET ?code=&vid=
 */
const {
  corsHeaders,
  normalizeCode,
  sbFetch,
  createSignedLibroUrl,
} = require('./libro-lib');

async function assertActive(code, vid) {
  const codeRes = await sbFetch(
    `erior_libro_codes?code=eq.${encodeURIComponent(code)}&select=id,active&limit=1`,
    { method: 'GET' }
  );
  if (!codeRes.ok) return { ok: false, status: 502, error: 'Error DB' };
  const row = Array.isArray(codeRes.data) && codeRes.data[0] ? codeRes.data[0] : null;
  if (!row) return { ok: false, status: 404, error: 'Código no encontrado' };
  if (!row.active) return { ok: false, status: 403, error: 'Código desactivado' };

  const act = await sbFetch(
    `erior_libro_activations?code_id=eq.${encodeURIComponent(row.id)}&visitante_id=eq.${encodeURIComponent(vid)}&select=id&limit=1`,
    { method: 'GET' }
  );
  if (!(act.ok && Array.isArray(act.data) && act.data[0])) {
    return { ok: false, status: 403, error: 'Activa el código primero en /libro/' };
  }
  return { ok: true };
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: 'GET only' };
  }

  const qs = event.queryStringParameters || {};
  const code = normalizeCode(qs.code || '');
  const vid = String(qs.vid || '').trim().slice(0, 80);
  if (!code || !vid) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Falta code o vid' }),
    };
  }

  const gate = await assertActive(code, vid);
  if (!gate.ok) {
    return {
      statusCode: gate.status || 403,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: gate.error }),
    };
  }

  let signed;
  try {
    signed = await createSignedLibroUrl();
  } catch (e) {
    return {
      statusCode: e.status || 502,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: e.message || 'No se pudo firmar' }),
    };
  }

  const pdfRes = await fetch(signed.url);
  if (!pdfRes.ok) {
    return {
      statusCode: 502,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'No se pudo leer el PDF del Storage' }),
    };
  }

  const buf = Buffer.from(await pdfRes.arrayBuffer());
  // Netlify sync ~6MB: si falla el deploy/runtime, comprimir el PDF bajo 5.5MB
  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="mental-tech-erior.pdf"',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'X-Content-Type-Options': 'nosniff',
    },
    body: buf.toString('base64'),
    isBase64Encoded: true,
  };
};
