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
    `alicia_premium_codes?code=eq.${encodeURIComponent(normalized)}&select=id,code,active,max_activations,activation_count,expires_at,client_name,last_visitante_id&limit=1`,
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

function isActivationLive(row) {
  if (!row || row.revoked_at) return false;
  if (row.expires_at && new Date(row.expires_at) < new Date()) return false;
  return true;
}

/**
 * Extiende el acceso Premium del mismo código (+N días) sin crear código ni referidos nuevos.
 * - Reactiva el código (active=true)
 * - Limpia revoked_at en activaciones
 * - Suma días desde max(ahora, vencimiento actual) para apilar si aún queda tiempo
 */
async function renewPremiumAccess(codeId, days) {
  const cid = String(codeId || '').trim();
  if (!cid) return { ok: false, error: 'Falta id del código' };

  const d = Math.max(1, Math.min(365, parseInt(days, 10) || PREMIUM_ACCESS_DAYS));
  const code = await fetchCodeById(cid);
  if (!code) return { ok: false, error: 'Código no encontrado' };

  const nowMs = Date.now();
  const actRes = await sbFetch(
    `alicia_premium_activations?code_id=eq.${encodeURIComponent(cid)}&select=id,expires_at,revoked_at,visitante_id`,
    { method: 'GET' }
  );
  const acts = actRes.ok && Array.isArray(actRes.data) ? actRes.data : [];

  let latestExpires = null;
  let renewed = 0;
  for (let i = 0; i < acts.length; i += 1) {
    const act = acts[i];
    const currentMs = act.expires_at ? new Date(act.expires_at).getTime() : 0;
    const baseMs = Math.max(nowMs, Number.isFinite(currentMs) ? currentMs : 0);
    const newExp = new Date(baseMs + d * 24 * 60 * 60 * 1000).toISOString();
    const patch = await sbFetch(`alicia_premium_activations?id=eq.${encodeURIComponent(act.id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ expires_at: newExp, revoked_at: null }),
    });
    if (!patch.ok) {
      return { ok: false, error: 'No se pudo renovar una activación. Intenta de nuevo.' };
    }
    renewed += 1;
    if (!latestExpires || new Date(newExp) > new Date(latestExpires)) latestExpires = newExp;
  }

  const codeCurrentMs = code.expires_at ? new Date(code.expires_at).getTime() : 0;
  const codeBaseMs = Math.max(nowMs, Number.isFinite(codeCurrentMs) ? codeCurrentMs : 0);
  const codeExpires =
    latestExpires || new Date(codeBaseMs + d * 24 * 60 * 60 * 1000).toISOString();

  const codePatch = await sbFetch(`alicia_premium_codes?id=eq.${encodeURIComponent(cid)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      active: true,
      expires_at: codeExpires,
    }),
  });
  if (!codePatch.ok) {
    return { ok: false, error: 'Se renovaron activaciones, pero no se pudo actualizar el código' };
  }

  const updated = Array.isArray(codePatch.data) ? codePatch.data[0] : codePatch.data;
  return {
    ok: true,
    days: d,
    expires_at: codeExpires,
    activations_renewed: renewed,
    code: updated || code,
  };
}

async function getActiveActivationsForCode(codeId) {
  const res = await sbFetch(
    `alicia_premium_activations?code_id=eq.${encodeURIComponent(codeId)}&select=id,visitante_id,expires_at,revoked_at,activated_at&order=activated_at.asc`,
    { method: 'GET' }
  );
  if (!res.ok || !Array.isArray(res.data)) return [];
  return res.data.filter(isActivationLive);
}

