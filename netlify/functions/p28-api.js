/**
 * Reto de Manifestación 28 — códigos de acceso + muro (solo nombre).
 * Admin: header X-Admin-Key = ALICIA_ADMIN_PASSWORD
 * Si hay Supabase (erior_p28_*), lo usa. Si no, Netlify Blobs.
 */
const { corsHeaders, getSupabaseConfig, checkAdminKey, sbFetch, normalizeCode } = require('./premium-lib');

const P28_ADMIN_LOCAL = 'ERIOR28';

function p28AdminOk(event) {
  const got = event.headers['x-admin-key'] || event.headers['X-Admin-Key'] || '';
  if (got === P28_ADMIN_LOCAL) return true;
  return checkAdminKey(event);
}

const HIDDEN_CODES = new Set(['P28-WSYX-2LEF']);

function keepCode(c) {
  if (!c || !c.code) return false;
  return !HIDDEN_CODES.has(normalizeCode(c.code));
}

function seedCodes() {
  try {
    const seed = require('./p28-seed.json');
    return Array.isArray(seed.codes) ? seed.codes.filter(keepCode) : [];
  } catch (e) {
    return [];
  }
}

function putCode(map, c) {
  if (!keepCode(c)) return;
  map.set(normalizeCode(c.code), ensureCode(c));
}

async function loadCodes() {
  const map = new Map();
  const issued = await blobGet('issued', []);
  const snap = await blobGet('codes', []);
  const rows = await blobListRows();
  let sbRows = [];
  if (getSupabaseConfig()) {
    try { sbRows = await listCodesSb(); } catch (e) { sbRows = []; }
  }
  seedCodes()
    .concat(Array.isArray(issued) ? issued : [])
    .concat(Array.isArray(snap) ? snap : [])
    .concat(rows)
    .concat(sbRows)
    .forEach((c) => putCode(map, c));
  return Array.from(map.values()).sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
}

async function persistRow(row) {
  if (!keepCode(row)) return true;
  return blobSet('row-' + normalizeCode(row.code), ensureCode(row));
}

async function saveCodes(codes) {
  const existing = await blobGet('codes', []);
  const map = new Map();
  (Array.isArray(existing) ? existing : []).forEach((c) => putCode(map, c));
  (codes || []).forEach((c) => putCode(map, c));
  const all = Array.from(map.values());
  let any = false;
  for (let i = 0; i < all.length; i += 1) {
    if (await persistRow(all[i])) any = true;
  }
  const ok = await blobSet('codes', all);
  if (!ok && !any) {
    throw new Error(saveError());
  }
  return true;
}

async function appendIssued(row) {
  const log = (await blobGet('issued', [])).filter(keepCode);
  const next = [row].concat(Array.isArray(log) ? log : []).filter(keepCode).slice(0, 800);
  return blobSet('issued', next);
}

function saveError() {
  return lastBlobError
    ? ('No se pudieron guardar los códigos. ' + lastBlobError)
    : 'No se pudieron guardar los códigos. Intenta de nuevo.';
}

function randPart(n) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < n; i += 1) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function makeCode() {
  return `P28-${randPart(4)}-${randPart(4)}`;
}

function firstName(raw) {
  return String(raw || 'Alumna')
    .trim()
    .split(/\s+/)[0]
    .slice(0, 24);
}

function plusDays(from, n) {
  const d = new Date(from || Date.now());
  d.setTime(d.getTime() + (n || 30) * 86400000);
  return d.toISOString();
}

function mexicoYmd(d) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date(d));
  } catch (e) {
    return new Date(d).toISOString().slice(0, 10);
  }
}

function calendarDaysUsed(from) {
  if (!from) return 1;
  const a = new Date(`${mexicoYmd(from)}T12:00:00`);
  const b = new Date(`${mexicoYmd(Date.now())}T12:00:00`);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000) + 1);
}

function daysLeft(expires) {
  if (!expires) return 30;
  return Math.max(0, Math.ceil((new Date(expires).getTime() - Date.now()) / 86400000));
}

