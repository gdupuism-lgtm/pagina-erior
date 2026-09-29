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
  var COVER_DIR = '../img/catalog/';
  var COVERS = [
    [/booster/, 'booster-2-0.jpg'],
    [/limitless/, 'limitless.jpg'],
    [/hombre|\bmen\b/, 'amor-propio-magic-hombre-2-0.jpg'],
    [/imagine/, 'imagine.jpg'],
    [/seduction/, 'seduction.jpg'],
    [/attraction|atraccion/, 'attraction.jpg'],
    [/erior love/, 'erior-love.jpg'],
    [/mesmerizing/, 'mesmerizing-love.jpg'],
    [/audio erior|erior 3/, 'audio-erior-3-0.jpg'],
    [/magic 3/, 'amor-propio-magic-3-0.jpg'],
    [/magic 2/, 'amor-magic-2-0.jpg'],
    [/magic|amor propio/, 'amor-propio-magic-4-0.jpg'],
    [/mind movie/, 'mind-movie.jpg'],
    [/master ?mind/, 'master-mind.jpg'],
    [/identity|identidad/, 'identity.jpg'],
    [/abundance|abundancia/, 'master-abundance.jpg'],
    [/money|dinero/, 'money-tech.jpg'],
    [/lucky|suerte/, 'lucky.jpg'],
    [/vitamind|vitamin/, 'vitamind.jpg'],
    [/fit ?wave/, 'fit-wave.jpg'],
    [/keep ?cool/, 'keep-cool.jpg'],
    [/eclat/, 'eclat.jpg'],
    [/11 ?11/, '11-11.jpg'],
    [/audio you/, 'audio-you.jpg'],
    [/curious/, 'curious-curiouser.jpg'],
    [/emergency|999/, 'emergency-999.jpg'],
    [/kids/, 'erior-kids.jpg'],
    [/\bgod\b|goddess|diosa/, 'god-goddess.jpg'],
    [/aura/, 'icon-aura.jpg'],
    [/glow/, 'mental-glow-up.jpg'],
    [/satori/, 'satori.jpg'],
    [/\bselect\b/, 'select.jpg'],
    [/simulation/, 'simulation-u.jpg'],
    [/telegram|liberar emociones/, 'telegram-liberar-emociones.jpg'],
    [/rabbit/, 'white-rabbit-code.jpg'],
    [/wonderland|coherence/, 'wonderland-coherence.jpg']
  ];
  function coverFor(title) {
    var t = String(title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
    if (!t) return '';
    for (var i = 0; i < COVERS.length; i++) {
      if (COVERS[i][0].test(t)) return COVER_DIR + COVERS[i][1];
    }
    return '';
  }
  function posterHtml(t, opts) {
    opts = opts || {};
    var cv = coverFor(t.title);
    var attrs = opts.attrs || '';
    return '<div class="poster' + (opts.sm ? ' sm' : '') + (opts.on ? ' on' : '') + (cv ? '' : ' no-img') + '"' + attrs + '>' +
      (cv
        ? '<img src="' + cv + '" alt="" loading="lazy" decoding="async" draggable="false">'
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
          (pl ? '<button type="button" class="poster-add' + (inPl[t.id] ? ' in' : '') + '" data-add-pl="' + t.id + '">' + (inPl[t.id] ? 'Ya' : 'Meter') + '</button>' : '');
        return posterHtml(t, {
          on: on,
          top: top,
          chip: t.duration ? fmt(t.duration) : 'Audio',
          attrs: ' data-play="' + t.id + '" draggable="true" data-drag="' + t.id + '"'
        });
      }).join('') + '</div>';
    playlists(s).forEach(function (p) {
      var items = (p.items || []).filter(function (it) { return trackById(s, it.id); });
      if (!items.length) return;
      html += '<div class="rail-head"><h3>' + esc(p.name) + '</h3>' +
        '<button type="button" class="rail-open" data-pl-open="' + p.id + '">Editar</button></div>' +
        '<div class="rail rail-row" data-rail="' + p.id + '">' + items.map(function (it) {
          var t = trackById(s, it.id);
          var idx = (p.items || []).indexOf(it);
          var on = pl && pl.id === p.id && cur && cur.id === t.id;
          return posterHtml(t, {
            sm: true,
            on: on,
            chip: (it.times || 1) > 1 ? '×' + it.times : '',
            attrs: ' data-pl-start="' + p.id + ':' + idx + '"'
          });
        }).join('') + '</div>';
    });
    if (box.getAttribute('data-sig') === html) return;
    var keep = {};
    Array.prototype.forEach.call(box.querySelectorAll('.rail-row'), function (r) {
      keep[r.getAttribute('data-rail')] = r.scrollLeft;
    });
    box.innerHTML = html;
    box.setAttribute('data-sig', html);
    Array.prototype.forEach.call(box.querySelectorAll('.rail-row'), function (r) {
      var k = r.getAttribute('data-rail');
      if (keep[k]) r.scrollLeft = keep[k];
    });
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
        var cv = t ? coverFor(t.title) : '';
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
    queue.innerHTML =
      '<div class="pl-folder foil-card" id="plFolder">' +
        '<div class="pl-folder-head">' +
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
    var cv = t ? coverFor(t.title) : '';
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
      var cv = coverFor(t.title);
      var meta = { title: t.title, artist: 'Erior Center', album: 'Erior Center' };
      if (cv) meta.artwork = [{ src: new URL(cv, location.href).href, sizes: '512x512', type: 'image/jpeg' }];
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
      if (autoplay) {
        applyEq(eqOf(s));
        return el.play().catch(function () {});
      }
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
    applyEq(eqOf(s));
    el.play().catch(function () {});
  }
  function pause() { el.pause(); persistPos(); paintPlayer(); }
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
  var ac = null;
  var eqNodes = null;
  var EQ_PRESETS = { normal: { v: 50, b: 50 }, voz: { v: 82, b: 32 }, fondo: { v: 18, b: 72 } };
  function eqOf(s) {
    var e = (s && s.player && s.player.eq) || {};
    return { v: e.v == null ? 50 : Number(e.v), b: e.b == null ? 50 : Number(e.b) };
  }
  function eqNeutral(e) { return e.v === 50 && e.b === 50; }
  function eqDb(pct, up, down) {
    return pct >= 50 ? ((pct - 50) / 50) * up : -((50 - pct) / 50) * down;
  }
  function ensureGraph() {
    if (eqNodes) return true;
    var AC = w.AudioContext || w.webkitAudioContext;
    if (!AC) return false;
    try {
      ac = new AC();
      var src = ac.createMediaElementSource(el);
      var low = ac.createBiquadFilter();
      low.type = 'lowshelf';
      low.frequency.value = 300;
      var body = ac.createBiquadFilter();
      body.type = 'peaking';
      body.frequency.value = 950;
      body.Q.value = 0.8;
      var pres = ac.createBiquadFilter();
      pres.type = 'peaking';
      pres.frequency.value = 2700;
      pres.Q.value = 1;
      var air = ac.createBiquadFilter();
      air.type = 'highshelf';
      air.frequency.value = 6500;
      var out = ac.createGain();
      src.connect(low);
      low.connect(body);
      body.connect(pres);
      pres.connect(air);
      air.connect(out);
      out.connect(ac.destination);
      eqNodes = { low: low, body: body, pres: pres, air: air, out: out };
      return true;
    } catch (e) {
      eqNodes = null;
      return false;
    }
  }
  function wakeAudio() {
    if (ac && ac.state === 'suspended') ac.resume().catch(function () {});
  }
  function applyEq(e) {
    e = e || eqOf(load());
    if (eqNeutral(e) && !eqNodes) return;
    if (!ensureGraph()) return;
    var gv = eqDb(e.v, 9, 26);
    var gb = eqDb(e.b, 12, 20);
    var now = ac.currentTime;
    eqNodes.body.gain.setTargetAtTime(gv, now, 0.04);
    eqNodes.pres.gain.setTargetAtTime(gv, now, 0.04);
    eqNodes.low.gain.setTargetAtTime(gb, now, 0.04);
    eqNodes.air.gain.setTargetAtTime(gb * 0.7, now, 0.04);
    var boost = Math.max(0, gv, gb);
    eqNodes.out.gain.setTargetAtTime(Math.pow(10, (-boost * 0.6) / 20), now, 0.04);
    wakeAudio();
  }
  function eqLabel(pct) {
    var n = Math.round((pct - 50) * 2);
    if (!n) return 'Normal';
    return (n > 0 ? '+' : '−') + Math.abs(n);
  }
  function paintEq(s) {
    var e = eqOf(s || load());
    if ($('eqVoice')) { $('eqVoice').value = e.v; fillRange($('eqVoice'), e.v); }
    if ($('eqBg')) { $('eqBg').value = e.b; fillRange($('eqBg'), e.b); }
    if ($('eqVoicePct')) $('eqVoicePct').textContent = eqLabel(e.v);
    if ($('eqBgPct')) $('eqBgPct').textContent = eqLabel(e.b);
    var box = $('eqPresets');
    if (box) {
      Array.prototype.forEach.call(box.querySelectorAll('[data-eq]'), function (b) {
        var p = EQ_PRESETS[b.getAttribute('data-eq')];
        b.classList.toggle('on', !!p && p.v === e.v && p.b === e.b);
      });
    }
  }
  function setEq(next) {
    var s = patch(function (st) {
      st.player = st.player || {};
      var cur = eqOf(st);
      st.player.eq = {
        v: Math.max(0, Math.min(100, Math.round(next.v != null ? next.v : cur.v))),
        b: Math.max(0, Math.min(100, Math.round(next.b != null ? next.b : cur.b)))
      };
    });
    applyEq(eqOf(s));
    paintEq(s);
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
    paintEq(s);
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
    if ($('eqVoice')) $('eqVoice').oninput = function () { setEq({ v: Number(this.value) }); };
    if ($('eqBg')) $('eqBg').oninput = function () { setEq({ b: Number(this.value) }); };
    if ($('eqPresets')) {
      $('eqPresets').onclick = function (e) {
        var k = hit(e.target, 'data-eq');
        if (k && EQ_PRESETS[k]) setEq(EQ_PRESETS[k]);
      };
    }
    if ($('eqNote') && /iPad|iPhone|iPod/.test(navigator.userAgent || '')) {
      $('eqNote').textContent = 'En iPhone, si lo mueves, el audio puede pausarse al bloquear la pantalla. Para la noche déjalo en Normal.';
      $('eqNote').hidden = false;
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
      wakeAudio();
      startListenClock();
      paintPlayer();
    });
    el.addEventListener('pause', function () {
      persistPos();
      paintPlayer();
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
      if (document.hidden) persistPos();
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