async function revokeActivationById(activationId) {
  return sbFetch(
    `alicia_premium_activations?id=eq.${encodeURIComponent(activationId)}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ revoked_at: new Date().toISOString() }),
    }
  );
}

async function freeActivationSlotsForCode(codeId, maxActivations, excludeVisitanteId) {
  let activeActs = await getActiveActivationsForCode(codeId);
  const vid = String(excludeVisitanteId || '').slice(0, 80);
  activeActs = activeActs.filter((a) => a.visitante_id !== vid);
  const needToFree = activeActs.length - Math.max(1, maxActivations) + 1;
  if (needToFree <= 0) return { freed: 0, ok: true };

  const toRevoke = activeActs.slice(0, needToFree);
  for (let i = 0; i < toRevoke.length; i += 1) {
    const revoked = await revokeActivationById(toRevoke[i].id);
    if (!revoked.ok) {
      return { freed: i, ok: false };
    }
  }
  return { freed: toRevoke.length, ok: true };
}

async function validateAndActivateCode(code, visitanteId) {
  const row = await fetchCodeByValue(code);
  if (!row) return { ok: false, error: 'Código inválido' };
  if (!row.active) return { ok: false, error: 'Código desactivado' };
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return { ok: false, error: 'Código expirado' };
  }

  const vid = String(visitanteId || 'anon').slice(0, 80);

  const existing = await sbFetch(
    `alicia_premium_activations?code_id=eq.${row.id}&visitante_id=eq.${encodeURIComponent(vid)}&select=id,expires_at,activated_at,revoked_at&limit=1`,
    { method: 'GET' }
  );
  if (
    existing.ok &&
    Array.isArray(existing.data) &&
    existing.data[0]
  ) {
    if (existing.data[0].revoked_at) {
      const restored = await sbFetch(
        `alicia_premium_activations?id=eq.${encodeURIComponent(existing.data[0].id)}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ revoked_at: null }),
        }
      );
      if (!restored.ok) {
        return { ok: false, error: 'No se pudo reactivar tu acceso. Intenta de nuevo' };
      }
      existing.data[0].revoked_at = null;
    }
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
    return enrichActivationWithReferral({
      ok: true,
      code_id: row.id,
      client_name: row.client_name || '',
      expires_at: expiresAt,
      reused: true,
    }, row.id);
  }

  const activeActs = await getActiveActivationsForCode(row.id);
  let transferDevice = false;

  if (activeActs.length >= row.max_activations) {
    const freed = await freeActivationSlotsForCode(row.id, row.max_activations, vid);
    if (!freed.ok) {
      return { ok: false, error: 'No se pudo transferir tu acceso. Escríbenos por WhatsApp 💛' };
    }
    if (freed.freed > 0) transferDevice = true;
    else {
      return {
        ok: false,
        error: 'Código activo en otro dispositivo',
        detail: 'Si cambiaste de celular o borraste datos del navegador, escríbenos por WhatsApp y te lo activamos al instante 💛',
      };
    }
  }

  const expiresAt = addPremiumDays(PREMIUM_ACCESS_DAYS);
  const ins = await sbFetch('alicia_premium_activations', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify([{ code_id: row.id, visitante_id: vid, expires_at: expiresAt }]),
  });
  if (!ins.ok) return { ok: false, error: 'No se pudo activar el código' };

  const nextCount = transferDevice
    ? Math.max(row.activation_count, 1)
    : Math.max(row.activation_count, activeActs.length) + 1;

  await sbFetch(`alicia_premium_codes?id=eq.${row.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      activation_count: nextCount,
      last_activated_at: new Date().toISOString(),
      last_visitante_id: vid,
    }),
  });

  return enrichActivationWithReferral({
    ok: true,
    code_id: row.id,
    client_name: row.client_name || '',
    expires_at: expiresAt,
    reused: false,
    transferred: transferDevice,
  }, row.id);
}

async function verifyPremiumCodeId(codeId, visitanteId) {
  if (!codeId || typeof codeId !== 'string') return false;
  if (!getSupabaseConfig()) return false;
  const row = await fetchCodeById(codeId.trim());
  if (!row || !row.active) return false;
  if (row.expires_at && new Date(row.expires_at) < new Date()) return false;

  const vid = String(visitanteId || '').slice(0, 80);
  if (!vid) return false;

  const act = await sbFetch(
    `alicia_premium_activations?code_id=eq.${encodeURIComponent(codeId.trim())}&visitante_id=eq.${encodeURIComponent(vid)}&select=id,expires_at,revoked_at&limit=1`,
    { method: 'GET' }
  );
  if (!act.ok || !Array.isArray(act.data) || !act.data[0]) return false;
  if (act.data[0].revoked_at) return false;
  const expiresAt = act.data[0].expires_at;
  if (expiresAt && new Date(expiresAt) < new Date()) return false;
  return true;
}

async function revokeActivationsForCode(codeId) {
  if (!codeId) return { ok: false };
  const res = await sbFetch(
    `alicia_premium_activations?code_id=eq.${encodeURIComponent(String(codeId).trim())}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ revoked_at: new Date().toISOString() }),
    }
  );
  return { ok: res.ok };
}

