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
  function layerLabel(v) {
    if (v === '2') return 'Capa 2';
    if (v === '3') return 'Capa 3';
    if (v === 'extra') return 'Extra';
    return 'Capa 1';
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
    var list = library(s);
    var cur = current(s);
    if (!list.length) {
      box.innerHTML = '<p class="note">Aún no hay audios en la bóveda. Mete el que te mandó Erior.</p>';
      return;
    }
    box.innerHTML = '<div class="vault-list">' + list.map(function (t) {
      var on = cur && cur.id === t.id;
      return '<div class="track-row' + (on ? ' on' : '') + '" data-play="' + t.id + '">' +
        '<div><b>' + t.title + '</b><small>' + layerLabel(t.layer) + ' · ' + (t.plays || 0) + ' reproducciones' +
        (t.duration ? ' · ' + fmt(t.duration) : '') + '</small></div>' +
        '<button type="button" data-play="' + t.id + '">Oír</button>' +
        '<button type="button" data-del="' + t.id + '">Quitar</button></div>';
    }).join('') + '</div>';
  }

  function renderUpgradeAudios(s) {
    var box = $('upgradeAudios');
    if (!box) return;
    s = s || load();
    var pack = Number((s.access && s.access.pack) || s.pack || 1);
    var rec = s.rec || {};
    var rows = '';
    function card(n, audio, why, open) {
      if (!audio) return '';
      if (!open) return '';
      return '<div class="layer-row on"><span>Capa ' + n + ' · ' + audio.name + '</span><em>Tuya</em></div>';
    }
    rows += card(1, rec.primary, rec.why1, pack >= 1);
    rows += card(2, rec.second, rec.why2, pack >= 2);
    rows += card(3, rec.third, '', pack >= 3);
    box.innerHTML = rows
      ? '<div class="card foil-card" style="margin-top:1rem"><span class="num">Tus capas</span>' + rows + '</div>'
      : '';
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
    if (mode === 'all') return 'loop playlist';
    if (mode === 'one') return 'loop 1 audio';
    return 'loop off';
  }

  function paintPlayer(s) {
    s = s || load();
    var t = current(s);
    var playing = !el.paused && !el.ended;
    var mode = loopMode(s);
    applyLoopToEl(mode);
    document.body.classList.toggle('is-playing', playing);
    if ($('vinyl')) $('vinyl').classList.toggle('spin', playing);
    if ($('playerTitle')) $('playerTitle').textContent = t ? t.title : 'Elige o mete un audio';
    if ($('playerLayer')) $('playerLayer').textContent = t ? layerLabel(t.layer) : 'Sin audio';
    if ($('playerMeta')) {
      $('playerMeta').textContent = t
        ? (t.plays || 0) + ' reproducciones · ' + loopLabel(mode)
        : 'Loop de playlist, de un audio, o apagado.';
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
      $('btnLoop').setAttribute('aria-label', mode === 'all' ? 'Loop de toda la playlist' : mode === 'one' ? 'Loop de este audio' : 'Loop apagado');
      if ($('loopBadge')) $('loopBadge').textContent = mode === 'all' ? 'ALL' : mode === 'one' ? '1' : '';
    }
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
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.title,
        artist: 'Erior Center',
        album: 'Erior Center'
      });
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

  function play() {
    var s = load();
    var t = current(s);
    if (!t) {
      if (w.P28 && w.P28.go) w.P28.go('audios');
      return;
    }
    if (!el.src) {
      loadTrack(t.id, true);
      return;
    }
    el.play().catch(function () {});
  }
  function pause() { el.pause(); persistPos(); paintPlayer(); }
  function toggle() { if (el.paused) play(); else pause(); }
  function step(dir) {
    var list = library(load());
    if (!list.length) return;
    var cur = current();
    var i = 0;
    for (var n = 0; n < list.length; n++) if (cur && list[n].id === cur.id) i = n;
    var nextI = (i + dir + list.length) % list.length;
    loadTrack(list[nextI].id, true, true);
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

  function addFile(file, title, layer) {
    if (!file) return Promise.reject(new Error('Elige un archivo de audio.'));
    if (file.size > MAX_MB * 1024 * 1024) return Promise.reject(new Error('Ese archivo pesa más de ' + MAX_MB + ' MB.'));
    var name = (title || file.name || 'Audio Erior').replace(/\.[a-z0-9]{2,5}$/i, '').trim();
    var id = 'a-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    var track = {
      id: id,
      title: name.slice(0, 80),
      layer: layer || '1',
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
      });
      var n = s.library.length;
      showCelebrate(n === 1 ? 'Tu bóveda está viva' : 'Capa nueva', n === 1
        ? 'Ya puedes oír tu audio aquí. Volumen, loop y progreso, en este celular.'
        : 'Audio ' + n + ' en tu reto. No te quedes en una sola frecuencia.');
      render(s);
      return loadTrack(id, false);
    });
  }

  function removeTrack(id) {
    return idbDel(id).then(function () {
      var s = patch(function (st) {
        st.library = (st.library || []).filter(function (t) { return t.id !== id; });
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
      : 'Ciclo cerrado. Escribe tu testimonio en el muro. Solo tu nombre.';
    var hi = name ? (name + ', lo lograste hoy. ') : 'Lo lograste hoy. ';
    if (n === 28 && weekComplete(days, 4)) {
      cheerOnce('week-4', 'Los 28 días', hi + 'Ciclo cerrado. Testimonio al muro. Solo tu nombre.');
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
    renderVaultList(s);
    renderUpgradeAudios(s);
    paintPlayer(s);
    if (w.P28 && w.P28.renderListenPlan) w.P28.renderListenPlan(s);
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
      var layerEl = document.querySelector('[name="layer"]:checked');
      var layer = layerEl ? layerEl.value : '1';
      if ($('audioAddMsg')) $('audioAddMsg').textContent = 'Guardando…';
      addFile(f, title, layer).then(function () {
        if ($('audioAddMsg')) $('audioAddMsg').textContent = 'Listo. Ya está en tu bóveda.';
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
    if ($('vaultList')) {
      $('vaultList').onclick = function (e) {
        var playId = e.target.getAttribute('data-play') || (e.target.closest && e.target.closest('[data-play]') && e.target.closest('[data-play]').getAttribute('data-play'));
        var delId = e.target.getAttribute('data-del');
        if (delId) {
          if (confirm('¿Quitar este audio de la bóveda? El archivo se borra de este celular.')) removeTrack(delId);
          return;
        }
        if (playId) loadTrack(playId, true);
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
        var layerEl = document.querySelector('[name="layer"]:checked');
        addFile(f, ($('audioTitle') && $('audioTitle').value) || '', layerEl ? layerEl.value : '1')
          .then(function () { if ($('audioAddMsg')) $('audioAddMsg').textContent = 'Listo. Ya está en tu bóveda.'; })
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
      var list = library(load());
      if (mode === 'all') {
        if (list.length > 1) next();
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
