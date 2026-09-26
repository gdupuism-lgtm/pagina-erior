(function (w) {
  var ADMIN_LOCAL = 'ERIOR28';

  function apiBase() {
    if (/^https?:\/\/localhost:\d+/.test(location.origin)) return '/api/p28';
    return '/.netlify/functions/p28-api';
  }

  function firstName(raw) {
    return String(raw || '').trim().split(/\s+/)[0].slice(0, 24);
  }

  function normalize(code) {
    return String(code || '').trim().toUpperCase().replace(/\s+/g, '');
  }

  function localDb() {
    try { return JSON.parse(localStorage.getItem('erior-p28-issued') || '{"codes":[]}'); }
    catch (e) { return { codes: [] }; }
  }

  function saveLocalDb(db) { localStorage.setItem('erior-p28-issued', JSON.stringify(db)); }

  function randPart(n) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var s = '';
    for (var i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  function makeCode() { return 'P28-' + randPart(4) + '-' + randPart(4); }

  function plusDays(from, n) {
    var d = new Date(from || Date.now());
    if (isNaN(d.getTime())) d = new Date();
    d.setTime(d.getTime() + (n || 30) * 86400000);
    return d.toISOString();
  }

  function daysLeft(expires) {
    if (!expires) return 30;
    return Math.max(0, Math.ceil((new Date(expires).getTime() - Date.now()) / 86400000));
  }

  function isExpired(row) {
    if (!row) return true;
    if (row.active === false) return true;
    var exp = row.expires_at;
    if (!exp) return false;
    return Date.now() > new Date(exp).getTime();
  }

  function ensureRow(row) {
    if (!row) return row;
    row.max_devices = row.max_devices || 2;
    row.days = row.days || 30;
    row.devices = row.devices || [];
    if (!row.expires_at) row.expires_at = plusDays(row.created_at || Date.now(), row.days);
    return row;
  }

  function accessFrom(row) {
    ensureRow(row);
    return {
      name: firstName(row.client_name),
      pack: row.pack || 1,
      code: row.code,
      expires_at: row.expires_at,
      days_left: daysLeft(row.expires_at),
      devices_used: (row.devices || []).length,
      max_devices: row.max_devices || 2
    };
  }

  function sessionCode(code) {
    if (code) {
      try { localStorage.setItem('erior-p28-session', JSON.stringify({ code: normalize(code) })); } catch (e) {}
    }
    try { return JSON.parse(localStorage.getItem('erior-p28-session') || '{}').code || ''; } catch (e) { return ''; }
  }

  function bindSession(code) {
    sessionCode(code);
  }

  function storeKey() {
    var c = sessionCode();
    if (!c) return 'erior-p28';
    var keyed = 'erior-p28-' + c;
    if (localStorage.getItem(keyed)) return keyed;
    try {
      var legacy = JSON.parse(localStorage.getItem('erior-p28') || '{}');
      if (legacy.access && normalize(legacy.access.code) === c) return 'erior-p28';
    } catch (e) {}
    return keyed;
  }

  function mediaDbName() {
    var c = sessionCode();
    if (!c) return 'erior-p28-media';
    try {
      var legacy = JSON.parse(localStorage.getItem('erior-p28') || '{}');
      if (legacy.access && normalize(legacy.access.code) === c) return 'erior-p28-media';
    } catch (e) {}
    return 'erior-p28-media-' + c.replace(/[^A-Z0-9]/g, '');
  }

  function getProfile(code) {
    return call('profile-get', { code: normalize(code) });
  }

  function saveProfile(code, payload) {
    return call('profile-set', Object.assign({ code: normalize(code) }, payload || {}));
  }

  function revoke(code, adminKey) {
    return call('revoke', { code: normalize(code) }, adminKey);
  }

  function deviceId() {
    try {
      var id = localStorage.getItem('erior-p28-device');
      if (id) return id;
      id = 'd-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem('erior-p28-device', id);
      return id;
    } catch (e) {
      return 'd-tmp';
    }
  }

  function deviceLabel() {
    var ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
    if (/Mobi|Android|iPhone|iPad/i.test(ua)) return 'Celular';
    return 'Laptop';
  }

  function bindDevice(row, id, label) {
    ensureRow(row);
    var found = row.devices.filter(function (d) { return d.id === id; })[0];
    if (found) {
      found.at = new Date().toISOString();
      found.label = found.label || label;
      return true;
    }
    if (row.devices.length >= (row.max_devices || 2)) return false;
    row.devices.push({ id: id, label: label || 'Aparato', at: new Date().toISOString() });
    return true;
  }

  function unlockLocal(code, device, label) {
    var db = localDb();
    var row = (db.codes || []).find(function (x) { return normalize(x.code) === code && x.active !== false; });
    if (!row) return null;
    ensureRow(row);
    if (isExpired(row)) {
      var err = new Error('Tu acceso de 30 días terminó. Tus datos siguen. Erior puede reactivar otros 30.');
      err.code = 'expired';
      throw err;
    }
    if (!bindDevice(row, device, label)) {
      var e2 = new Error('Este código ya tiene sus accesos ocupados.');
      e2.code = 'devices';
      throw e2;
    }
    row.last_used_at = new Date().toISOString();
    saveLocalDb(db);
    return accessFrom(row);
  }

  function call(action, body, adminKey) {
    var payload = Object.assign({ action: action }, body || {});
    var headers = { 'Content-Type': 'application/json' };
    if (adminKey) headers['X-Admin-Key'] = adminKey;
    return fetch(apiBase(), { method: 'POST', headers: headers, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok, status: r.status, data: j }; }); })
      .catch(function () { return { ok: false, status: 0, data: {} }; });
  }

  function getWall() {
    return fetch(apiBase() + '?action=wall')
      .then(function (r) { return r.json(); })
      .then(function (j) { return (j && j.wall) || []; })
      .catch(function () { return []; });
  }

  function deleteWall(id, adminKey) {
    return call('wall-del', { id: id }, adminKey);
  }

  function vapidPublic() {
    return call('vapid', {}).then(function (res) {
      return res.data && res.data.publicKey;
    });
  }

  function subscribePush(subscription, code, hour) {
    return call('subscribe', { subscription: subscription, code: code, hour: hour });
  }

  function pushTest(subscription) {
    return call('push-test', { subscription: subscription });
  }

  function broadcast(title, body, adminKey) {
    return call('broadcast', { title: title, body: body }, adminKey);
  }

  function unlock(code) {
    var c = normalize(code);
    var device = deviceId();
    var label = deviceLabel();
    return call('unlock', { code: c, device: device, deviceLabel: label }).then(function (res) {
      if (res.ok && res.data.access) {
        bindSession(res.data.access.code || c);
        var access = res.data.access;
        access.profile = res.data.profile || null;
        return access;
      }
      if (res.data && res.data.error) {
        var err = new Error(res.data.error);
        err.code = res.data.code || '';
        throw err;
      }
      try {
        var local = unlockLocal(c, device, label);
        if (local) { bindSession(c); return local; }
      } catch (e) {
        throw e;
      }
      throw new Error('Ese código no abre. Erior te lo manda cuando confirma tu audio.');
    });
  }

  function issue(fields, adminKey) {
    var days = Number(fields.days) || 30;
    var row = {
      code: makeCode(),
      client_name: firstName(fields.name),
      pack: Number(fields.pack) || 1,
      client_contact: String(fields.contact || '').slice(0, 80),
      notes: String(fields.notes || '').slice(0, 240),
      active: true,
      days: days,
      max_devices: Number(fields.max_devices) || 2,
      devices: [],
      created_at: new Date().toISOString(),
      expires_at: plusDays(Date.now(), days)
    };
    return call('issue', {
      name: row.client_name, pack: row.pack, contact: row.client_contact,
      notes: row.notes, code: row.code, days: row.days, max_devices: row.max_devices
    }, adminKey)
      .then(function (res) {
        if (!res.ok || !res.data || !res.data.row) {
          var why = (res.data && res.data.error) || '';
          if (res.status === 401) throw new Error('La clave no pasó. Entra otra vez con ERIOR28.');
          if (res.status === 0) throw new Error('No hay conexión con el servidor. Recarga admin y vuelve a generar.');
          throw new Error(why || 'No se pudo guardar el código. Recarga admin, entra con ERIOR28 e inténtalo otra vez.');
        }
        row = res.data.row;
        var db = localDb();
        db.codes = db.codes || [];
        db.codes.unshift(row);
        saveLocalDb(db);
        return row;
      });
  }

  function reactivate(code, adminKey) {
    return call('reactivate', { code: normalize(code), days: 30 }, adminKey).then(function (res) {
      if (res.ok && res.data.row) return res.data.row;
      var db = localDb();
      var row = (db.codes || []).find(function (x) { return normalize(x.code) === normalize(code); });
      if (!row) throw new Error('No encontré ese código.');
      row.active = true;
      row.days = 30;
      row.expires_at = plusDays(Date.now(), 30);
      saveLocalDb(db);
      return row;
    });
  }

  function resetDevices(code, adminKey) {
    return call('reset-devices', { code: normalize(code) }, adminKey).then(function (res) {
      if (res.ok && res.data.row) return res.data.row;
      var db = localDb();
      var row = (db.codes || []).find(function (x) { return normalize(x.code) === normalize(code); });
      if (row) { row.devices = []; saveLocalDb(db); }
      return row;
    });
  }

  function listCodes(adminKey) {
    return call('list', {}, adminKey).then(function (res) {
      if (res.ok && res.data.codes) return res.data.codes;
      return localDb().codes || [];
    });
  }

  function postWall(who, txt, day) {
    return call('wall', { who: firstName(who), txt: txt, day: day }).then(function (res) {
      return res.ok;
    });
  }

  function isLocalHost() {
    return /^https?:\/\/localhost:\d+/.test(location.origin);
  }

  function checkLocalAdmin(pass) {
    return isLocalHost() && String(pass || '') === ADMIN_LOCAL;
  }

  w.P28Access = {
    apiBase: apiBase,
    firstName: firstName,
    normalize: normalize,
    unlock: unlock,
    issue: issue,
    reactivate: reactivate,
    revoke: revoke,
    getProfile: getProfile,
    saveProfile: saveProfile,
    bindSession: bindSession,
    sessionCode: sessionCode,
    storeKey: storeKey,
    mediaDbName: mediaDbName,
    resetDevices: resetDevices,
    listCodes: listCodes,
    getWall: getWall,
    postWall: postWall,
    deleteWall: deleteWall,
    vapidPublic: vapidPublic,
    subscribePush: subscribePush,
    pushTest: pushTest,
    broadcast: broadcast,
    checkLocalAdmin: checkLocalAdmin,
    call: call,
    daysLeft: daysLeft,
    isExpired: isExpired,
    deviceId: deviceId,
    ADMIN_LOCAL: ADMIN_LOCAL
  };
})(window);