async function restoreActivationForVisitante(codeId, visitanteId) {
  const cid = String(codeId || '').trim();
  const vid = String(visitanteId || '').slice(0, 80);
  if (!cid || !vid) return { ok: false, restored: false };
  const res = await sbFetch(
    `alicia_premium_activations?code_id=eq.${encodeURIComponent(cid)}&visitante_id=eq.${encodeURIComponent(vid)}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ revoked_at: null }),
    }
  );
  return { ok: res.ok, restored: res.ok };
}

async function restoreLastDeviceForCode(codeId) {
  const cid = String(codeId || '').trim();
  if (!cid) return { ok: false, restored: false };
  const codeRes = await sbFetch(
    `alicia_premium_codes?id=eq.${encodeURIComponent(cid)}&select=id,last_visitante_id&limit=1`,
    { method: 'GET' }
  );
  if (!codeRes.ok || !Array.isArray(codeRes.data) || !codeRes.data[0]) {
    return { ok: false, restored: false };
  }
  const vid = String(codeRes.data[0].last_visitante_id || '').trim();
  if (!vid) return { ok: true, restored: false };
  return restoreActivationForVisitante(cid, vid);
}

async function checkPremiumStatus(codeId, visitanteId) {
  const active = await verifyPremiumCodeId(codeId, visitanteId);
  return { ok: true, active, code_id: String(codeId || '').trim() || null };
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

async function fetchReferralByPremiumCodeId(premiumCodeId) {
  const cid = String(premiumCodeId || '').trim();
  if (!cid) return null;
  const res = await sbFetch(
    `erior_referidos?premium_code_id=eq.${encodeURIComponent(cid)}&select=id,ref_code,owner_name,active,hit_count,lead_count,conversion_count,premium_code_id&limit=1`,
    { method: 'GET' }
  );
  if (!res.ok) return null;
  return Array.isArray(res.data) && res.data[0] ? res.data[0] : null;
}

async function getOrCreateReferralForPremiumCode(premiumRow) {
  if (!premiumRow || !premiumRow.id) return null;
  let ref = await fetchReferralByPremiumCodeId(premiumRow.id);
  if (!ref) ref = await createReferralForPremiumCode(premiumRow);
  return ref;
}

async function enrichActivationWithReferral(result, codeId) {
  if (!result || !result.ok || !codeId) return result;
  try {
    const codeRow = await fetchCodeById(codeId);
    if (!codeRow) return result;
    const ref = await getOrCreateReferralForPremiumCode(codeRow);
    if (ref && ref.active) {
      result.referral_code = ref.ref_code;
      result.referral_owner = ref.owner_name || codeRow.client_name || '';
      result.referral_hits = ref.hit_count || 0;
      result.referral_leads = ref.lead_count || 0;
      result.referral_conversions = ref.conversion_count || 0;
    }
  } catch (e) {
    /* no bloquear activación */
  }
  return result;
}

async function getReferralPanelForUser(codeId, visitanteId) {
  const cid = String(codeId || '').trim();
  const vid = String(visitanteId || '').slice(0, 80);
  if (!cid || !vid) return { ok: false, error: 'Faltan datos' };

  const active = await verifyPremiumCodeId(cid, vid);
  if (!active) return { ok: false, error: 'Acceso premium no activo en este dispositivo' };

  const codeRow = await fetchCodeById(cid);
  if (!codeRow || !codeRow.active) return { ok: false, error: 'Código no encontrado' };

  const ref = await getOrCreateReferralForPremiumCode(codeRow);
  if (!ref || !ref.active) return { ok: false, error: 'Tu enlace de referido no está disponible' };

  const conversions = ref.conversion_count || 0;
  return {
    ok: true,
    ref_code: ref.ref_code,
    owner_name: ref.owner_name || codeRow.client_name || '',
    hit_count: ref.hit_count || 0,
    lead_count: ref.lead_count || 0,
    conversion_count: conversions,
    goal_friends: 3,
    progress_friends: Math.min(conversions, 3),
    free_audio_every: 3,
    free_audio_progress: conversions % 3,
  };
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

const PREMIUM_QUOTA_TZ = 'America/Mexico_City';
const PREMIUM_BLOCK_MS = 24 * 60 * 60 * 1000;

function getPremiumDailyLimit() {
  const n = parseInt(process.env.ALICIA_PREMIUM_DAILY_LIMIT, 10);
  return Number.isFinite(n) && n > 0 ? n : 5;
}

function getMexicoDayKey(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PREMIUM_QUOTA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date || new Date());
}

async function fetchPremiumUsageRow(visitanteId) {
  const vid = String(visitanteId || '').slice(0, 80);
  if (!vid) return null;
  const res = await sbFetch(
    `alicia_premium_usage?visitante_id=eq.${encodeURIComponent(vid)}&select=visitante_id,code_id,day_key,messages_today,blocked_until,last_message_at&limit=1`,
    { method: 'GET' }
  );
  if (!res.ok || !Array.isArray(res.data) || !res.data[0]) return null;
  return res.data[0];
}

async function fetchPremiumUsageByCode(codeId) {
  const cid = String(codeId || '').trim();
  if (!cid) return null;
  const res = await sbFetch(
    `alicia_premium_usage?code_id=eq.${encodeURIComponent(cid)}&select=visitante_id,code_id,day_key,messages_today,blocked_until,last_message_at&order=messages_today.desc,updated_at.desc&limit=1`,
    { method: 'GET' }
  );
  if (!res.ok || !Array.isArray(res.data) || !res.data[0]) return null;
  return res.data[0];
}

async function resolvePremiumUsageRow(visitanteId, codeId) {
  const cid = String(codeId || '').trim();
  if (cid) {
    const byCode = await fetchPremiumUsageByCode(cid);
    if (byCode) return byCode;
  }
  const byVisitor = await fetchPremiumUsageRow(visitanteId);
  if (!byVisitor) return null;
  if (cid && byVisitor.code_id && byVisitor.code_id !== cid) return null;
  return byVisitor;
}

function buildQuotaPayload(row, now) {
  const limit = getPremiumDailyLimit();
  const dayKey = getMexicoDayKey(now || new Date());

  if (!row) {
    return {
      allowed: true,
      blocked: false,
      blocked_until: null,
      remaining: limit,
      used_today: 0,
      daily_limit: limit,
      limit,
    };
  }

  const isNewDay = row.day_key !== dayKey;
  const blockedUntil = !isNewDay && row.blocked_until ? new Date(row.blocked_until) : null;

  if (blockedUntil && blockedUntil > now) {
    return {
      allowed: false,
      blocked: true,
      blocked_until: blockedUntil.toISOString(),
      remaining: 0,
      used_today: Math.max(0, Number(row.messages_today) || 0),
      daily_limit: limit,
      limit,
    };
  }

  const usedToday = isNewDay ? 0 : Math.max(0, Number(row.messages_today) || 0);
  const remaining = Math.max(0, limit - usedToday);

  return {
    allowed: remaining > 0,
    blocked: false,
    blocked_until: null,
    remaining,
    used_today: usedToday,
    daily_limit: limit,
    limit,
  };
}

async function getPremiumQuotaStatus(visitanteId, codeId) {
  const cid = String(codeId || '').trim();
  const row = await resolvePremiumUsageRow(visitanteId, cid);
  const now = new Date();
  const payload = buildQuotaPayload(row, now);
  if (row && row.day_key !== getMexicoDayKey(now) && (row.messages_today || row.blocked_until)) {
    await upsertPremiumUsage(visitanteId, cid || row.code_id, {
      day_key: getMexicoDayKey(now),
      messages_today: 0,
      blocked_until: null,
    });
  }
  return payload;
}

async function resetPremiumUsageForActivation(visitanteId, codeId) {
  const cid = String(codeId || '').trim();
  if (!cid) return false;
  const existing = await fetchPremiumUsageByCode(cid);
  if (existing) return true;
  const dayKey = getMexicoDayKey();
  return upsertPremiumUsage(visitanteId, cid, {
    day_key: dayKey,
    messages_today: 0,
    blocked_until: null,
    last_message_at: null,
  });
}

async function upsertPremiumUsage(visitanteId, codeId, patch) {
  const vid = String(visitanteId || '').slice(0, 80);
  const cid = String(codeId || '').trim();
  if (!vid) return false;
  const now = new Date().toISOString();
  const payload = Object.assign({ updated_at: now }, patch || {});
  if (cid) payload.code_id = cid;

  async function patchRow(row) {
    if (!row) return false;
    const filter = row.code_id
      ? `code_id=eq.${encodeURIComponent(row.code_id)}`
      : `visitante_id=eq.${encodeURIComponent(row.visitante_id)}`;
    const res = await sbFetch(`alicia_premium_usage?${filter}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  }

  const existing = cid ? await resolvePremiumUsageRow(vid, cid) : await fetchPremiumUsageRow(vid);
  if (existing) {
    const ok = await patchRow(existing);
    if (ok) return true;
  }

  const insertBody = Object.assign(
    {
      visitante_id: vid,
      day_key: getMexicoDayKey(),
      messages_today: 0,
    },
    payload
  );
  if (cid) insertBody.code_id = cid;

  const ins = await sbFetch('alicia_premium_usage', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify([insertBody]),
  });
  if (ins.ok) return true;

  // Recuperación: choque de unique (mismo code_id u otro visitante) → patch a la fila existente
  const byCode = cid ? await fetchPremiumUsageByCode(cid) : null;
  const byVisitor = await fetchPremiumUsageRow(vid);
  const recovered = byCode || byVisitor;
  if (recovered) {
    const ok = await patchRow(recovered);
    if (ok) return true;
  }

  console.error(
    'upsertPremiumUsage failed',
    ins.status,
    typeof ins.data === 'string' ? ins.data : JSON.stringify(ins.data || {})
  );
  return false;
}

