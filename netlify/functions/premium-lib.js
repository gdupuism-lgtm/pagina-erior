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

function randPart(n) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < n; i += 1) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function generatePremiumCode() {
  return `ERIOR-${randPart(4)}-${randPart(4)}`;
}

function generateReferralCode(ownerName) {
  const slug = String(ownerName || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
  if (slug.length >= 3) return `${slug}-${randPart(4)}`;
  return `REF-${randPart(4)}-${randPart(4)}`;
}

function normalizeRefCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
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

async function verifyPremiumCodeId(codeId, visitanteId) {
  if (!codeId || typeof codeId !== 'string') return false;
  if (!getSupabaseConfig()) return false;
  const row = await fetchCodeById(codeId.trim());
  if (!row || !row.active) return false;
  if (row.expires_at && new Date(row.expires_at) < new Date()) return false;
  if (row.activation_count < 1) return false;

  const vid = String(visitanteId || '').slice(0, 80);
  if (!vid) return true;

  const act = await sbFetch(
    `alicia_premium_activations?code_id=eq.${encodeURIComponent(codeId.trim())}&visitante_id=eq.${encodeURIComponent(vid)}&select=id,expires_at&limit=1`,
    { method: 'GET' }
  );
  if (!act.ok || !Array.isArray(act.data) || !act.data[0]) return false;
  const expiresAt = act.data[0].expires_at;
  if (expiresAt && new Date(expiresAt) < new Date()) return false;
  return true;
}

async function fetchReferralByCode(refCode) {
  const normalized = normalizeRefCode(refCode);
  if (!normalized) return null;
  const res = await sbFetch(
    `erior_referidos?ref_code=eq.${encodeURIComponent(normalized)}&select=id,ref_code,owner_name,active,hit_count,lead_count,conversion_count,premium_code_id&limit=1`,
    { method: 'GET' }
  );
  if (!res.ok) return null;
  return Array.isArray(res.data) && res.data[0] ? res.data[0] : null;
}

async function createReferralForPremiumCode(premiumRow) {
  if (!premiumRow || !premiumRow.id) return null;
  const refCode = generateReferralCode(premiumRow.client_name || '');
  const row = {
    ref_code: refCode,
    owner_name: premiumRow.client_name || null,
    owner_contact: premiumRow.client_email || premiumRow.client_whatsapp || null,
    premium_code_id: premiumRow.id,
    active: true,
    notes: `Auto-creado con código ${premiumRow.code}`,
  };
  const res = await sbFetch('erior_referidos', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify([row]),
  });
  if (!res.ok) return null;
  return Array.isArray(res.data) ? res.data[0] : res.data;
}

async function trackReferralHit(refCode, visitanteId, eventType, detalle) {
  const row = await fetchReferralByCode(refCode);
  if (!row || !row.active) return { ok: false, error: 'Código de referido inválido' };

  const vid = String(visitanteId || 'anon').slice(0, 80);
  const evt = String(eventType || 'llegada').slice(0, 40);

  const ins = await sbFetch('erior_referral_hits', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify([
      {
        ref_code: row.ref_code,
        visitante_id: vid,
        event_type: evt,
        detalle: String(detalle || '').slice(0, 300) || null,
      },
    ]),
  });
  if (!ins.ok) return { ok: false, error: 'No se pudo registrar el evento' };

  const patch = {};
  if (evt === 'llegada') patch.hit_count = (row.hit_count || 0) + 1;
  if (evt === 'dio_datos') patch.lead_count = (row.lead_count || 0) + 1;
  if (evt === 'compra_intento' || evt === 'premium_activado') {
    patch.conversion_count = (row.conversion_count || 0) + 1;
  }

  if (Object.keys(patch).length) {
    await sbFetch(`erior_referidos?id=eq.${row.id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(patch),
    });
  }

  return { ok: true, ref_code: row.ref_code, owner_name: row.owner_name || '' };
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
  normalizeRefCode,
  generatePremiumCode,
  generateReferralCode,
  validateAndActivateCode,
  verifyPremiumCodeId,
  fetchReferralByCode,
  createReferralForPremiumCode,
  trackReferralHit,
  checkAdminKey,
  sbFetch,
};