function ensureCode(row) {
  if (!row) return row;
  row.max_devices = row.max_devices || 2;
  row.days = row.days || 30;
  row.devices = row.devices || [];
  if (!row.expires_at) row.expires_at = plusDays(row.created_at || Date.now(), row.days);
  row.ficha = row.ficha || {};
  return row;
}

function fichaFromProfile(profile) {
  const d = (profile && profile.data) || {};
  return {
    name: String(d.name || '').slice(0, 40),
    ig: String(d.ig || '').replace(/^@/, '').slice(0, 80),
    phone: String(d.phone || '').slice(0, 40),
    email: String(d.email || '').slice(0, 80),
    area: String(d.area || '').slice(0, 24),
    wants: String(d.wants || '').slice(0, 240),
    pain: String(d.pain || '').slice(0, 240),
    purpose: String((profile && profile.purpose) || '').slice(0, 240),
    gender: String(d.gender || '').slice(0, 16)
  };
}

function mergeFicha(row, profile) {
  const next = fichaFromProfile(profile);
  const prev = (row && row.ficha) || {};
  const out = {
    name: next.name || prev.name || '',
    ig: next.ig || prev.ig || '',
    phone: next.phone || prev.phone || '',
    email: next.email || prev.email || '',
    area: next.area || prev.area || '',
    wants: next.wants || prev.wants || '',
    pain: next.pain || prev.pain || '',
    purpose: next.purpose || prev.purpose || '',
    gender: next.gender || prev.gender || ''
  };
  if (row) {
    row.ficha = out;
    if (out.phone && !row.client_contact) row.client_contact = out.phone;
  }
  return out;
}

async function attachFichas(codes) {
  const list = Array.isArray(codes) ? codes : [];
  const out = [];
  for (let i = 0; i < list.length; i += 1) {
    const row = Object.assign({}, list[i]);
    const code = normalizeCode(row.code);
    let profile = null;
    try { profile = await blobGet('profile-' + code, null); } catch (e) { profile = null; }
    row.ficha = mergeFicha(row, profile);
    out.push(row);
  }
  return out;
}

function rowExpired(row) {
  if (!row) return true;
  if (row.active === false) return true;
  ensureCode(row);
  if (row.expires_at && Date.now() > new Date(row.expires_at).getTime()) return true;
  const start = row.started_at || row.created_at;
  return !!(start && calendarDaysUsed(start) > 30);
}

function accessFrom(row) {
  ensureCode(row);
  return {
    name: firstName(row.client_name),
    pack: row.pack || 1,
    code: row.code,
    expires_at: row.expires_at,
    days_left: daysLeft(row.expires_at),
    devices_used: (row.devices || []).length,
    max_devices: row.max_devices || 2,
  };
}

function bindDevice(row, device, deviceLabel) {
  ensureCode(row);
  if (!device) return true;
  const known = row.devices.find((d) => d.id === device);
  if (known) {
    known.at = new Date().toISOString();
    return true;
  }
  if (row.devices.length >= (row.max_devices || 2)) return false;
  row.devices.push({ id: device, label: deviceLabel || 'Aparato', at: new Date().toISOString() });
  return true;
}

let blobsContext = null;
let lastBlobError = '';

function subBlobKey(endpoint) {
  return 'sub-' + String(endpoint || '').replace(/[^a-zA-Z0-9]/g, '').slice(-40);
}

function attachBlobs(event, context) {
  blobsContext = context || null;
  try {
    const blobs = require('@netlify/blobs');
    if (event && typeof blobs.connectLambda === 'function') blobs.connectLambda(event);
  } catch (e) {
    lastBlobError = e.message || String(e);
  }
}

async function blobStore() {
  try {
    const { getStore } = require('@netlify/blobs');
    const siteID = (blobsContext && blobsContext.site && blobsContext.site.id) || process.env.SITE_ID || process.env.NETLIFY_SITE_ID || '';
    const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN || '';
    const tries = [];
    if (siteID && token) tries.push({ name: 'p28', siteID: siteID, token: token, consistency: 'eventual' });
    tries.push({ name: 'p28', consistency: 'eventual' });
    for (let i = 0; i < tries.length; i += 1) {
      try {
        return getStore(tries[i]);
      } catch (e) {
        lastBlobError = e.message || String(e);
      }
    }
    try { return getStore('p28'); } catch (e2) {
      lastBlobError = e2.message || String(e2);
      return null;
    }
  } catch (e) {
    lastBlobError = e.message || String(e);
    return null;
  }
}