async function consumePremiumMessage(visitanteId, codeId) {
  const vid = String(visitanteId || '').slice(0, 80);
  const cid = String(codeId || '').trim();
  if (!vid) {
    return {
      ok: false,
      allowed: false,
      blocked: true,
      error: 'Sesión inválida',
      daily_limit: getPremiumDailyLimit(),
      limit: getPremiumDailyLimit(),
      remaining: 0,
    };
  }
  if (!cid) {
    return {
      ok: false,
      allowed: false,
      blocked: true,
      error: 'Código Premium inválido',
      daily_limit: getPremiumDailyLimit(),
      limit: getPremiumDailyLimit(),
      remaining: 0,
    };
  }

  const now = new Date();
  const dayKey = getMexicoDayKey(now);
  const limit = getPremiumDailyLimit();
  const row = await resolvePremiumUsageRow(vid, cid);
  const status = buildQuotaPayload(row, now);

  if (!status.allowed) {
    return Object.assign(
      { ok: false, quota_error: 'limit_reached', error: 'Límite diario Premium alcanzado' },
      status
    );
  }

  const prevUsed =
    row && row.day_key === dayKey ? Math.max(0, Number(row.messages_today) || 0) : 0;
  const nextUsed = prevUsed + 1;
  const blockedUntil =
    nextUsed >= limit ? new Date(now.getTime() + PREMIUM_BLOCK_MS).toISOString() : null;

  const saved = await upsertPremiumUsage(vid, cid, {
    day_key: dayKey,
    messages_today: nextUsed,
    blocked_until: blockedUntil,
    last_message_at: now.toISOString(),
  });

  if (!saved) {
    return {
      ok: false,
      allowed: true,
      blocked: false,
      quota_error: 'register_failed',
      error:
        'No se pudo registrar la cuota Premium. ¿Ejecutaste supabase/alicia-premium-quota.sql en Supabase?',
      daily_limit: limit,
      limit,
      remaining: Math.max(0, limit - prevUsed),
      used_today: prevUsed,
    };
  }

  return {
    ok: true,
    allowed: true,
    blocked: !!blockedUntil,
    blocked_until: blockedUntil,
    daily_limit: limit,
    limit,
    used_today: nextUsed,
    remaining: Math.max(0, limit - nextUsed),
    limit_reached: !!blockedUntil,
  };
}

