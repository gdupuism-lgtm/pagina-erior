import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const webpush = require('web-push');
const vapid = JSON.parse(fs.readFileSync(new URL('./vapid.json', import.meta.url), 'utf8'));
webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DATA = path.join(HERE, 'data.json');
const PORT = Number(process.env.P28_PORT || 8787);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json',
  '.mp4': 'video/mp4',
  '.m4a': 'audio/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
};

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA, 'utf8'));
  } catch (e) {
    return { codes: [], wall: [] };
  }
}

function save(db) {
  fs.writeFileSync(DATA, JSON.stringify(db, null, 2));
}

function firstName(raw) {
  return String(raw || 'Alumna').trim().split(/\s+/)[0].slice(0, 24);
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

function send(res, status, data, type) {
  res.writeHead(status, {
    'Content-Type': type || 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(typeof data === 'string' ? data : JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let b = '';
    req.on('data', (c) => { b += c; if (b.length > 2e6) req.destroy(); });
    req.on('end', () => {
      try { resolve(JSON.parse(b || '{}')); } catch (e) { resolve({}); }
    });
  });
}

function safeJoin(root, urlPath) {
  const clean = decodeURIComponent((urlPath || '/').split('?')[0]).replace(/\\/g, '/');
  const target = path.normalize(path.join(root, clean));
  if (!target.startsWith(root)) return null;
  return target;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'OPTIONS') {
    send(res, 204, '');
    return;
  }

  if (url.pathname === '/api/p28' || url.pathname === '/.netlify/functions/p28-api') {
    const db = load();
    const q = url.searchParams.get('action');
    let body = {};
    if (req.method === 'POST') body = await readBody(req);
    const action = String(body.action || q || (req.method === 'GET' ? 'wall' : '')).toLowerCase();

    if (action === 'vapid') {
      send(res, 200, { ok: true, publicKey: vapid.publicKey });
      return;
    }
    if (action === 'wall' && req.method === 'GET') {
      send(res, 200, {
        ok: true,
        wall: (db.wall || []).map((w) => ({
          id: w.id,
          who: firstName(w.who),
          txt: w.txt,
          day: w.day || 28,
        })),
      });
      return;
    }
    if (action === 'wall' && req.method === 'POST') {
      const txt = String(body.txt || '').trim();
      if (txt.length < 12) { send(res, 400, { ok: false, error: 'Escribe un poco más' }); return; }
      const item = {
        id: 'w-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        who: firstName(body.who),
        txt: txt.slice(0, 600),
        day: Number(body.day) || 28,
        at: Date.now(),
      };
      db.wall = db.wall || [];
      db.wall.unshift(item);
      save(db);
      send(res, 200, { ok: true, item });
      return;
    }
    if (action === 'wall-del') {
      const id = String(body.id || '');
      db.wall = (db.wall || []).filter((w) => String(w.id) !== id);
      save(db);
      send(res, 200, { ok: true });
      return;
    }
    if (action === 'push-test') {
      send(res, 200, { ok: true, sent: 0, note: 'local: no hay push de servidor' });
      return;
    }
    if (action === 'subscribe') {
      const sub = body.subscription;
      if (!sub || !sub.endpoint) { send(res, 400, { ok: false, error: 'Falta suscripción' }); return; }
      db.subs = db.subs || [];
      if (!db.subs.some((s) => s.endpoint === sub.endpoint)) {
        db.subs.push({
          endpoint: sub.endpoint,
          keys: sub.keys,
          code: String(body.code || ''),
          hour: String(body.hour || '21:00'),
        });
        save(db);
      } else {
        db.subs = db.subs.map((s) => (s.endpoint === sub.endpoint ? Object.assign({}, s, { hour: body.hour || s.hour, code: body.code || s.code }) : s));
        save(db);
      }
      send(res, 200, { ok: true });
      return;
    }
    if (action === 'broadcast') {
      const title = String(body.title || 'ERIOR');
      const text = String(body.body || 'Reto de Manifestación 28.');
      const payload = JSON.stringify({ title, body: text, tag: 'p28-daily' });
      const subs = db.subs || [];
      let sent = 0;
      for (const s of subs) {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload);
          sent += 1;
        } catch (e) {
          if (e.statusCode === 404 || e.statusCode === 410) {
            db.subs = (db.subs || []).filter((x) => x.endpoint !== s.endpoint);
          }
        }
      }
      save(db);
      send(res, 200, { ok: true, sent, total: subs.length });
      return;
    }
    if (action === 'unlock') {
      const code = String(body.code || '').trim().toUpperCase().replace(/\s+/g, '');
      const device = String(body.device || '').slice(0, 80);
      const deviceLabel = String(body.deviceLabel || 'Aparato').slice(0, 40);
      const row = (db.codes || []).find((c) => c.code === code && c.active !== false);
      if (!row) { send(res, 403, { ok: false, error: 'Ese código no existe o ya no sirve', code: 'missing' }); return; }
      ensureCode(row);
      if (Date.now() > new Date(row.expires_at).getTime()) {
        send(res, 403, { ok: false, error: 'Tu acceso de 30 días terminó. Tus datos siguen. Erior puede reactivar otros 30.', code: 'expired' });
        return;
      }
      const known = (row.devices || []).find((d) => d.id === device);
      if (!known) {
        if ((row.devices || []).length >= (row.max_devices || 2)) {
          send(res, 403, { ok: false, error: 'Este código ya tiene sus accesos ocupados.', code: 'devices' });
          return;
        }
        if (device) row.devices.push({ id: device, label: deviceLabel, at: new Date().toISOString() });
      } else {
        known.at = new Date().toISOString();
      }
      row.last_used_at = new Date().toISOString();
      save(db);
      send(res, 200, { ok: true, access: accessFrom(row) });
      return;
    }
    if (action === 'list') {
      (db.codes || []).forEach(ensureCode);
      send(res, 200, { ok: true, codes: db.codes || [] });
      return;
    }
    if (action === 'issue') {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const part = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const days = Math.min(90, Math.max(7, parseInt(body.days, 10) || 30));
      const row = {
        code: String(body.code || `P28-${part(4)}-${part(4)}`).toUpperCase(),
        client_name: firstName(body.name),
        pack: Math.min(3, Math.max(1, parseInt(body.pack, 10) || 1)),
        client_contact: String(body.contact || '').slice(0, 80),
        notes: String(body.notes || '').slice(0, 240),
        active: true,
        days,
        max_devices: Math.min(2, Math.max(1, parseInt(body.max_devices, 10) || 2)),
        devices: [],
        created_at: new Date().toISOString(),
        expires_at: plusDays(Date.now(), days),
      };
      db.codes = db.codes || [];
      db.codes.unshift(row);
      save(db);
      send(res, 200, { ok: true, row });
      return;
    }
    if (action === 'reactivate') {
      const code = String(body.code || '').toUpperCase();
      const days = Math.min(90, Math.max(7, parseInt(body.days, 10) || 30));
      let row = null;
      (db.codes || []).forEach((c) => {
        if (c.code === code) {
          c.active = true;
          c.days = days;
          c.expires_at = plusDays(Date.now(), days);
          row = c;
        }
      });
      if (!row) { send(res, 404, { ok: false, error: 'No encontré ese código' }); return; }
      save(db);
      send(res, 200, { ok: true, row });
      return;
    }
    if (action === 'reset-devices') {
      const code = String(body.code || '').toUpperCase();
      let row = null;
      (db.codes || []).forEach((c) => {
        if (c.code === code) { c.devices = []; row = c; }
      });
      if (!row) { send(res, 404, { ok: false, error: 'No encontré ese código' }); return; }
      save(db);
      send(res, 200, { ok: true, row });
      return;
    }
    if (action === 'revoke') {
      const code = String(body.code || '').toUpperCase();
      (db.codes || []).forEach((c) => { if (c.code === code) c.active = false; });
      save(db);
      send(res, 200, { ok: true });
      return;
    }
    send(res, 400, { ok: false, error: 'Acción no válida' });
    return;
  }

  let file = safeJoin(ROOT, url.pathname);
  if (!file) { send(res, 403, 'Forbidden', 'text/plain'); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { send(res, 404, 'Not found', 'text/plain'); return; }
  const ext = path.extname(file).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  const stat = fs.statSync(file);
  const range = req.headers.range;
  if (range && /^bytes=/.test(range)) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    if (start >= stat.size || end >= stat.size) {
      res.writeHead(416, { 'Content-Range': 'bytes */' + stat.size });
      res.end();
      return;
    }
    res.writeHead(206, {
      'Content-Type': type,
      'Content-Length': end - start + 1,
      'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(file, { start, end }).pipe(res);
    return;
  }
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': stat.size,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(file).pipe(res);
});

function tickPush() {
  const now = new Date();
  const hm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const db = load();
  const payload = JSON.stringify({ title: 'ERIOR', body: 'Reto 28 · tu día sigue.', tag: 'p28-daily' });
  (db.subs || []).forEach(async (s) => {
    if (s.hour !== hm && hm !== '11:11') return;
    const today = now.toISOString().slice(0, 10) + '-' + hm + '-' + s.endpoint.slice(-12);
    db.sent = db.sent || {};
    if (db.sent[today]) return;
    db.sent[today] = true;
    save(db);
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload);
    } catch (e) { /* ignore stale */ }
  });
}

server.listen(PORT, () => {
  console.log('P28 local → http://localhost:' + PORT + '/protocolo-28/');
  console.log('Admin     → http://localhost:' + PORT + '/protocolo-28/admin.html');
  setInterval(tickPush, 20000);
});
