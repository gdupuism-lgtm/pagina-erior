/**
 * Supabase REST helper para códigos Alicia Premium (service_role en Netlify).
 */

function corsHeaders(origin) {
  const o = origin && /^https?:\/\//.test(origin) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

function getSupabaseConfig() {
  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return { url, key };
}

async function sbFetch(path, options = {}) {
  const cfg = getSupabaseConfig();
  if (!cfg) throw new Error('Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Netlify');

  const headers = Object.assign(
    {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
    },
    options.headers || {}
  );

  const res = await fetch(`${cfg.url}/rest/v1/${path}`, Object.assign({}, options, { headers }));
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }
  }
  return { ok: res.ok, status: res.status, data };
}

function normalizeCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function generatePremiumCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = (n) => {
    let s = '';
    for (let i = 0; i < n; i += 1) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  };
  return `ERIOR-${part(4)}-${part(4)}`;
}

async function fetchCodeByValue(code) {
  const normalized = normalizeCode(code);
  const res = await sbFetch(
    `alicia_premium_codes?code=eq.${encodeURIComponent(normalized)}&select=id,code,active,max_activations,activation_count,expires_at,client_name&limit=1`,
    { method: 'GET' }
  );
  if (!res.ok) return null;
  return Array.isArray(res.data) && res.data[0] ? res.data[0] : null;
}

async function fetchCodeById(codeId) {
  const res = await sbFetch(
    `alicia_premium_codes?id=eq.${encodeURIComponent(codeId)}&select=id,active,activation_count,expires_at&limit=1`,
    { method: 'GET' }
  );
  if (!res.ok) return null;
  return Array.isArray(res.data) && res.data[0] ? res.data[0] : null;
}

function addPremiumDays(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

const PREMIUM_ACCESS_DAYS = 30;

async function validateAndActivateCode(code, visitanteId) {
  const row = await fetchCodeByValue(code);
  if (!row) return { ok: false, error: 'Código inválido' };
  if (!row.active) return { ok: false, error: 'Código desactivado' };
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return { ok: false, error: 'Código expirado' };
  }

  const vid = String(visitanteId || 'anon').slice(0, 80);

  const existing = await sbFetch(
    `alicia_premium_activations?code_id=eq.${row.id}&visitante_id=eq.${encodeURIComponent(vid)}&select=id,expires_at,activated_at&limit=1`,
    { method: 'GET' }
  );
  if (
    existing.ok &&
    Array.isArray(existing.data) &&
    existing.data[0]
  ) {
    let expiresAt = existing.data[0].expires_at;
    if (!expiresAt) {
      expiresAt = addPremiumDays(PREMIUM_ACCESS_DAYS);
      await sbFetch(`alicia_premium_activations?id=eq.${existing.data[0].id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ expires_at: expiresAt }),
      });
    }
    if (new Date(expiresAt) < new Date()) {
      return { ok: false, error: 'Tu acceso premium expiró' };
    }
    return {
      ok: true,
      code_id: row.id,
      client_name: row.client_name || '',
      expires_at: expiresAt,
      reused: true,
    };
  }

  if (row.activation_count >= row.max_activations) {
    return { ok: false, error: 'Código ya agotado' };
  }

  const expiresAt = addPremiumDays(PREMIUM_ACCESS_DAYS);
  const ins = await sbFetch('alicia_premium_activations', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify([{ code_id: row.id, visitante_id: vid, expires_at: expiresAt }]),
  });
  if (!ins.ok) return { ok: false, error: 'No se pudo activar el código' };

  await sbFetch(`alicia_premium_codes?id=eq.${row.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      activation_count: row.activation_count + 1,
      last_activated_at: new Date().toISOString(),
      last_visitante_id: vid,
    }),
  });

  return {
    ok: true,
    code_id: row.id,
    client_name: row.client_name || '',
    expires_at: expiresAt,
    reused: false,
  };
}

async function verifyPremiumCodeId(codeId) {
  if (!codeId || typeof codeId !== 'string') return false;
  if (!getSupabaseConfig()) return false;
  const row = await fetchCodeById(codeId.trim());
  if (!row || !row.active) return false;
  if (row.expires_at && new Date(row.expires_at) < new Date()) return false;
  return row.activation_count >= 1;
}

function checkAdminKey(event) {
  const expected = process.env.ALICIA_ADMIN_PASSWORD || '';
  if (!expected) return false;
  const got =
    event.headers['x-admin-key'] ||
    event.headers['X-Admin-Key'] ||
    '';
  return got === expected;
}

module.exports = {
  corsHeaders,
  getSupabaseConfig,
  normalizeCode,
  generatePremiumCode,
  validateAndActivateCode,
  verifyPremiumCodeId,
  checkAdminKey,
  sbFetch,
};