function getFreeDailyLimit() {
  const n = parseInt(process.env.ALICIA_FREE_DAILY_LIMIT, 10);
  return Number.isFinite(n) && n > 0 ? n : 7;
}

async function fetchFreeUsageRow(visitanteId) {
  const vid = String(visitanteId || '').slice(0, 80);
  if (!vid) return null;
  const res = await sbFetch(
    `alicia_free_usage?visitante_id=eq.${encodeURIComponent(vid)}&select=visitante_id,day_key,messages_today,last_message_at&limit=1`,
    { method: 'GET' }
  );
  if (!res.ok) return null;
  const rows = await res.json().catch(() => []);
  return rows && rows[0] ? rows[0] : null;
}

function buildFreeQuotaPayload(row, now) {
  const limit = getFreeDailyLimit();
  const dayKey = getMexicoDayKey(now || new Date());

  if (!row) {
    return {
      allowed: true,
      blocked: false,
      remaining: limit,
      used_today: 0,
      daily_limit: limit,
      limit,
    };
  }

  const isNewDay = row.day_key !== dayKey;
  const usedToday = isNewDay ? 0 : Math.max(0, Number(row.messages_today) || 0);
  const remaining = Math.max(0, limit - usedToday);

  return {
    allowed: remaining > 0,
    blocked: remaining <= 0,
    remaining,
    used_today: usedToday,
    daily_limit: limit,
    limit,
  };
}

