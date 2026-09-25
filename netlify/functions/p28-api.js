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

function seedCodes() {
  try {
    const seed = require('./p28-seed.json');
    return Array.isArray(seed.codes) ? seed.codes.slice() : [];
  } catch (e) {
    return [];
  }
}

async function loadCodes() {
  const map = new Map();
  seedCodes().concat(await blobGet('codes', [])).forEach((c) => {
    if (c && c.code) map.set(normalizeCode(c.code), ensureCode(c));
  });
  return Array.from(map.values());
}

async function saveCodes(codes) {
  const ok = await blobSet('codes', codes);
  if (!ok) throw new Error('No se pudieron guardar los códigos. Intenta de nuevo.');
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
  return row;
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

async function blobStore() {
  try {
    const { getStore } = require('@netlify/blobs');
    try {
      return getStore({ name: 'p28', consistency: 'strong' });
    } catch (e) {
      return getStore('p28');
    }
  } catch (e) {
    return null;
  }
}

async function blobGet(key, fallback) {
  const store = await blobStore();
  if (!store) return fallback;
  const data = await store.get(key, { type: 'json' });
  return data || fallback;
}

async function blobSet(key, value) {
  const store = await blobStore();
  if (!store) return false;
  await store.setJSON(key, value);
  return true;
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

exports.handler = async (event) => {
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
      const subs = await blobGet('subs', []);
      const next = {
        endpoint: sub.endpoint,
        keys: sub.keys,
        code: String(body.code || ''),
        hour: String(body.hour || '21:00'),
      };
      const i = subs.findIndex((s) => s.endpoint === sub.endpoint);
      if (i >= 0) subs[i] = next;
      else subs.push(next);
      await blobSet('subs', subs);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
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
      if (Date.now() > new Date(row.expires_at).getTime()) {
        return { statusCode: 403, headers, body: JSON.stringify({ ok: false, error: 'Tu acceso de 30 días terminó. Tus datos siguen. Erior puede reactivar otros 30.', code: 'expired' }) };
      }
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
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, access: accessFrom(row) }) };
    }

    if (!p28AdminOk(event)) {
      return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: 'No autorizado' }) };
    }

    if (action === 'list') {
      const codes = await loadCodes();
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
      if (sb) {
        const res = await sbFetch('erior_p28_codes', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ code: row.code, client_name: row.client_name, pack: row.pack, client_contact: row.client_contact, notes: row.notes, active: true }),
        });
        if (res.ok && res.data && res.data[0]) row.id = res.data[0].id;
      }
      const codes = await loadCodes();
      codes.unshift(row);
      await saveCodes(codes);
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
      let sent = 0;
      for (let i = 0; i < subs.length; i += 1) {
        try {
          await webpush.sendNotification({ endpoint: subs[i].endpoint, keys: subs[i].keys }, payload);
          sent += 1;
        } catch (e) {
          if (e.statusCode === 404 || e.statusCode === 410) subs.splice(i, 1);
        }
      }
      await blobSet('subs', subs);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, sent, total: subs.length }) };
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