async function blobGet(key, fallback) {
  try {
    const store = await blobStore();
    if (!store) return fallback;
    let data;
    try {
      data = await store.get(key, { type: 'json', consistency: 'eventual' });
    } catch (e) {
      data = await store.get(key, { type: 'json' });
    }
    return data || fallback;
  } catch (e) {
    lastBlobError = e.message || String(e);
    return fallback;
  }
}

async function blobSet(key, value) {
  const store = await blobStore();
  if (!store) return false;
  const payload = JSON.stringify(value);
  const writes = [
    function () { return store.setJSON(key, value, { consistency: 'eventual' }); },
    function () { return store.setJSON(key, value); },
    function () { return store.set(key, payload, { consistency: 'eventual' }); },
    function () { return store.set(key, payload); },
  ];
  for (let i = 0; i < writes.length; i += 1) {
    try {
      if (i < 2 && typeof store.setJSON !== 'function') continue;
      await writes[i]();
      return true;
    } catch (e) {
      lastBlobError = e.message || String(e);
    }
  }
  return false;
}

async function blobListRows() {
  try {
    const store = await blobStore();
    if (!store || typeof store.list !== 'function') return [];
    const page = await store.list({ prefix: 'row-' });
    const blobs = (page && page.blobs) || [];
    const out = [];
    for (let i = 0; i < blobs.length; i += 1) {
      const key = blobs[i] && blobs[i].key;
      if (!key) continue;
      let data;
      try { data = await store.get(key, { type: 'json', consistency: 'eventual' }); }
      catch (e) { data = await store.get(key, { type: 'json' }); }
      if (data && data.code) out.push(data);
    }
    return out;
  } catch (e) {
    lastBlobError = e.message || String(e);
    return [];
  }
}

async function listCodesSb() {
  const res = await sbFetch(
    'erior_p28_codes?select=id,code,client_name,pack,client_contact,notes,active,created_at,last_used_at&order=created_at.desc&limit=400',
    { method: 'GET' }
  );
  if (!res.ok) throw new Error('No se pudieron leer códigos P28');
  return Array.isArray(res.data) ? res.data : [];
}

async function listWallSb() {
  const res = await sbFetch(
    'erior_p28_wall?select=who,txt,day,created_at&approved=eq.true&order=created_at.desc&limit=80',
    { method: 'GET' }
  );
  if (!res.ok) throw new Error('No se pudo leer el muro');
  return Array.isArray(res.data) ? res.data : [];
}

async function sendOnePush(sub, title, body, tag) {
  let webpush;
  try {
    webpush = require('web-push');
  } catch (e) {
    throw new Error('web-push no está instalado');
  }
  const pub = process.env.P28_VAPID_PUBLIC || 'BAiWc2iqXyjI9cHcH1SjemkJyEXVG__4CKyOngh1hnZsIjhzTB19ul1Dv6x09d7Gt7fRwZoKg6glr4hZPvH3hRo';
  const priv = process.env.P28_VAPID_PRIVATE || 'TIixs1I_-Eg2opdnKaLcMd-nGG4fk_NdsMcGET4Maq0';
  webpush.setVapidDetails('mailto:eriorcenter@gmail.com', pub, priv);
  await webpush.sendNotification(
    { endpoint: sub.endpoint, keys: sub.keys },
    JSON.stringify({ title: title || 'Erior Center', body: body || '', tag: tag || 'p28-daily' })
  );
}

