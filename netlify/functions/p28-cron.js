/**
 * Manda 4 avisos al día aunque la app esté cerrada.
 * Corre cada 15 min. Horas al azar en la zona del celular.
 * No borra suscripciones salvo 410/404 o cancelación manual (on: false).
 */
const MESSAGES = {
  listen: { title: 'Erior Center', body: '¿Ya escuchaste tu audio hoy?' },
  portal: { title: 'Erior Center', body: 'Estás en el reto. No en el piloto automático.' },
  offer: { title: 'Erior Center', body: 'Tu audio está ahí. Ponlo ahora.' },
  night: { title: 'Erior Center', body: 'Audio en loop, bajito. Déjalo trabajar.' },
};

function hashStr(s) {
  let h = 2166136261;
  s = String(s || '');
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function slotsForDay(dateYmd, seed) {
  let h = hashStr(String(dateYmd) + '|' + String(seed || ''));
  const used = {};
  const out = [];
  let guard = 0;
  while (out.length < 4 && guard < 80) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    const hour = 8 + (h % 14);
    if (!used[hour]) {
      used[hour] = true;
      h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
      const min = h % 60;
      out.push(String(hour).padStart(2, '0') + ':' + String(min).padStart(2, '0'));
    }
    guard += 1;
  }
  out.sort();
  return out;
}

function clockInTz(tz) {
  try {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const p = {};
    fmt.formatToParts(new Date()).forEach((x) => { p[x.type] = x.value; });
    return { date: p.year + '-' + p.month + '-' + p.day, h: Number(p.hour), m: Number(p.minute) };
  } catch (e) {
    const d = new Date();
    return { date: d.toISOString().slice(0, 10), h: d.getUTCHours(), m: d.getUTCMinutes() };
  }
}

function near(h, m, th, tm, windowMin) {
  return Math.abs(h * 60 + m - (th * 60 + tm)) <= (windowMin || 16);
}

function parseHour(hm) {
  const p = String(hm || '12:00').split(':');
  return { h: Number(p[0]) || 12, m: Number(p[1]) || 0 };
}

function subBlobKey(endpoint) {
  return 'sub-' + String(endpoint || '').replace(/[^a-zA-Z0-9]/g, '').slice(-40);
}

function attachBlobs(event) {
  try {
    const blobs = require('@netlify/blobs');
    if (event && typeof blobs.connectLambda === 'function') blobs.connectLambda(event);
  } catch (e) { /* scheduled fn igual intenta getStore */ }
}

async function store() {
  try {
    const { getStore } = require('@netlify/blobs');
    const siteID = process.env.SITE_ID || process.env.NETLIFY_SITE_ID || '';
    const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN || '';
    const tries = [];
    if (siteID && token) tries.push({ name: 'p28', siteID: siteID, token: token, consistency: 'eventual' });
    tries.push({ name: 'p28', consistency: 'eventual' });
    for (let i = 0; i < tries.length; i += 1) {
      try { return getStore(tries[i]); } catch (e) { /* siguiente */ }
    }
    try { return getStore('p28'); } catch (e2) { return null; }
  } catch (e) {
    return null;
  }
}

async function readJson(s, key) {
  if (!s) return { ok: false, data: null };
  try {
    try {
      return { ok: true, data: await s.get(key, { type: 'json', consistency: 'eventual' }) };
    } catch (e) {
      return { ok: true, data: await s.get(key, { type: 'json' }) };
    }
  } catch (e) {
    return { ok: false, data: null };
  }
}