async function upsertFreeUsage(visitanteId, patch) {
  const vid = String(visitanteId || '').slice(0, 80);
  if (!vid) return false;
  const now = new Date().toISOString();
  const row = await fetchFreeUsageRow(vid);
  const payload = Object.assign({ updated_at: now }, patch || {});

  if (row) {
    const res = await sbFetch(
      `alicia_free_usage?visitante_id=eq.${encodeURIComponent(vid)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(payload),
      }
    );
    return res.ok;
  }

  const ins = await sbFetch('alicia_free_usage', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify([
      Object.assign(
        {
          visitante_id: vid,
          day_key: getMexicoDayKey(),
          messages_today: 0,
        },
        payload
      ),
    ]),
  });
  return ins.ok;
}

async function getFreeQuotaStatus(visitanteId) {
  const vid = String(visitanteId || '').slice(0, 80);
  if (!vid) {
    return buildFreeQuotaPayload(null, new Date());
  }
  const row = await fetchFreeUsageRow(vid);
  const now = new Date();
  const payload = buildFreeQuotaPayload(row, now);
  if (row && row.day_key !== getMexicoDayKey(now) && row.messages_today) {
    await upsertFreeUsage(vid, {
      day_key: getMexicoDayKey(now),
      messages_today: 0,
    });
  }
  return payload;
}

async function consumeFreeMessage(visitanteId) {
  const vid = String(visitanteId || '').slice(0, 80);
  const limit = getFreeDailyLimit();
  if (!vid) {
    return {
      ok: false,
      allowed: false,
      blocked: true,
      error: 'Sesión inválida',
      daily_limit: limit,
      limit,
      remaining: 0,
    };
  }

  const now = new Date();
  const dayKey = getMexicoDayKey(now);
  const row = await fetchFreeUsageRow(vid);
  const status = buildFreeQuotaPayload(row, now);

  if (!status.allowed) {
    return Object.assign(
      { ok: false, quota_error: 'limit_reached', error: 'Límite diario gratuito alcanzado' },
      status
    );
  }

  const prevUsed =
    row && row.day_key === dayKey ? Math.max(0, Number(row.messages_today) || 0) : 0;
  const nextUsed = prevUsed + 1;

  const saved = await upsertFreeUsage(vid, {
    day_key: dayKey,
    messages_today: nextUsed,
    last_message_at: now.toISOString(),
  });

  if (!saved) {
    return {
      ok: false,
      allowed: true,
      blocked: false,
      quota_error: 'register_failed',
      error:
        'No se pudo registrar la cuota gratuita. ¿Ejecutaste supabase/alicia-free-quota.sql en Supabase?',
      daily_limit: limit,
      limit,
      remaining: Math.max(0, limit - prevUsed),
      used_today: prevUsed,
    };
  }

  return {
    ok: true,
    allowed: true,
    blocked: nextUsed >= limit,
    daily_limit: limit,
    limit,
    used_today: nextUsed,
    remaining: Math.max(0, limit - nextUsed),
    limit_reached: nextUsed >= limit,
  };
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
  renewPremiumAccess,
  revokeActivationsForCode,
  restoreActivationForVisitante,
  restoreLastDeviceForCode,
  checkPremiumStatus,
  getPremiumQuotaStatus,
  consumePremiumMessage,
  resetPremiumUsageForActivation,
  getPremiumDailyLimit,
  getFreeDailyLimit,
  getFreeQuotaStatus,
  consumeFreeMessage,
  fetchReferralByCode,
  fetchReferralByPremiumCodeId,
  getOrCreateReferralForPremiumCode,
  getReferralPanelForUser,
  enrichActivationWithReferral,
  createReferralForPremiumCode,
  trackReferralHit,
  checkAdminKey,
  sbFetch,
};
