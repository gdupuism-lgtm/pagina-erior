/**
 * Auth Farmacia Erior — contraseña única por persona + suscripción mensual.
 * Configura FARMACIA_USERS_JSON en Netlify como JSON array:
 * [{"email":"cliente@mail.com","pass":"claveUnica123","subUntil":"2026-07-14"}]
 * Demo local si no hay env var.
 */

const DEMO_USERS = [
  { email: 'demo@erior.com', pass: 'farmacia2026', subUntil: '2027-12-31' },
  { email: 'eriorcenter@gmail.com', pass: 'erior-vip', subUntil: '2027-12-31' },
];

function loadUsers() {
  const raw = process.env.FARMACIA_USERS_JSON;
  if (!raw) return DEMO_USERS;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEMO_USERS;
  } catch (e) {
    return DEMO_USERS;
  }
}

function cors(origin) {
  const o = origin && /^https?:\/\//.test(origin) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

function isSubActive(subUntil) {
  if (!subUntil) return false;
  const end = new Date(subUntil + 'T23:59:59');
  return !isNaN(end.getTime()) && end >= new Date();
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = cors(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Metodo no permitido' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalido' }) };
  }

  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const pass = String(body.password || '');

  if (!email || !pass) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Correo y contraseña requeridos' }) };
  }

  const users = loadUsers();
  const match = users.find(function (u) {
    return String(u.email || '').toLowerCase() === email && String(u.pass || '') === pass;
  });

  if (!match) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Correo o contraseña incorrectos' }),
    };
  }

  const subActive = isSubActive(match.subUntil);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      email: match.email,
      subActive: subActive,
      subUntil: match.subUntil || null,
      token: Buffer.from(match.email + ':' + Date.now()).toString('base64'),
    }),
  };
};