async function writeJson(s, key, value) {
  if (!s) return false;
  try {
    if (typeof s.setJSON === 'function') {
      try { await s.setJSON(key, value, { consistency: 'eventual' }); return true; }
      catch (e) { await s.setJSON(key, value); return true; }
    }
    await s.set(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

async function loadSubs(s) {
  const got = await readJson(s, 'subs');
  if (!got.ok) return { ok: false, list: [] };
  const map = new Map();
  (Array.isArray(got.data) ? got.data : []).forEach((row) => {
    if (row && row.endpoint && row.on !== false) map.set(row.endpoint, row);
  });
  try {
    if (s && typeof s.list === 'function') {
      const page = await s.list({ prefix: 'sub-' });
      const blobs = (page && page.blobs) || [];
      for (let i = 0; i < blobs.length; i += 1) {
        const one = await readJson(s, blobs[i].key);
        if (!one.ok || !one.data || !one.data.endpoint) continue;
        if (one.data.on === false) {
          map.delete(one.data.endpoint);
          continue;
        }
        map.set(one.data.endpoint, one.data);
      }
    }
  } catch (e) { /* la lista principal basta */ }
  return { ok: true, list: Array.from(map.values()) };
}

async function run() {
  const s = await store();
  const loaded = await loadSubs(s);
  if (!loaded.ok) return { ok: false, sent: 0, error: 'no pude leer avisos' };
  const subs = loaded.list;
  if (!subs.length) return { ok: true, sent: 0, reason: 'sin suscripciones' };

  const pingsGot = await readJson(s, 'pings');
  const pings = (pingsGot.ok && pingsGot.data && typeof pingsGot.data === 'object') ? pingsGot.data : {};

  let webpush;
  try { webpush = require('web-push'); } catch (e) {
    return { ok: false, sent: 0, error: 'web-push no instalado' };
  }
  const pub = process.env.P28_VAPID_PUBLIC || 'BAiWc2iqXyjI9cHcH1SjemkJyEXVG__4CKyOngh1hnZsIjhzTB19ul1Dv6x09d7Gt7fRwZoKg6glr4hZPvH3hRo';
  const priv = process.env.P28_VAPID_PRIVATE || 'TIixs1I_-Eg2opdnKaLcMd-nGG4fk_NdsMcGET4Maq0';
  webpush.setVapidDetails('mailto:eriorcenter@gmail.com', pub, priv);

  let sent = 0;
  const keep = [];
  for (let i = 0; i < subs.length; i += 1) {
    const sub = subs[i];
    keep.push(sub);
    const tz = sub.tz || 'America/Mexico_City';
    const now = clockInTz(tz);
    const seed = sub.seed || sub.code || sub.endpoint;
    const slots = (Array.isArray(sub.slots) && sub.slots.length && sub.slotsDate === now.date)
      ? sub.slots
      : slotsForDay(now.date, seed);
    const kinds = ['listen', 'portal', 'offer', 'night'];
    let kind = '';
    let slot = '';
    for (let n = 0; n < slots.length; n += 1) {
      const hm = parseHour(slots[n]);
      if (near(now.h, now.m, hm.h, hm.m, 16)) {
        kind = kinds[n] || 'listen';
        slot = slots[n];
        break;
      }
    }
    if (!kind) continue;
    const key = now.date + '-' + slot + '-' + String(sub.endpoint || '').slice(-18);
    if (pings[key]) continue;
    const msg = MESSAGES[kind];
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        JSON.stringify({ title: msg.title, body: msg.body, tag: 'p28-' + kind })
      );
      pings[key] = true;
      sent += 1;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) {
        keep.pop();
        await writeJson(s, subBlobKey(sub.endpoint), Object.assign({}, sub, { on: false }));
      }
    }
  }
  await writeJson(s, 'subs', keep);
  await writeJson(s, 'pings', pings);
  const stamp = clockInTz('UTC');
  return { ok: true, sent: sent, total: keep.length, at: stamp.date + ' ' + stamp.h + ':' + stamp.m };
}

exports.config = { schedule: '*/10 * * * *' };

exports.handler = async (event) => {
  attachBlobs(event);
  try {
    const out = await run();
    return { statusCode: 200, body: JSON.stringify(out) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message || 'cron' }) };
  }
};