exports.handler = async (event, context) => {
  attachBlobs(event, context);
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    body = {};
  }

  const qs = event.queryStringParameters || {};
  const action = String(body.action || qs.action || 'wall').toLowerCase();
  const sb = !!getSupabaseConfig();

  try {
    if (action === 'vapid') {
      const pub = process.env.P28_VAPID_PUBLIC || 'BAiWc2iqXyjI9cHcH1SjemkJyEXVG__4CKyOngh1hnZsIjhzTB19ul1Dv6x09d7Gt7fRwZoKg6glr4hZPvH3hRo';
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, publicKey: pub }) };
    }

    if (action === 'subscribe') {
      const sub = body.subscription;
      if (!sub || !sub.endpoint) {
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Falta suscripción' }) };
      }
      const next = {
        endpoint: sub.endpoint,
        keys: sub.keys,
        code: String(body.code || ''),
        hour: String(body.hour || '21:00'),
        on: true,
      };
      const subs = await blobGet('subs', []);
      const i = subs.findIndex((s) => s.endpoint === sub.endpoint);
      if (i >= 0) subs[i] = Object.assign({}, subs[i], next);
      else subs.push(next);
      await blobSet(subBlobKey(sub.endpoint), next);
      await blobSet('subs', subs);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'unsubscribe') {
      const endpoint = String(body.endpoint || '');
      if (!endpoint) return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Falta endpoint' }) };
      const prev = (await blobGet(subBlobKey(endpoint), {})) || {};
      await blobSet(subBlobKey(endpoint), Object.assign({}, prev, { endpoint: endpoint, on: false }));
      const subs = (await blobGet('subs', [])).filter((s) => s.endpoint !== endpoint);
      await blobSet('subs', subs);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'push-test') {
      const sub = body.subscription;
      if (!sub || !sub.endpoint) {
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Falta suscripción' }) };
      }
      try {
        await sendOnePush(sub, 'Erior Center', 'Avisos encendidos. Este es el de prueba.', 'p28-test');
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, sent: 1 }) };
      } catch (e) {
        return { statusCode: 200, headers, body: JSON.stringify({ ok: false, error: e.message || 'No se pudo enviar el aviso' }) };
      }
    }

    if (action === 'wall' && event.httpMethod === 'GET') {
      let items = [];
      if (sb) {
        try {
          items = await listWallSb();
        } catch (e) {
          items = (await blobGet('wall', [])).slice();
        }
      } else {
        items = (await blobGet('wall', [])).slice();
      }
      const publicItems = items.map((w) => ({
        id: w.id,
        who: firstName(w.who),
        txt: String(w.txt || '').slice(0, 600),
        day: w.day || 28,
      }));
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, wall: publicItems }) };
    }

    if (action === 'wall' && event.httpMethod === 'POST') {
      const who = firstName(body.who);
      const txt = String(body.txt || '').trim();
      if (txt.length < 12) {
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Escribe un poco más' }) };
      }
      const row = {
        id: 'w-' + Date.now().toString(36),
        who,
        txt: txt.slice(0, 600),
        day: Number(body.day) || 28,
        created_at: new Date().toISOString(),
      };
      if (sb) {
        const res = await sbFetch('erior_p28_wall', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ who: row.who, txt: row.txt, day: row.day, approved: true }),
        });
        if (!res.ok) {
          const wall = await blobGet('wall', []);
          wall.unshift(row);
          await blobSet('wall', wall.slice(0, 120));
        }
      } else {
        const wall = await blobGet('wall', []);
        wall.unshift(row);
        await blobSet('wall', wall.slice(0, 120));
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, item: { who: row.who, txt: row.txt, day: row.day } }) };
    }

    if (action === 'unlock') {
      const code = normalizeCode(body.code);
      const device = String(body.device || '').slice(0, 80);
      const deviceLabel = String(body.deviceLabel || 'Aparato').slice(0, 40);
      if (!code || code.length < 8) {
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Código incompleto' }) };
      }
      const codes = await loadCodes();
      let row = codes.find((c) => normalizeCode(c.code) === code && c.active !== false);
      if (!row && sb) {
        const res = await sbFetch(`erior_p28_codes?code=eq.${encodeURIComponent(code)}&select=*`, { method: 'GET' });
        row = res.ok && Array.isArray(res.data) ? res.data[0] : null;
        if (row && row.active !== false) codes.unshift(row);
      }
      if (!row || row.active === false) {
        return { statusCode: 403, headers, body: JSON.stringify({ ok: false, error: 'Ese código no existe o ya no sirve', code: 'missing' }) };
      }
      ensureCode(row);
      if (rowExpired(row)) {
        return { statusCode: 403, headers, body: JSON.stringify({ ok: false, error: 'Tu acceso de 30 días terminó. Tus datos siguen. Erior puede reactivar otros 30.', code: 'expired' }) };
      }
      if (!row.started_at) row.started_at = new Date().toISOString();
      if (!bindDevice(row, device, deviceLabel)) {
        return { statusCode: 403, headers, body: JSON.stringify({ ok: false, error: 'Este código ya tiene sus accesos ocupados.', code: 'devices' }) };
      }
      row.last_used_at = new Date().toISOString();
      try { await saveCodes(codes); } catch (e) { /* el seed sigue abriendo */ }
      if (sb && row.id) {
        await sbFetch(`erior_p28_codes?id=eq.${encodeURIComponent(row.id)}`, {
          method: 'PATCH',
          body: JSON.stringify({ last_used_at: row.last_used_at }),
        });
      }
      const profile = await blobGet('profile-' + code, null);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, access: accessFrom(row), profile }) };
    }

    if (action === 'profile-get') {
      const code = normalizeCode(body.code);
      if (!code) return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Falta código' }) };
      const codes = await loadCodes();
      const row = codes.find((c) => normalizeCode(c.code) === code);
      if (!row) return { statusCode: 404, headers, body: JSON.stringify({ ok: false, error: 'No encontré ese código' }) };
      const profile = await blobGet('profile-' + code, null);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, profile, access: accessFrom(row), active: row.active !== false }) };
    }

    if (action === 'profile-set') {
      const code = normalizeCode(body.code);
      if (!code) return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Falta código' }) };
      const codes = await loadCodes();
      const row = codes.find((c) => normalizeCode(c.code) === code);
      if (!row || row.active === false) {
        return { statusCode: 403, headers, body: JSON.stringify({ ok: false, error: 'Ese código no está activo' }) };
      }
      const photo = String(body.photo || '');
      const prev = (await blobGet('profile-' + code, {})) || {};
      const profile = {
        data: body.data || prev.data || {},
        vision: body.vision || prev.vision || {},
        photo: photo.length > 380000 ? (prev.photo || '') : (photo || prev.photo || ''),
        purpose: String(body.purpose || prev.purpose || '').slice(0, 400),
        remindOn: body.remindOn == null ? !!prev.remindOn : !!body.remindOn,
        remindOff: body.remindOff == null ? !!prev.remindOff : !!body.remindOff,
        remindAt: String(body.remindAt || prev.remindAt || '21:00'),
        updated_at: new Date().toISOString(),
      };
      await blobSet('profile-' + code, profile);
      row.ficha = mergeFicha(row, profile);
      try { await persistRow(row); } catch (e) { /* la ficha ya quedó en profile- */ }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ficha: row.ficha }) };
    }

    if (!p28AdminOk(event)) {
      return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: 'No autorizado' }) };
    }

    if (action === 'list') {
      const codes = await attachFichas(await loadCodes());
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, codes, mode: 'blob' }) };
    }

    if (action === 'issue') {
      const name = firstName(body.name);
      const pack = Math.min(3, Math.max(1, parseInt(body.pack, 10) || 1));
      const contact = String(body.contact || '').trim().slice(0, 80);
      const notes = String(body.notes || '').trim().slice(0, 240);
      const code = body.code ? normalizeCode(body.code) : makeCode();
      const days = Math.min(90, Math.max(7, parseInt(body.days, 10) || 30));
      const row = {
        code,
        client_name: name,
        pack,
        client_contact: contact,
        notes,
        active: true,
        days,
        max_devices: Math.min(2, Math.max(1, parseInt(body.max_devices, 10) || 2)),
        devices: [],
        created_at: new Date().toISOString(),
        expires_at: plusDays(Date.now(), days),
      };
      let sbOk = false;
      if (sb) {
        try {
          const res = await sbFetch('erior_p28_codes', {
            method: 'POST',
            headers: { Prefer: 'return=representation' },
            body: JSON.stringify({ code: row.code, client_name: row.client_name, pack: row.pack, client_contact: row.client_contact, notes: row.notes, active: true }),
          });
          if (res.ok && res.data && res.data[0]) {
            row.id = res.data[0].id;
            sbOk = true;
          }
        } catch (e) { /* el blob es la fuente real */ }
      }
      const codes = await loadCodes();
      codes.unshift(row);
      const rowOk = await persistRow(row);
      const issuedOk = await appendIssued(row);
      let listOk = false;
      try {
        await saveCodes(codes);
        listOk = true;
      } catch (e) { /* si ya quedó en row-/issued/supabase, sirve */ }
      if (!rowOk && !issuedOk && !listOk && !sbOk) {
        throw new Error(saveError());
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, row, mode: 'blob' }) };
    }

    if (action === 'reactivate') {
      const code = normalizeCode(body.code);
      const days = Math.min(90, Math.max(7, parseInt(body.days, 10) || 30));
      const codes = await loadCodes();
      const row = codes.find((c) => normalizeCode(c.code) === code);
      if (!row) return { statusCode: 404, headers, body: JSON.stringify({ ok: false, error: 'No encontré ese código' }) };
      row.active = true;
      row.days = days;
      row.started_at = new Date().toISOString();
      row.expires_at = plusDays(Date.now(), days);
      await saveCodes(codes);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, row }) };
    }

    if (action === 'reset-devices') {
      const code = normalizeCode(body.code);
      const codes = await loadCodes();
      const row = codes.find((c) => normalizeCode(c.code) === code);
      if (!row) return { statusCode: 404, headers, body: JSON.stringify({ ok: false, error: 'No encontré ese código' }) };
      row.devices = [];
      await saveCodes(codes);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, row }) };
    }

    if (action === 'wall-del') {
      const id = String(body.id || '');
      if (sb) {
        await sbFetch(`erior_p28_wall?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      }
      const wall = (await blobGet('wall', [])).filter((w) => String(w.id) !== id);
      await blobSet('wall', wall);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'broadcast') {
      let webpush;
      try {
        webpush = require('web-push');
      } catch (e) {
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, sent: 0, note: 'web-push no instalado en Netlify' }) };
      }
      const pub = process.env.P28_VAPID_PUBLIC || 'BAiWc2iqXyjI9cHcH1SjemkJyEXVG__4CKyOngh1hnZsIjhzTB19ul1Dv6x09d7Gt7fRwZoKg6glr4hZPvH3hRo';
      const priv = process.env.P28_VAPID_PRIVATE || 'TIixs1I_-Eg2opdnKaLcMd-nGG4fk_NdsMcGET4Maq0';
      webpush.setVapidDetails('mailto:eriorcenter@gmail.com', pub, priv);
      const payload = JSON.stringify({
        title: String(body.title || 'ERIOR'),
        body: String(body.body || 'Reto de Manifestación 28.'),
        tag: 'p28-daily',
      });
      const subs = await blobGet('subs', []);
      const keep = [];
      let sent = 0;
      for (let i = 0; i < subs.length; i += 1) {
        try {
          await webpush.sendNotification({ endpoint: subs[i].endpoint, keys: subs[i].keys }, payload);
          sent += 1;
          keep.push(subs[i]);
        } catch (e) {
          if (e.statusCode === 404 || e.statusCode === 410) {
            await blobSet(subBlobKey(subs[i].endpoint), Object.assign({}, subs[i], { on: false }));
          } else {
            keep.push(subs[i]);
          }
        }
      }
      await blobSet('subs', keep);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, sent, total: keep.length }) };
    }

    if (action === 'revoke') {
      const code = normalizeCode(body.code);
      if (sb) {
        await sbFetch(`erior_p28_codes?code=eq.${encodeURIComponent(code)}`, {
          method: 'PATCH',
          body: JSON.stringify({ active: false }),
        });
      }
      const codes = await loadCodes();
      codes.forEach((c) => {
        if (normalizeCode(c.code) === code) c.active = false;
      });
      await saveCodes(codes);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Acción no válida' }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: err.message || 'Error P28' }),
    };
  }
};
