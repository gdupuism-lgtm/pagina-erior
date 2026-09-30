(function (w) {
  function storeKey() { return (w.P28Access && P28Access.storeKey()) || 'erior-p28'; }
  function DB_NAME() { return (w.P28Access && P28Access.mediaDbName()) || 'erior-p28-media'; }
  var MAX_MB = 120;
  var DAY_GOAL = 4 * 3600;
  var PACKS = { 1: 999, 2: 1555, 3: 2222 };
  var WA = '5214432311761';
  var el = new Audio();
  var objectUrl = null;
  var seeking = false;
  var counted = {};
  var listenTick = null;
  var cheerTimer = null;

  el.preload = 'metadata';
  el.loop = false;
  el.setAttribute('playsinline', '');
  el.hidden = true;
  var wantPlay = false;
  var hiddenAt = 0;
  var resumeTries = 0;
  function mountEl() { if (document.body && !el.parentNode) document.body.appendChild(el); }
  if (document.body) mountEl(); else document.addEventListener('DOMContentLoaded', mountEl);

  function $(id) { return document.getElementById(id); }
  function load() {
    try { return JSON.parse(localStorage.getItem(storeKey()) || '{}'); } catch (e) { return {}; }
  }
  function save(s) { localStorage.setItem(storeKey(), JSON.stringify(s)); }
  function patch(fn) {
    var s = load();
    fn(s);
    save(s);
    return s;
  }
  function todayKey() { return new Date().toISOString().slice(0, 10); }
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  var imgUrls = {};
  var imgAsked = {};
  var imgInput = null;
  var PIC_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h3l1.6-2h6.8L17 5h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm8 3.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/></svg>';
  function imgKey(kind, id) { return 'img-' + kind + '-' + id; }
  /* kind: 'a' audio, 'pl' lista. La foto vive en IndexedDB; obj.img solo marca que existe. */
  function imgFor(kind, obj) {
    if (!obj || !obj.img) return '';
    var k = imgKey(kind, obj.id);
    if (imgUrls[k]) return imgUrls[k];
    if (!imgAsked[k]) {
      imgAsked[k] = true;
      idbGet(k).then(function (blob) {
        if (!blob) return;
        imgUrls[k] = URL.createObjectURL(blob);
        paintPlayer();
        if (current() && current().id === obj.id) bindMedia(current());
      }).catch(function () {});
    }
    return '';
  }
  function shrinkImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var r = Math.min(1, 900 / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.naturalWidth * r));
        c.height = Math.max(1, Math.round(img.naturalHeight * r));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        if (!c.toBlob) return resolve(file);
        c.toBlob(function (b) { resolve(b || file); }, 'image/jpeg', 0.86);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('No pude abrir esa imagen. Prueba con otra.'));
      };
      img.src = url;
    });
  }
  function setImage(kind, id, file) {
    return shrinkImage(file).then(function (blob) {
      var k = imgKey(kind, id);
      return idbPut(k, blob).then(function () {
        if (imgUrls[k]) URL.revokeObjectURL(imgUrls[k]);
        imgUrls[k] = URL.createObjectURL(blob);
        imgAsked[k] = true;
        var s = patch(function (st) {
          var list = kind === 'pl' ? (st.playlists || []) : (st.library || []);
          list.forEach(function (x) { if (x.id === id) x.img = Date.now(); });
        });
        paintPlayer(s);
        bindMedia(current(s));
      });
    });
  }
  function dropImage(kind, id) {
    var k = imgKey(kind, id);
    if (imgUrls[k]) URL.revokeObjectURL(imgUrls[k]);
    delete imgUrls[k];
    delete imgAsked[k];
    return idbDel(k);
  }
  function pickImage(kind, id) {
    if (!imgInput) {
      imgInput = document.createElement('input');
      imgInput.type = 'file';
      imgInput.accept = 'image/*';
      imgInput.hidden = true;
      document.body.appendChild(imgInput);
    }
    imgInput.value = '';
    imgInput.onchange = function () {
      var f = imgInput.files && imgInput.files[0];
      if (!f) return;
      setImage(kind, id, f).catch(function (err) {
        alert((err && err.message) || 'No se pudo poner la foto.');
      });
    };
    imgInput.click();
  }
  function artFor(t, s) {
    var a = imgFor('a', t);
    if (a) return a;
    return imgFor('pl', activePl(s));
  }
  function posterHtml(t, opts) {
    opts = opts || {};
    var cv = opts.img || '';
    var attrs = opts.attrs || '';
    return '<div class="poster' + (opts.sm ? ' sm' : '') + (opts.on ? ' on' : '') + (cv ? '' : ' no-img') + '"' + attrs + '>' +
      (cv
        ? '<img src="' + cv + '" alt="" decoding="async" draggable="false">'
        : '<span class="poster-mark">' + esc(t.title) + '</span>') +
      (opts.top || '') +
      '<div class="poster-foot">' +
        '<div class="poster-txt"><b>' + esc(t.title) + '</b>' +
          (opts.chip ? '<span class="poster-chip">' + esc(opts.chip) + '</span>' : '') +
        '</div>' +
        '<span class="poster-play" aria-hidden="true">' +
          '<svg class="ic-play" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5-11-6.5z"/></svg>' +
          '<svg class="ic-pause" viewBox="0 0 24 24"><path d="M7 5h3.4v14H7V5zm6.6 0H17v14h-3.4V5z"/></svg>' +
        '</span>' +
      '</div>' +
    '</div>';
  }

  function playlists(s) { return (s && s.playlists) || []; }
  function playlistById(s, id) {
    return playlists(s).filter(function (p) { return p.id === id; })[0] || null;
  }
  function activePl(s) {
    s = s || load();
    var id = s.player && s.player.playlistId;
    return id ? playlistById(s, id) : null;
  }
  function trackById(s, id) {
    return library(s).filter(function (t) { return t.id === id; })[0] || null;
  }
  function expandQueue(s) {
    s = s || load();
    var pl = activePl(s);
    var lib = library(s);
    if (!pl) {
      return lib.map(function (t) { return { id: t.id, times: 1, nth: 1 }; });
    }
    var q = [];
    (pl.items || []).forEach(function (it) {
      if (!trackById(s, it.id)) return;
      var n = Math.max(1, Math.min(99, Number(it.times) || 1));
      for (var i = 0; i < n; i++) q.push({ id: it.id, times: n, nth: i + 1 });
    });
    return q;
  }
  function fmt(sec) {
    sec = Math.max(0, Math.floor(Number(sec) || 0));
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    var mm = (h ? String(m).padStart(2, '0') : String(m));
    var ss = String(s).padStart(2, '0');
    return h ? h + ':' + mm + ':' + ss : mm + ':' + ss;
  }
  function hoursLabel(sec) {
    var h = (Number(sec) || 0) / 3600;
    if (h < 0.1) return Math.max(0, Math.round((Number(sec) || 0) / 60)) + ' min';
    return h.toFixed(h >= 10 ? 0 : 1).replace('.', ',') + ' h';
  }
  function fillRange(input, pct) {
    if (!input) return;
    input.style.setProperty('--fill', Math.max(0, Math.min(100, pct)) + '%');
  }
  function library(s) { return (s && s.library) || []; }
  function current(s) {
    s = s || load();
    var id = s.player && s.player.currentId;
    return library(s).filter(function (t) { return t.id === id; })[0] || library(s)[0] || null;
  }

  function idbOpen() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) return reject(new Error('Este navegador no guarda archivos grandes.'));
      var req = indexedDB.open(DB_NAME(), 1);
      req.onupgradeneeded = function () {
        if (!req.result.objectStoreNames.contains('files')) req.result.createObjectStore('files');
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function idbPut(id, blob) {
    return idbOpen().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').put(blob, id);
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }
  function idbGet(id) {
    return idbOpen().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('files', 'readonly');
        var q = tx.objectStore('files').get(id);
        q.onsuccess = function () { resolve(q.result || null); };
        q.onerror = function () { reject(q.error); };
      });
    });
  }
  function idbDel(id) {
    return idbOpen().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').delete(id);
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { resolve(false); };
      });
    });
  }

  function sealedCount(days) {
    var n = 0;
    for (var i = 1; i <= 28; i++) if (days && days[i]) n++;
    return n;
  }
  function weekComplete(days, week) {
    var start = (week - 1) * 7 + 1;
    for (var i = start; i < start + 7; i++) if (!days || !days[i]) return false;
    return true;
  }
  function listenToday(s) {
    s = s || load();
    var map = s.listen || {};
    return Number(map[todayKey()] || 0);
  }

  function showCelebrate(title, text) {
    var box = $('celebrate');
    if (!box) return;
    $('celebrateTitle').textContent = title;
    $('celebrateText').textContent = text || '';
    var spark = $('spark');
    if (spark) {
      spark.innerHTML = '';
      for (var i = 0; i < 22; i++) {
        var d = document.createElement('i');
        d.style.left = (8 + Math.random() * 84) + '%';
        d.style.top = (18 + Math.random() * 58) + '%';
        d.style.setProperty('--x', (Math.random() * 80 - 40) + 'px');
        d.style.animationDelay = (Math.random() * 0.45) + 's';
        spark.appendChild(d);
      }
    }
    box.classList.remove('hidden');
    box.removeAttribute('hidden');
    clearTimeout(cheerTimer);
    cheerTimer = setTimeout(hideCelebrate, 4200);
  }
  function hideCelebrate() {
    var box = $('celebrate');
    if (!box) return;
    box.classList.add('hidden');
    box.setAttribute('hidden', '');
  }
  function cheerOnce(key, title, text) {
    var s = load();
    s.cheers = s.cheers || {};
    if (s.cheers[key]) return false;
    s.cheers[key] = true;
    save(s);
    showCelebrate(title, text);
    return true;
  }

  function renderProgress(s) {
    var box = $('progressBox');
    if (!box) return;
    s = s || load();
    var done = sealedCount(s.days || {});
    var pct = Math.round((done / 28) * 100);
    var n = (w.P28 && w.P28.currentDay) ? w.P28.currentDay(s) : 1;
    var checks = (s.checks && s.checks[n]) || {};
    var pasos = (checks.night ? 1 : 0) + (checks.day ? 1 : 0) + (checks.mission ? 1 : 0);
    var heard = listenToday(s);
    var heardPct = Math.min(100, Math.round((heard / DAY_GOAL) * 100));
    box.innerHTML =
      '<div class="progress-panel">' +
        '<div class="ring" style="--p:' + pct + '"><div><b>' + done + '</b><small>/ 28</small></div></div>' +
        '<div class="bars">' +
          '<div class="bar-line"><span>28 días</span><b>' + pct + '%</b></div>' +
          '<div class="track"><i style="width:' + pct + '%"></i></div>' +
          '<div class="bar-line"><span>Pasos de hoy</span><b>' + pasos + '/3</b></div>' +
          '<div class="track"><i style="width:' + Math.round((pasos / 3) * 100) + '%"></i></div>' +
          '<div class="bar-line"><span>Escucha de hoy</span><b>' + hoursLabel(heard) + ' / 4 h</b></div>' +
          '<div class="track"><i style="width:' + heardPct + '%"></i></div>' +
        '</div>' +
      '</div>';
  }

  function nextLayer(s) {
    var pack = Number((s.access && s.access.pack) || s.pack || 1);
    var rec = s.rec || {};
    if (pack < 2 && rec.second) return { n: 2, audio: rec.second, why: rec.why2 || 'Limpia lo que sabotea la primera capa.' };
    if (pack < 3 && rec.third) return { n: 3, audio: rec.third, why: 'Identidad. El yo que ya lo tiene.' };
    return { n: 'extra', audio: rec.third || rec.second || rec.primary, why: 'Otra frecuencia, otro ángulo. No te quedes en una sola.' };
  }

  function waUpgrade(s, next) {
    var name = ((s.data && s.data.name) || (s.access && s.access.name) || '').split(/\s+/)[0];
    var pack = (s.access && s.access.pack) || s.pack || 1;
    var rec = s.rec || {};
    var want = next === 2 ? (rec.second && rec.second.name) : next === 3 ? (rec.third && rec.third.name) : 'un audio extra';
    var price = PACKS[next] ? '$' + PACKS[next].toLocaleString('es-MX') + ' MXN' : '';
    var lines = [
      'Hola, ya estoy en el Reto de Manifestación 28 (pack ' + pack + ').',
      name ? 'Soy ' + name + '.' : '',
      '',
      next === 'extra'
        ? 'Quiero añadir otro audio a mi reto.'
        : 'Quiero subir a pack ' + next + (price ? ' · ' + price : '') + '. Siguiente capa: ' + (want || 'la que me asignaron') + '.',
      '',
      'Confirmo por aquí y mando comprobante.'
    ].filter(Boolean);
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function shouldNudge(s) {
    var pack = Number((s.access && s.access.pack) || s.pack || 1);
    if (pack >= 3) return false;
    if (s.nudgeHideUntil && Date.now() < s.nudgeHideUntil) return false;
    var n = (w.P28 && w.P28.currentDay) ? w.P28.currentDay(s) : 1;
    var lib = library(s).length;
    var plays = library(s).reduce(function (a, t) { return a + (t.plays || 0); }, 0);
    if (n === 5 || n === 7 || n === 10 || n === 14 || n === 18 || n === 21 || n === 25) return true;
    if (n >= 4 && lib <= 1 && pack === 1) return true;
    if (plays >= 4 && pack < 3) return true;
    if (listenToday(s) >= DAY_GOAL && pack < 3) return true;
    return false;
  }

  function renderNudge(s, mount) {
    var box = $(mount || 'upgradeHoy');
    if (box) box.innerHTML = '';
  }

  function renderVaultList(s) {
    var box = $('vaultList');
    if (!box) return;
    s = s || load();
    var list = library(s);
    var cur = current(s);
    var pl = activePl(s);
    if (!list.length) {
      box.innerHTML = '<p class="note">Sube un audio para oírlo.</p>';
      box.removeAttribute('data-sig');
      return;
    }
    var inPl = {};
    if (pl) (pl.items || []).forEach(function (it) { inPl[it.id] = true; });
    var html = '<div class="rail-head"><h3>' + (pl ? 'Meter a ' + esc(pl.name) : 'Tus audios') + '</h3><span>' + list.length + '</span></div>' +
      '<div class="rail rail-hero" data-rail="main">' + list.map(function (t) {
        var on = cur && cur.id === t.id;
        var top = '<button type="button" class="poster-x" data-del="' + t.id + '" aria-label="Quitar">×</button>' +
          '<button type="button" class="poster-pic" data-img="a:' + t.id + '" aria-label="Poner foto">' + PIC_SVG + '</button>' +
          (pl ? '<button type="button" class="poster-add' + (inPl[t.id] ? ' in' : '') + '" data-add-pl="' + t.id + '">' + (inPl[t.id] ? 'Ya' : 'Meter') + '</button>' : '');
        return posterHtml(t, {
          img: imgFor('a', t),
          on: on,
          top: top,
          chip: t.duration ? fmt(t.duration) : 'Audio',
          attrs: ' data-play="' + t.id + '" draggable="true" data-drag="' + t.id + '"'
        });
      }).join('') + '</div>';
    if (box.getAttribute('data-sig') === html) return;
    box.innerHTML = html;
    box.setAttribute('data-sig', html);
    var hero = box.querySelector('.rail-hero');
    if (hero) {
      hero.onscroll = function () { heroDepth(hero); };
      var on = hero.querySelector('.poster.on') || hero.querySelector('.poster');
      requestAnimationFrame(function () {
        if (on) hero.scrollLeft = on.offsetLeft - (hero.clientWidth - on.clientWidth) / 2;
        heroDepth(hero);
      });
    }
  }
  var depthRaf = 0;
  function heroDepth(hero) {
    if (depthRaf) return;
    depthRaf = requestAnimationFrame(function () {
      depthRaf = 0;
      var mid = hero.scrollLeft + hero.clientWidth / 2;
      Array.prototype.forEach.call(hero.querySelectorAll('.poster'), function (p) {
        var c = p.offsetLeft + p.clientWidth / 2;
        var d = Math.min(1, Math.abs(c - mid) / (p.clientWidth || 1));
        p.style.transform = 'scale(' + (1 - d * 0.12).toFixed(3) + ')';
        p.style.opacity = (1 - d * 0.35).toFixed(3);
      });
    });
  }

  function renderPlaylists(s) {
    var bar = $('plBar');
    var queue = $('plQueue');
    if (!bar) return;
    s = s || load();
    var pls = playlists(s);
    var curId = (s.player && s.player.playlistId) || '';
    var html = '<div class="pl-row">';
    html += '<button type="button" class="pl-chip add" data-pl-new>+ Lista</button>';
    pls.forEach(function (p) {
      html += '<button type="button" class="pl-chip' + (p.id === curId ? ' on' : '') + '" data-pl="' + p.id + '">' + esc(p.name) + '</button>';
    });
    html += '</div>';
    if (s.plNew) {
      html += '<div class="pl-new"><input id="plNameIn" type="text" placeholder="Nombre de la lista" maxlength="40">' +
        '<button type="button" class="btn btn-gold" id="btnPlCreate">Crear</button></div>';
    }
    bar.innerHTML = html;
    if (s.plNew && $('plNameIn')) {
      setTimeout(function () { if ($('plNameIn')) $('plNameIn').focus(); }, 40);
    }
    if (!queue) return;
    var pl = activePl(s);
    if (!pl) {
      queue.innerHTML = '';
      return;
    }
    var q = expandQueue(s);
    var qi = Number((s.player && s.player.queueIndex) || 0);
    var slot = q[qi];
    var items = pl.items || [];
    var rows = items.length
      ? items.map(function (it, i) {
        var t = trackById(s, it.id);
        var on = slot && slot.id === it.id;
        var cv = t ? imgFor('a', t) : '';
        return '<div class="q-row' + (on ? ' on' : '') + '" draggable="true" data-pl-index="' + i + '">' +
          (cv ? '<img class="q-thumb" src="' + cv + '" alt="" loading="lazy" draggable="false">' : '<span class="q-thumb"></span>') +
          '<button type="button" class="q-play" data-pl-item="' + i + '">' + esc(t ? t.title : 'Audio') + '</button>' +
          '<div class="q-times">' +
            '<button type="button" data-times-minus="' + i + '">−</button>' +
            '<b data-times-edit="' + i + '">×' + (it.times || 1) + '</b>' +
            '<button type="button" data-times-plus="' + i + '">+</button>' +
          '</div>' +
          '<button type="button" class="q-rm" data-pl-rm="' + i + '">×</button></div>';
      }).join('')
      : '<p class="pl-empty">Arrastra un audio aquí o toca Meter.</p>';
    var plArt = imgFor('pl', pl);
    queue.innerHTML =
      '<div class="pl-folder foil-card" id="plFolder">' +
        '<div class="pl-folder-head">' +
          '<button type="button" class="pl-art' + (plArt ? ' has-img' : '') + '" data-img="pl:' + pl.id + '" aria-label="Poner foto a la lista"' +
            (plArt ? ' style="background-image:url(\'' + plArt + '\')"' : '') + '>' + (plArt ? '' : PIC_SVG + '<small>Foto</small>') + '</button>' +
          '<div><span class="num">Lista</span><h3>' + esc(pl.name) + '</h3></div>' +
          '<div class="pl-folder-actions">' +
            '<button type="button" class="btn btn-gold" id="btnPlPlay"' + (items.length ? '' : ' disabled') + '>Oír</button>' +
            '<button type="button" class="btn btn-ghost" data-pl-del="' + pl.id + '">Borrar</button>' +
          '</div>' +
        '</div>' +
        '<div class="pl-drop' + (items.length ? '' : ' empty') + '" id="plDrop">' + rows + '</div>' +
      '</div>';
  }

  function renderUpgradeAudios() {
    var box = $('upgradeAudios');
    if (box) box.innerHTML = '';
  }

  function loopMode(s) {
    s = s || load();
    if (s.player && s.player.loopMode) return s.player.loopMode;
    if (s.player && s.player.loop === false) return 'off';
    return 'all';
  }

  function applyLoopToEl(mode) {
    el.loop = mode === 'one';
  }

  function loopLabel(mode) {
    if (mode === 'all') return 'lista';
    if (mode === 'one') return 'este audio';
    return 'sin repetir';
  }

  function paintPlayer(s) {
    s = s || load();
    var t = current(s);
    var playing = !el.paused && !el.ended;
    var mode = loopMode(s);
    var pl = activePl(s);
    var q = expandQueue(s);
    var qi = Number((s.player && s.player.queueIndex) || 0);
    var slot = q[qi];
    applyLoopToEl(mode);
    document.body.classList.toggle('is-playing', playing);
    var cv = t ? artFor(t, s) : '';
    if ($('vinyl')) {
      $('vinyl').classList.toggle('has-cover', !!cv);
      $('vinyl').style.backgroundImage = cv ? 'url("' + cv + '")' : '';
      $('vinyl').classList.toggle('spin', playing && !cv);
    }
    if ($('miniDot')) {
      $('miniDot').classList.toggle('has-cover', !!cv);
      $('miniDot').style.backgroundImage = cv ? 'url("' + cv + '")' : '';
    }
    if ($('playerTitle')) $('playerTitle').textContent = t ? t.title : 'Elige un audio';
    if ($('playerLayer')) $('playerLayer').textContent = pl ? pl.name : (t ? 'Ahora' : 'Audios');
    if ($('playerMeta')) {
      var meta = '';
      if (slot && slot.times > 1) meta = slot.nth + ' de ' + slot.times;
      if (pl && q.length) meta += (meta ? ' · ' : '') + (qi + 1) + '/' + q.length;
      if (!meta && t) meta = loopLabel(mode);
      $('playerMeta').textContent = meta;
    }
    if ($('miniTitle')) $('miniTitle').textContent = t ? t.title : 'Audio';
    document.body.classList.toggle('has-mini', !!(t && el.src));
    if ($('vol')) {
      var v = Math.round(((s.player && s.player.vol) != null ? s.player.vol : 0.72) * 100);
      $('vol').value = v;
      fillRange($('vol'), v);
      if ($('volPct')) $('volPct').textContent = v + '%';
    }
    if ($('btnLoop')) {
      $('btnLoop').classList.toggle('on', mode !== 'off');
      $('btnLoop').classList.toggle('loop-all', mode === 'all');
      $('btnLoop').classList.toggle('loop-one', mode === 'one');
      $('btnLoop').setAttribute('aria-pressed', mode !== 'off' ? 'true' : 'false');
      $('btnLoop').setAttribute('aria-label', mode === 'all' ? 'Repetir lista' : mode === 'one' ? 'Repetir este audio' : 'Sin repetir');
      if ($('loopBadge')) $('loopBadge').textContent = mode === 'all' ? 'LISTA' : mode === 'one' ? '1' : '';
    }
    renderPlaylists(s);
    renderVaultList(s);
  }

  function tickUI() {
    if (seeking) return;
    var dur = el.duration;
    var cur = el.currentTime || 0;
    if ($('tCur')) $('tCur').textContent = fmt(cur);
    if ($('tDur')) $('tDur').textContent = isFinite(dur) ? fmt(dur) : '0:00';
    if ($('seek') && isFinite(dur) && dur > 0) {
      $('seek').value = Math.round((cur / dur) * 1000);
      fillRange($('seek'), (cur / dur) * 100);
    }
  }

  function persistPos() {
    var s = load();
    var t = current(s);
    if (!t) return;
    patch(function (st) {
      st.library = (st.library || []).map(function (x) {
        if (x.id !== t.id) return x;
        x.lastTime = el.currentTime || 0;
        if (isFinite(el.duration)) x.duration = el.duration;
        return x;
      });
    });
  }

  function addListen(sec) {
    if (sec < 0.4) return;
    var key = todayKey();
    var s = patch(function (st) {
      st.listen = st.listen || {};
      st.listen[key] = (st.listen[key] || 0) + sec;
    });
    if (listenToday(s) >= DAY_GOAL) {
      cheerOnce('listen4-' + key, '4 horas selladas', 'Cumpliste la escucha de hoy. El programa viejo ya no manda el día.');
    }
    renderProgress(s);
  }

  function startListenClock() {
    stopListenClock();
    var last = Date.now();
    listenTick = setInterval(function () {
      if (el.paused) return;
      var now = Date.now();
      addListen((now - last) / 1000);
      last = now;
      persistPos();
      var t = current();
      if (t && el.currentTime >= 20 && !counted[t.id + '-' + todayKey()]) {
        counted[t.id + '-' + todayKey()] = true;
        patch(function (st) {
          st.library = (st.library || []).map(function (x) {
            if (x.id === t.id) x.plays = (x.plays || 0) + 1;
            return x;
          });
        });
        paintPlayer();
      }
    }, 2000);
  }
  function stopListenClock() {
    if (listenTick) clearInterval(listenTick);
    listenTick = null;
  }

  function bindMedia(t) {
    if (!('mediaSession' in navigator) || !t) return;
    try {
      var cv = artFor(t, load());
      var meta = { title: t.title, artist: 'Erior Center', album: 'Erior Center' };
      if (cv) meta.artwork = [{ src: cv, sizes: '512x512', type: 'image/jpeg' }];
      navigator.mediaSession.metadata = new MediaMetadata(meta);
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('previoustrack', prev);
      navigator.mediaSession.setActionHandler('nexttrack', next);
      navigator.mediaSession.setActionHandler('seekto', function (d) {
        if (d.seekTime != null) el.currentTime = d.seekTime;
      });
    } catch (e) {}
  }

  function loadTrack(id, autoplay, fromStart) {
    var s = patch(function (st) {
      st.player = st.player || { vol: 0.72, loop: true, loopMode: 'all' };
      st.player.currentId = id;
    });
    var t = current(s);
    if (!t) return Promise.resolve();
    return idbGet(id).then(function (blob) {
      if (!blob) throw new Error('Ese archivo ya no está. Mételo otra vez.');
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = URL.createObjectURL(blob);
      el.src = objectUrl;
      applyLoopToEl(loopMode(s));
      el.volume = (s.player && s.player.vol != null) ? s.player.vol : 0.72;
      if (!fromStart && t.lastTime && t.lastTime > 3) el.currentTime = t.lastTime;
      else el.currentTime = 0;
      bindMedia(t);
      paintPlayer(s);
      if (autoplay) return el.play().catch(function () {});
    });
  }

  function playQueueIndex(i, autoplay) {
    var s = load();
    var q = expandQueue(s);
    if (!q.length) return Promise.resolve();
    i = ((i % q.length) + q.length) % q.length;
    patch(function (st) {
      st.player = st.player || {};
      st.player.queueIndex = i;
      st.player.currentId = q[i].id;
    });
    return loadTrack(q[i].id, autoplay !== false, true);
  }
  function playPlaylist(plId) {
    patch(function (st) {
      st.player = st.player || {};
      st.player.playlistId = plId || '';
      st.player.queueIndex = 0;
      if (!st.player.loopMode) st.player.loopMode = 'all';
    });
    return playQueueIndex(0, true);
  }
  function playPlaylistFrom(plId, itemIndex) {
    var s = patch(function (st) {
      st.player = st.player || {};
      st.player.playlistId = plId || '';
      if (!st.player.loopMode) st.player.loopMode = 'all';
    });
    var pl = playlistById(s, plId);
    if (!pl || !pl.items || !pl.items[itemIndex]) return playQueueIndex(0, true);
    var want = pl.items[itemIndex].id;
    var q = expandQueue(s);
    var idx = 0;
    for (var i = 0; i < q.length; i++) if (q[i].id === want) { idx = i; break; }
    return playQueueIndex(idx, true);
  }
  function playTrackNow(id) {
    patch(function (st) {
      st.player = st.player || {};
      st.player.playlistId = '';
      st.player.currentId = id;
      st.player.queueIndex = 0;
    });
    return loadTrack(id, true, true);
  }
  function play() {
    var s = load();
    var t = current(s);
    if (!t) {
      var q = expandQueue(s);
      if (q.length) return playQueueIndex(0, true);
      if (w.P28 && w.P28.go) w.P28.go('audios');
      return;
    }
    if (!el.src) {
      loadTrack(t.id, true);
      return;
    }
    el.play().catch(function () {});
  }
  function pause() { wantPlay = false; el.pause(); persistPos(); paintPlayer(); }
  function toggle() { if (el.paused) play(); else pause(); }
  function step(dir) {
    var s = load();
    var q = expandQueue(s);
    if (!q.length) return;
    var i = Number((s.player && s.player.queueIndex) || 0);
    if (!activePl(s)) {
      var cur = current(s);
      for (var n = 0; n < q.length; n++) if (cur && q[n].id === cur.id) i = n;
    }
    playQueueIndex(i + dir, true);
  }
  function prev() { step(-1); }
  function next() { step(1); }

  function setVol(pct) {
    var v = Math.max(0, Math.min(100, Number(pct))) / 100;
    el.volume = v;
    patch(function (st) {
      st.player = st.player || {};
      st.player.vol = v;
    });
    fillRange($('vol'), v * 100);
    if ($('volPct')) $('volPct').textContent = Math.round(v * 100) + '%';
  }
  function cycleLoop() {
    var cur = loopMode();
    var nextMode = cur === 'all' ? 'one' : cur === 'one' ? 'off' : 'all';
    patch(function (st) {
      st.player = st.player || {};
      st.player.loopMode = nextMode;
      st.player.loop = nextMode !== 'off';
    });
    applyLoopToEl(nextMode);
    paintPlayer();
  }

  function addFile(file, title) {
    if (!file) return Promise.reject(new Error('Elige un archivo de audio.'));
    if (file.size > MAX_MB * 1024 * 1024) return Promise.reject(new Error('Ese archivo pesa más de ' + MAX_MB + ' MB.'));
    var name = (title || file.name || 'Audio Erior').replace(/\.[a-z0-9]{2,5}$/i, '').trim();
    var id = 'a-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    var track = {
      id: id,
      title: name.slice(0, 80),
      plays: 0,
      lastTime: 0,
      duration: 0,
      addedAt: new Date().toISOString()
    };
    return idbPut(id, file).then(function () {
      var s = patch(function (st) {
        st.library = st.library || [];
        st.library.push(track);
        st.player = st.player || { vol: 0.72, loop: true, loopMode: 'all' };
        st.player.currentId = id;
        st.player.playlistId = '';
        st.player.queueIndex = 0;
      });
      showCelebrate(track.title, 'Listo.');
      render(s);
      return loadTrack(id, true, true);
    });
  }

  function setItemTimes(index, times) {
    var s = load();
    var pl = activePl(s);
    if (!pl || !pl.items || !pl.items[index]) return;
    var n = Math.max(1, Math.min(99, Number(times) || 1));
    patch(function (st) {
      var p = playlistById(st, pl.id);
      if (p && p.items[index]) p.items[index].times = n;
    });
    render(load());
  }
  function openPlaylist(id) {
    patch(function (st) {
      st.player = st.player || {};
      st.player.playlistId = id || '';
      st.plNew = false;
    });
    render(load());
  }
  function addToPlaylist(trackId, times) {
    var s = load();
    var pl = activePl(s);
    if (!pl) {
      patch(function (st) { st.plNew = true; st.pendingAdd = trackId; });
      render(load());
      return;
    }
    patch(function (st) {
      var p = playlistById(st, pl.id);
      if (!p) return;
      p.items = p.items || [];
      if (p.items.some(function (it) { return it.id === trackId; })) return;
      p.items.push({ id: trackId, times: times || 1 });
    });
    render(load());
  }
  function moveItem(from, to) {
    var pl = activePl();
    if (!pl || !pl.items) return;
    from = Number(from);
    to = Number(to);
    if (from === to || from < 0 || to < 0 || from >= pl.items.length || to >= pl.items.length) return;
    patch(function (st) {
      var p = playlistById(st, pl.id);
      if (!p || !p.items) return;
      var item = p.items.splice(from, 1)[0];
      p.items.splice(to, 0, item);
    });
    render(load());
  }
  function createPlaylist(name) {
    var s0 = load();
    var pending = s0.pendingAdd || '';
    var id = 'pl-' + Date.now().toString(36);
    patch(function (st) {
      st.playlists = st.playlists || [];
      st.playlists.push({ id: id, name: String(name || 'Lista').trim().slice(0, 40) || 'Lista', items: [] });
      st.player = st.player || {};
      st.player.playlistId = id;
      st.plNew = false;
      st.pendingAdd = '';
    });
    if (pending) addToPlaylist(pending, 1);
    else render(load());
    return id;
  }
  function removeFromPlaylist(index) {
    var pl = activePl();
    if (!pl) return;
    patch(function (st) {
      var p = playlistById(st, pl.id);
      if (!p) return;
      p.items = (p.items || []).filter(function (_, i) { return i !== index; });
    });
    render(load());
  }
  function deletePlaylist(id) {
    dropImage('pl', id);
    patch(function (st) {
      st.playlists = (st.playlists || []).filter(function (p) { return p.id !== id; });
      if (st.player && st.player.playlistId === id) {
        st.player.playlistId = '';
        st.player.queueIndex = 0;
      }
    });
    render(load());
  }

  function removeTrack(id) {
    dropImage('a', id);
    return idbDel(id).then(function () {
      var s = patch(function (st) {
        st.library = (st.library || []).filter(function (t) { return t.id !== id; });
        st.playlists = (st.playlists || []).map(function (p) {
          p.items = (p.items || []).filter(function (it) { return it.id !== id; });
          return p;
        });
        if (st.player && st.player.currentId === id) {
          st.player.currentId = st.library[0] ? st.library[0].id : '';
        }
      });
      if (el.src && current(s) && current(s).id !== id) {
        /* keep playing other */
      } else {
        el.pause();
        el.removeAttribute('src');
        el.load();
      }
      render(s);
    });
  }

  function onSeal(n, s) {
    s = s || load();
    var days = s.days || {};
    var name = String((s.data && s.data.name) || (s.access && s.access.name) || '').trim().split(/\s+/)[0];
    var left = Math.max(0, 28 - n);
    var goOn = left
      ? ('Mañana hay otra lista nueva. Te quedan ' + left + ' días. No pares.')
      : 'Ciclo cerrado. En el último post de @eriorcenter escribe reto 28.';
    var hi = name ? (name + ', lo lograste hoy. ') : 'Lo lograste hoy. ';
    if (n === 28 && weekComplete(days, 4)) {
      cheerOnce('week-4', 'Los 28 días', hi + 'Ciclo cerrado. En el último post de @eriorcenter escribe reto 28.');
    } else if (n === 21 && weekComplete(days, 3)) {
      cheerOnce('week-3', 'Semana 3 cerrada', hi + 'Recalibración. ' + goOn);
    } else if (n === 14 && weekComplete(days, 2)) {
      cheerOnce('week-2', 'Semana 2 cerrada', hi + 'Limpieza. Si dolió y lo escuchaste igual, eso cuenta. ' + goOn);
    } else if (n === 7 && weekComplete(days, 1)) {
      cheerOnce('week-1', 'Semana 1 cerrada', hi + 'Instalación hecha. No evalúes el resultado. Evalúa que te cumpliste. ' + goOn);
    } else {
      cheerOnce('day-' + n, 'Día ' + n + ' sellado', hi + goOn);
    }
    if (n === 7 || n === 14 || n === 21) renderNudge(s);
    renderProgress(s);
  }

  function render(s) {
    s = s || load();
    renderProgress(s);
    renderNudge(s, 'upgradeHoy');
    renderUpgradeAudios(s);
    paintPlayer(s);
    if (s.player && s.player.vol != null) el.volume = s.player.vol;
    applyLoopToEl(loopMode(s));
  }

  function bind() {
    if ($('btnPlay')) $('btnPlay').onclick = toggle;
    if ($('miniPlay')) $('miniPlay').onclick = function (e) { e.stopPropagation(); toggle(); };
    if ($('miniGo')) $('miniGo').onclick = function () { if (w.P28 && w.P28.go) w.P28.go('audios'); };
    if ($('btnPrev')) $('btnPrev').onclick = prev;
    if ($('btnNext')) $('btnNext').onclick = next;
    if ($('btnLoop')) $('btnLoop').onclick = function () { cycleLoop(); };
    if ($('btnGoAudio')) $('btnGoAudio').onclick = function () {
      if (w.P28 && w.P28.go) w.P28.go('audios');
      play();
    };
    if ($('btnPickAudio')) $('btnPickAudio').onclick = function () { $('audioFile') && $('audioFile').click(); };
    if ($('audioFile')) $('audioFile').onchange = function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var title = ($('audioTitle') && $('audioTitle').value) || '';
      if ($('audioAddMsg')) $('audioAddMsg').textContent = 'Guardando…';
      addFile(f, title).then(function () {
        if ($('audioAddMsg')) $('audioAddMsg').textContent = '';
        if ($('audioTitle')) $('audioTitle').value = '';
        $('audioFile').value = '';
      }).catch(function (err) {
        if ($('audioAddMsg')) $('audioAddMsg').textContent = err.message || 'No se pudo guardar.';
      });
    };
    if ($('vol')) {
      $('vol').oninput = function () { setVol(this.value); };
    }
    if ($('seek')) {
      $('seek').onmousedown = $('seek').ontouchstart = function () { seeking = true; };
      $('seek').oninput = function () {
        fillRange(this, (Number(this.value) / 1000) * 100);
        if (isFinite(el.duration)) $('tCur').textContent = fmt((Number(this.value) / 1000) * el.duration);
      };
      function commitSeek() {
        seeking = false;
        if (isFinite(el.duration)) el.currentTime = (Number($('seek').value) / 1000) * el.duration;
        persistPos();
      }
      $('seek').onmouseup = $('seek').ontouchend = commitSeek;
      $('seek').onchange = commitSeek;
    }
    function hit(el, name) {
      if (!el) return null;
      if (el.getAttribute && el.getAttribute(name) != null) return el.getAttribute(name);
      if (el.closest) {
        var n = el.closest('[' + name + ']');
        return n ? n.getAttribute(name) : null;
      }
      return null;
    }
    if ($('vaultList')) {
      $('vaultList').onclick = function (e) {
        var imgT = hit(e.target, 'data-img');
        if (imgT) {
          e.stopPropagation();
          var ip = imgT.split(':');
          pickImage(ip[0], ip[1]);
          return;
        }
        var delId = hit(e.target, 'data-del');
        var addId = hit(e.target, 'data-add-pl');
        var playId = hit(e.target, 'data-play');
        if (delId) {
          if (confirm('¿Quitar este audio?')) removeTrack(delId);
          return;
        }
        if (addId) {
          e.stopPropagation();
          addToPlaylist(addId, 1);
          return;
        }
        var openId = hit(e.target, 'data-pl-open');
        if (openId) {
          openPlaylist(openId);
          if ($('plQueue') && $('plQueue').scrollIntoView) $('plQueue').scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        var s0 = load();
        var cur0 = current(s0);
        var start = hit(e.target, 'data-pl-start');
        if (start) {
          var parts = start.split(':');
          var pl0 = playlistById(s0, parts[0]);
          var it0 = pl0 && pl0.items && pl0.items[Number(parts[1])];
          if (el.src && activePl(s0) && activePl(s0).id === parts[0] && it0 && cur0 && cur0.id === it0.id) {
            toggle();
            return;
          }
          playPlaylistFrom(parts[0], Number(parts[1]));
          return;
        }
        if (playId) {
          if (el.src && !activePl(s0) && cur0 && cur0.id === playId) {
            toggle();
            return;
          }
          playTrackNow(playId);
        }
      };
      $('vaultList').ondragstart = function (e) {
        var id = hit(e.target, 'data-drag');
        if (!id) return;
        try { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'copy'; } catch (err) {}
        $('vaultList').setAttribute('data-dragging', id);
      };
      $('vaultList').ondragend = function () {
        $('vaultList').removeAttribute('data-dragging');
        var drop = $('plDrop');
        if (drop) drop.classList.remove('drag');
      };
    }
    if ($('plBar')) {
      $('plBar').onclick = function (e) {
        if (e.target.id === 'btnPlCreate' || (e.target.closest && e.target.closest('#btnPlCreate'))) {
          createPlaylist(($('plNameIn') && $('plNameIn').value) || 'Lista');
          return;
        }
        var del = hit(e.target, 'data-pl-del');
        var pl = hit(e.target, 'data-pl');
        if (e.target.closest && e.target.closest('[data-pl-new]')) {
          patch(function (st) { st.plNew = !st.plNew; });
          render(load());
          return;
        }
        if (del) {
          deletePlaylist(del);
          return;
        }
        if (pl) openPlaylist(pl);
      };
      $('plBar').onkeydown = function (e) {
        if (e.key === 'Enter' && e.target && e.target.id === 'plNameIn') {
          e.preventDefault();
          createPlaylist(e.target.value || 'Lista');
        }
      };
    }
    if ($('plQueue')) {
      $('plQueue').onclick = function (e) {
        var imgQ = hit(e.target, 'data-img');
        if (imgQ) {
          var qp = imgQ.split(':');
          pickImage(qp[0], qp[1]);
          return;
        }
        if (e.target.id === 'btnPlPlay' || (e.target.closest && e.target.closest('#btnPlPlay'))) {
          var pl0 = activePl();
          if (pl0) playPlaylist(pl0.id);
          return;
        }
        var delPl = hit(e.target, 'data-pl-del');
        if (delPl) {
          deletePlaylist(delPl);
          return;
        }
        var item = hit(e.target, 'data-pl-item');
        var minus = hit(e.target, 'data-times-minus');
        var plus = hit(e.target, 'data-times-plus');
        var edit = hit(e.target, 'data-times-edit');
        var rm = hit(e.target, 'data-pl-rm');
        var pl = activePl();
        if (item != null && pl && pl.items[Number(item)]) {
          var q = expandQueue();
          var want = pl.items[Number(item)].id;
          var idx = 0;
          for (var i = 0; i < q.length; i++) if (q[i].id === want) { idx = i; break; }
          playQueueIndex(idx, true);
          return;
        }
        if (minus != null) {
          var curM = (pl && pl.items[Number(minus)] && pl.items[Number(minus)].times) || 1;
          setItemTimes(Number(minus), curM - 1);
          return;
        }
        if (plus != null) {
          var curP = (pl && pl.items[Number(plus)] && pl.items[Number(plus)].times) || 1;
          setItemTimes(Number(plus), curP + 1);
          return;
        }
        if (edit != null) {
          var curE = (pl && pl.items[Number(edit)] && pl.items[Number(edit)].times) || 1;
          var typed = w.prompt ? w.prompt('Veces', String(curE)) : String(curE);
          if (typed != null) setItemTimes(Number(edit), typed);
          return;
        }
        if (rm != null) removeFromPlaylist(Number(rm));
      };
      $('plQueue').ondragover = function (e) {
        e.preventDefault();
        var drop = $('plDrop');
        if (drop) drop.classList.add('drag');
      };
      $('plQueue').ondragleave = function (e) {
        if (e.target.id === 'plDrop' || e.target.id === 'plFolder' || e.target.id === 'plQueue') {
          var drop = $('plDrop');
          if (drop) drop.classList.remove('drag');
        }
      };
      $('plQueue').ondrop = function (e) {
        e.preventDefault();
        var drop = $('plDrop');
        if (drop) drop.classList.remove('drag');
        var from = $('vaultList') && $('vaultList').getAttribute('data-dragging');
        var text = '';
        try { text = e.dataTransfer && e.dataTransfer.getData('text/plain'); } catch (err) {}
        var id = from || text;
        var to = hit(e.target, 'data-pl-index');
        var src = $('plQueue').getAttribute('data-drag-index');
        if (src != null && src !== '' && to != null) {
          moveItem(src, to);
          $('plQueue').removeAttribute('data-drag-index');
          return;
        }
        if (id && trackById(load(), id)) addToPlaylist(id, 1);
        if ($('vaultList')) $('vaultList').removeAttribute('data-dragging');
        $('plQueue').removeAttribute('data-drag-index');
      };
      $('plQueue').ondragstart = function (e) {
        var idx = hit(e.target, 'data-pl-index');
        if (idx == null) return;
        $('plQueue').setAttribute('data-drag-index', idx);
        try { e.dataTransfer.setData('text/plain', idx); e.dataTransfer.effectAllowed = 'move'; } catch (err) {}
      };
    }
    var drop = $('addAudioCard');
    if (drop) {
      ['dragenter', 'dragover'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); });
      });
      drop.addEventListener('drop', function (e) {
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (!f) return;
        addFile(f, ($('audioTitle') && $('audioTitle').value) || '')
          .then(function () { if ($('audioAddMsg')) $('audioAddMsg').textContent = ''; })
          .catch(function (err) { if ($('audioAddMsg')) $('audioAddMsg').textContent = err.message || 'No se pudo guardar.'; });
      });
    }
    if ($('celebrate')) $('celebrate').onclick = hideCelebrate;
    el.addEventListener('timeupdate', tickUI);
    el.addEventListener('loadedmetadata', function () {
      persistPos();
      tickUI();
    });
    el.addEventListener('play', function () {
      wantPlay = true;
      startListenClock();
      paintPlayer();
    });
    el.addEventListener('pause', function () {
      persistPos();
      paintPlayer();
      if (!document.hidden || el.ended) { wantPlay = false; return; }
      /* El sistema a veces corta el audio al saltar a otra app; si no lo pausó ella, se reanuda. */
      if (wantPlay && Date.now() - hiddenAt < 4000 && resumeTries < 2) {
        resumeTries += 1;
        setTimeout(function () {
          if (wantPlay && el.paused) el.play().catch(function () {});
        }, 350);
      }
    });
    el.addEventListener('ended', function () {
      persistPos();
      patch(function (st) {
        var cur = current(st);
        if (!cur) return;
        st.library = (st.library || []).map(function (x) {
          if (x.id !== cur.id) return x;
          x.lastTime = 0;
          return x;
        });
      });
      var mode = loopMode();
      if (mode === 'one') {
        el.currentTime = 0;
        el.play().catch(function () {});
        return;
      }
      if (mode === 'all') {
        var q = expandQueue();
        if (q.length > 1) next();
        else {
          el.currentTime = 0;
          el.play().catch(function () {});
        }
        return;
      }
      paintPlayer();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        hiddenAt = Date.now();
        resumeTries = 0;
        persistPos();
        return;
      }
      if (wantPlay && el.paused && el.src && !el.ended) el.play().catch(function () {});
    });
  }

  bind();

  w.P28Vault = {
    render: render,
    renderProgress: renderProgress,
    renderNudge: renderNudge,
    onSeal: onSeal,
    play: play,
    pause: pause,
    toggle: toggle,
    addFile: addFile,
    cheer: showCelebrate,
    listenToday: listenToday,
    saveMindMovie: function (file) {
      if (!file) return Promise.reject(new Error('Elige un video.'));
      if (file.size > MAX_MB * 1024 * 1024) return Promise.reject(new Error('Ese video pesa más de ' + MAX_MB + ' MB.'));
      return idbPut('mind-movie', file).then(function () {
        patch(function (st) { st.mindMovie = { name: file.name, at: new Date().toISOString(), size: file.size }; });
      });
    },
    getMindMovie: function () { return idbGet('mind-movie'); },
    removeMindMovie: function () {
      return idbDel('mind-movie').then(function () {
        patch(function (st) { delete st.mindMovie; });
      });
    }
  };
})(window);
