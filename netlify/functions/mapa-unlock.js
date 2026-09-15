/**
 * Mapa del Inconsciente — unlock keys after payment verification.
 * POST { action: 'verify', orderId, key }
 * POST { action: 'issue', orderId, adminPass }  → returns { key }
 *
 * Netlify env:
 *   MAPA_UNLOCK_SECRET  (string largo secreto)
 *   MAPA_ADMIN_PASS     (tu password admin)
 */
const crypto = require('crypto');

const ALLOWED = [
  'https://eriorcenterguiaaudios.netlify.app',
  'http://localhost:8888',
  'http://localhost:3000',
  'http://127.0.0.1:8888',
];

function corsHeaders(origin) {
  const o = ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function secret() {
  return String(process.env.MAPA_UNLOCK_SECRET || 'erior-mapa-unlock-change-me-2026').trim();
}

function adminCandidates() {
  const fromEnv = String(process.env.MAPA_ADMIN_PASS || '').trim();
  const list = ['mapa444', 'erior-mapa-admin'];
  if (fromEnv) list.unshift(fromEnv);
  return list;
}

function makeKey(orderId) {
  const id = String(orderId || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\-]/g, '');
  if (!id || id.length < 6) return null;
  return crypto.createHmac('sha256', secret()).update(id).digest('hex').slice(0, 8).toUpperCase();
}

function timingSafeEq(a, b) {
  const aa = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function passOk(pass) {
  const p = String(pass || '').trim();
  return adminCandidates().some(function (c) {
    return timingSafeEq(p, c);
  });
}

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

  const action = String(body.action || 'verify');

  if (action === 'issue') {
    if (!passOk(body.adminPass)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          ok: false,
          error: 'Admin incorrecto. Usa mapa444 (o el MAPA_ADMIN_PASS que configuraste en Netlify).',
        }),
      };
    }
    const key = makeKey(body.orderId);
    if (!key) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'orderId inválido (usa el código MAPA-… completo)' }) };
    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, orderId: String(body.orderId).trim().toUpperCase(), key }),
    };
  }

  const expected = makeKey(body.orderId);
  const got = String(body.key || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  if (!expected || !got || !timingSafeEq(got, expected)) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ ok: false, error: 'Clave incorrecta. Espera la clave de Pauline tras verificar tu pago.' }),
    };
  }
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, orderId: String(body.orderId).trim().toUpperCase() }),
  };
};
