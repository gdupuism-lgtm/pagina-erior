(function () {
  var WA = '5214432311761';
  var MAIL = 'eriorcenter@gmail.com';
  var STORE = 'erior-p28';
  var PACKS = { 1: 999, 2: 1555, 3: 2222 };
  var PACK_COPY = {
    1: { t: 'Capa 1', x: 'Tu audio de este reto. Noche en loop. Día, mínimo 4 horas.' },
    2: { t: 'Capas 1 y 2', x: 'Deseo + lo que lo sabotea. Dos frecuencias en tu bóveda.' },
    3: { t: 'Tres capas', x: 'Deseo + limpieza + identidad. El ciclo completo.' }
  };
  var deferredInstall = null;

  var AUDIOS = {
    booster: { id: 'booster', name: 'Booster 2.0', img: '../img/catalog/booster-2-0.jpg', pitch: 'Limpia loops, ruido mental y el programa viejo.' },
    limitless: { id: 'limitless', name: 'LIMITLESS', img: '../img/catalog/limitless.jpg', pitch: 'Foco láser y mente despierta.' },
    hombre: { id: 'hombre', name: 'Amor Propio Magic Hombre 2.0', img: '../img/catalog/amor-propio-magic-hombre-2-0.jpg', pitch: 'Sostenerte tú. Independencia y seguridad.' },
    imagine: { id: 'imagine', name: 'IMAGINE', img: '../img/catalog/imagine.jpg', pitch: 'Imaginar desde el resultado. Ya soy.' },
    seduction: { id: 'seduction', name: 'SEDUCTION', img: '../img/catalog/seduction.jpg', pitch: 'Magnetismo. Dejas de perseguir.' },
    magic4: { id: 'magic4', name: 'Amor Propio Magic 4.0', img: '../img/catalog/amor-propio-magic-4-0.jpg', pitch: 'Merecimiento. Corta validación externa.' },
    masterMind: { id: 'masterMind', name: 'MASTER MIND', img: '../img/catalog/master-mind.jpg', pitch: 'Corta autosabotaje. Sostienes lo que empiezas.' },
    identity: { id: 'identity', name: 'Identity', img: '../img/catalog/identity.jpg', pitch: 'Personaje principal. Propósito.' },
    moneyTech: { id: 'moneyTech', name: 'MONEY TECH', img: '../img/catalog/money-tech.jpg', pitch: 'Canal de dinero día/noche.' },
    abundance: { id: 'abundance', name: 'Master Abundance', img: '../img/catalog/master-abundance.jpg', pitch: 'Identidad de abundancia para negocio.' },
    vitamind: { id: 'vitamind', name: 'VITAMIND', img: '../img/catalog/vitamind.jpg', pitch: 'Energía y vitalidad.' },
    fitWave: { id: 'fitWave', name: 'FIT WAVE', img: '../img/catalog/fit-wave.jpg', pitch: 'Creencias del cuerpo.' },
    keepCool: { id: 'keepCool', name: 'KEEP COOL', img: '../img/catalog/keep-cool.jpg', pitch: 'Paz. No reaccionar.' },
    eclat: { id: 'eclat', name: 'Éclat', img: '../img/catalog/eclat.jpg', pitch: 'Avatar y resplandor.' },
    lucky: { id: 'lucky', name: 'Lucky', img: '../img/catalog/lucky.jpg', pitch: 'Suerte y timing.' }
  };

  function $(id) { return document.getElementById(id); }
  function val(name) {
    var el = document.querySelector('[name="' + name + '"]:checked') || document.querySelector('[name="' + name + '"]');
    return el ? String(el.value || '').trim() : '';
  }
  function txt(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function save(state) { localStorage.setItem(STORE, JSON.stringify(state)); }
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (e) { return {}; }
  }
  function patch(fn) {
    var s = load();
    fn(s);
    save(s);
    return s;
  }
  function firstName(raw) {
    return (window.P28Access && P28Access.firstName(raw)) || String(raw || '').trim().split(/\s+/)[0];
  }

  function serial(name) {
    var n = (name || 'ERIOR').replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'ERIOR';
    return 'P28-' + n + '-' + Date.now().toString(36).slice(-4).toUpperCase();
  }

  function findOwned(raw) {
    var t = txt(raw);
    if (!t) return null;
    var map = [
      ['booster', /booster/], ['limitless', /limitless/], ['hombre', /hombre/],
      ['imagine', /imagine/], ['seduction', /seduction|atraccion|attraction/],
      ['magic4', /magic 4|4\.0|amor propio/], ['masterMind', /master mind/],
      ['identity', /identity/], ['moneyTech', /money tech/], ['abundance', /abundance/],
      ['vitamind', /vitamind/], ['fitWave', /fit wave/], ['keepCool', /keep cool/], ['eclat', /eclat/]
    ];
    for (var i = 0; i < map.length; i++) {
      if (map[i][1].test(t)) return AUDIOS[map[i][0]];
    }
    return { id: 'owned', name: raw.trim(), img: '', pitch: 'Audio anterior. No es el acceso al reto. El acceso es el pack de este mes.' };
  }

  function pair(a, b, c, why1, why2, pattern) {
    return { primary: a, second: b, third: c, why1: why1, why2: why2, pattern: pattern };
  }

  function recommend(data) {
    var area = data.area;
    var gender = data.gender;
    var blob = txt(data.pain + ' ' + data.wants);
    var owned = data.owned === 'si' ? findOwned(data.ownedName) : null;
    var rec;
    if (area === 'dinero') {
      rec = /toc\b|loop|ruido|saturad/.test(blob)
        ? pair(AUDIOS.booster, AUDIOS.moneyTech, AUDIOS.imagine, 'Primero se limpia el loop.', 'MONEY TECH abre el canal.', 'Dinero tapado por ruido mental.')
        : pair(AUDIOS.moneyTech, AUDIOS.booster, AUDIOS.imagine, 'Tu prioridad es dinero. MONEY TECH instala el canal.', 'Booster limpia el ruido laboral.', 'Dinero + mente que no sabotea.');
    } else if (area === 'amor') {
      rec = pair(AUDIOS.magic4, AUDIOS.seduction, AUDIOS.imagine, 'Merecimiento. No atraer desde el hueco.', 'SEDUCTION: magnetismo.', 'Amor: completud + señal.');
    } else if (area === 'propio') {
      rec = pair(AUDIOS.magic4, AUDIOS.booster, AUDIOS.imagine, 'Seguridad. Lo externo deja de mandar.', 'Booster apaga la duda.', 'Autoconcepto.');
    } else if (area === 'claridad') {
      rec = pair(AUDIOS.limitless, AUDIOS.masterMind, AUDIOS.booster, 'Foco láser.', 'Sostienes lo que empiezas.', 'Claridad + constancia.');
    } else if (area === 'salud') {
      rec = pair(AUDIOS.vitamind, AUDIOS.limitless, AUDIOS.keepCool, 'Energía del cuerpo.', 'Foco para que no se apague.', 'Vitalidad + dirección.');
    } else if (area === 'cuerpo') {
      rec = pair(AUDIOS.magic4, AUDIOS.fitWave, AUDIOS.eclat, 'Relación con el cuerpo.', 'Creencias de forma y peso.', 'Vínculo + forma.');
    } else if (area === 'paz') {
      rec = pair(AUDIOS.keepCool, gender === 'hombre' ? AUDIOS.hombre : AUDIOS.magic4, AUDIOS.imagine, 'Paz en el sistema.', 'Que tu calma no dependa del afuera.', 'Tranquilidad desde adentro.');
    } else {
      rec = pair(AUDIOS.booster, AUDIOS.imagine, AUDIOS.limitless, 'Punto cero.', 'Imaginar desde el resultado.', 'Limpiar + elegir.');
    }
    if (owned) rec.owned = owned;
    return rec;
  }

  function intentLine(name, wants, area) {
    var w = (wants || '').trim();
    if (w) return 'Yo soy ' + name + '. En estos 28 días instalo: ' + w.replace(/\s+/g, ' ') + '.';
    var map = { dinero: 'abundancia con movimiento real', amor: 'amor sin carencia', propio: 'seguridad que no pide permiso', claridad: 'foco y propósito', salud: 'energía limpia', cuerpo: 'paz con mi cuerpo', paz: 'una vida tranquila' };
    return 'Yo soy ' + name + '. En estos 28 días instalo ' + (map[area] || 'mi nueva frecuencia') + '.';
  }

  function areaLabel(a) {
    return ({ dinero: 'Dinero / abundancia', amor: 'Amor / relaciones', propio: 'Amor propio', claridad: 'Claridad / enfoque', salud: 'Salud / energía', cuerpo: 'Cuerpo', paz: 'Paz / calma' })[a] || a;
  }

  function collect() {
    return {
      name: val('name'), ig: val('ig').replace(/^@/, ''), phone: val('phone'), email: val('email'),
      gender: val('gender'), owned: val('owned'), ownedName: val('ownedName'),
      area: val('area'), time: val('time'), urgency: val('urgency'), pain: val('pain'), wants: val('wants')
    };
  }

  function validate(d) {
    if (!d.name || d.name.length < 2) return 'Escribe tu nombre.';
    if (!d.area) return 'Elige tu prioridad.';
    if (!d.pain || d.pain.length < 8) return 'Cuéntanos qué te frena.';
    if (d.owned === 'si' && !d.ownedName) return 'Escribe el nombre del audio que ya tenías.';
    return '';
  }

  function pingErior(msg) {
    var u = 'https://api.callmebot.com/whatsapp.php?phone=' + WA + '&text=' + encodeURIComponent(msg) + '&apikey=6870409';
    fetch(u).catch(function () {});
  }

  function phraseOfDay(n) {
    var list = window.P28_PHRASES || [];
    if (!list.length) return { t: 'ERIOR', x: 'Vas bien. Sigue los pasos de hoy.' };
    return list[(Math.max(1, n) - 1) % list.length];
  }

  function currentDay(s) {
    if (!s.start) return 1;
    var start = new Date(s.start);
    start.setHours(0, 0, 0, 0);
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var n = Math.floor((now - start) / 86400000) + 1;
    if (n < 1) return 1;
    if (n > 28) return 28;
    return n;
  }

  function routine(n) {
    var list = window.P28_ROUTINES || [];
    return list[n - 1] || { d: n, t: 'Pasos de hoy', x: 'Noche en loop + 4 horas de día.', steps: ['Audio de noche en loop.', 'De día, mínimo 4 horas.'] };
  }

  function waPayUrl(pack) {
    pack = Number(pack) || 1;
    var lines = [
      'Hola, ya deposité / quiero el Reto de Manifestación 28 días.',
      '',
      'Pack ' + pack + ' · $' + PACKS[pack].toLocaleString('es-MX') + ' MXN (reto incluido).',
      '',
      'Mando comprobante. Cuando confirmen, me entregan el código de acceso.'
    ];
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function expiredAccess(access) {
    if (!access) return false;
    if (access.expired) return true;
    if (!access.expires_at) return false;
    return Date.now() > new Date(access.expires_at).getTime();
  }

  function applyMode(s) {
    document.body.classList.remove('is-app', 'is-unlocked', 'is-lock', 'is-expired');
    if (s.access && expiredAccess(s.access)) {
      document.body.classList.add('is-expired');
      return;
    }
    if (!s.access) {
      document.body.classList.add('is-lock');
      return;
    }
    if (s.data && s.rec) {
      document.body.classList.add('is-app');
      showApp(s);
      return;
    }
    document.body.classList.add('is-unlocked');
    if (s.access.name && $('name') && !$('name').value) $('name').value = s.access.name;
    if (window.P28Vision) P28Vision.start(s);
    else if ($('intake')) $('intake').scrollIntoView({ behavior: 'smooth' });
  }

  function renderNotif() {}

  function fmtClock(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function renderDayTools(r, n) {
    var box = $('dayTools');
    if (!box) return;
    var html = '';
    if (r.kind === 'breath' && r.video) {
      html += '<div class="yt-box"><iframe src="https://www.youtube.com/embed/' + r.video + '" title="Wim Hof" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
      html += '<p class="note">Sigue el video. Si te mareas, paras. No lo hagas en agua ni manejando.</p>';
    }
    if (r.timer) {
      html += '<div class="day-timer"><div class="clock" id="dayClock">' + fmtClock(r.timer * 60) + '</div>' +
        '<button type="button" class="btn btn-gold btn-full" id="btnTimer">Empezar ' + r.timer + ' min</button></div>';
    }
    box.innerHTML = html;
    if ($('btnTimer')) {
      $('btnTimer').onclick = function () {
        patch(function (st) {
          st.timers = st.timers || {};
          st.timers[n] = { start: Date.now(), mins: r.timer };
        });
        paintTimer();
      };
    }
    paintTimer();
  }

  function paintTimer() {
    var clock = $('dayClock');
    if (!clock) return;
    var s = load();
    var n = currentDay(s);
    var r = routine(n);
    var t = s.timers && s.timers[n];
    if (!t || !t.start) {
      clock.textContent = fmtClock((r.timer || 25) * 60);
      return;
    }
    var left = Math.max(0, Math.round(t.mins * 60 - (Date.now() - t.start) / 1000));
    clock.textContent = fmtClock(left);
    if (left <= 0 && !t.done) {
      patch(function (st) { if (st.timers && st.timers[n]) st.timers[n].done = true; });
      showNativeNotif('Listo', 'Tiempo cumplido. Ahora tu audio.');
    }
  }

  function renderListenPlan(s) {
    s = s || load();
    lockPurpose(s);
    if ($('purposeIn') && s.purpose && !$('purposeIn').value) $('purposeIn').value = s.purpose;
    var box = $('listenPlan');
    if (!box || !window.P28Plan) return;
    var tracks = (s.library || []).map(function (t) { return { title: t.title }; });
    if (!s.purpose && !tracks.length) { box.innerHTML = ''; return; }
    var plan = P28Plan.build(s.purpose || '', tracks);
    var rows = plan.rows.map(function (row) {
      return '<div class="plan-row"><b>' + row.title + '</b><small>' + row.when + ' · ' + row.days + '</small></div>';
    }).join('');
    box.innerHTML =
      '<div class="card foil-card plan-card"><span class="num">Plan de escucha</span>' +
      '<p class="copy" style="margin:.4rem 0 .8rem">' + plan.summary + '</p>' +
      rows +
      (plan.extra ? '<p class="note">' + plan.extra + '</p>' : '') +
      '</div>';
  }

  function renderMission(s) {
    var n = currentDay(s);
    var r = routine(n);
    var done = (s.checks && s.checks[n]) || {};
    var steps = (r.steps || []).map(function (line, i) {
      return '<li><b>' + (i + 1) + '.</b> ' + line + '</li>';
    }).join('');
    $('missionBox').innerHTML =
      '<div class="day-n">Día ' + n + ' de 28 · pasos</div>' +
      '<h2>' + r.t + '</h2>' +
      (steps ? '<ol class="steps-list">' + steps + '</ol>' : '<p class="copy">' + r.x + '</p>') +
      (r.rec ? '<p class="day-rec">' + r.rec + '</p>' : '') +
      (s.purpose ? '<p class="note" style="margin-top:.8rem">Propósito de tus 28 días: ' + s.purpose + '</p>' : (s.data ? '<p class="note" style="margin-top:.8rem">' + intentLine(s.data.name, s.data.wants, s.data.area) + '</p>' : ''));
    renderDayTools(r, n);
    if ($('chkNight')) {
      $('chkNight').checked = !!done.night;
      $('chkDay').checked = !!done.day;
      $('chkMission').checked = !!done.mission;
    }
    renderNotif(s);
  }

  function renderDays(box, checked) {
    if (!box) return;
    box.innerHTML = '';
    for (var i = 1; i <= 28; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'day' + (checked[i] ? ' on' : '');
      b.textContent = i;
      b.setAttribute('aria-pressed', checked[i] ? 'true' : 'false');
      b.onclick = (function (n) {
        return function () {
          var state = patch(function (s) {
            s.days = s.days || {};
            s.days[n] = !s.days[n];
            if (!s.days[n]) {
              s.checks = s.checks || {};
              s.checks[n] = { night: false, day: false, mission: false };
            }
          });
          this.classList.toggle('on', state.days[n]);
          this.setAttribute('aria-pressed', state.days[n] ? 'true' : 'false');
          if (!state.days[n] && n === currentDay(state)) renderMission(state);
          if (state.days[n] && window.P28Vault) P28Vault.onSeal(n, state);
          if (state.days[n] && n === 28) go('com');
        };
      })(i);
      box.appendChild(b);
    }
  }

  function renderWall() {
    if (!$('wall')) return;
    function paint(items) {
      var seen = {};
      var all = (items || []).filter(function (w) {
        var k = (w.id || '') + (w.who || '') + (w.txt || '');
        if (seen[k]) return false;
        seen[k] = true;
        return !!(w.who && w.txt);
      });
      localStorage.setItem('erior-p28-wall-cache', JSON.stringify(all));
      $('wall').innerHTML = all.map(function (w) {
        var who = firstName(w.who);
        var letter = (who || 'E').charAt(0).toUpperCase();
        return '<div class="bubble"><span class="avatar">' + letter + '</span><div><strong>' + who + (w.day ? ' · día ' + w.day : '') + '</strong><p class="copy">' + w.txt + '</p></div></div>';
      }).join('') || '<p class="copy">Aún no hay publicaciones. El día 28 este muro se llena.</p>';
    }
    try { paint(JSON.parse(localStorage.getItem('erior-p28-wall-cache') || '[]')); } catch (e) {}
    if (window.P28Access) P28Access.getWall().then(paint);
  }

  function renderAudio(el, audio, why, badge) {
    if (!el || !audio) return;
    var img = audio.img
      ? '<img src="' + audio.img + '" alt="" onerror="this.style.display=\'none\'">'
      : '<div style="width:88px;height:88px;border-radius:16px;border:1px solid rgba(244,239,230,.12)"></div>';
    el.innerHTML = img + '<div><small class="serial">' + badge + '</small><h3>' + audio.name + '</h3><p class="why">' + why + '</p></div>';
  }

  function waUpgrade(s, next) {
    var name = firstName((s.data && s.data.name) || (s.access && s.access.name) || '');
    var pack = (s.access && s.access.pack) || s.pack || 1;
    var rec = s.rec || {};
    var want = next === 2 ? (rec.second && rec.second.name) : next === 3 ? (rec.third && rec.third.name) : 'un audio extra';
    var lines = [
      'Hola, ya estoy en el Reto de Manifestación 28 (pack ' + pack + ').',
      name ? 'Soy ' + name + '.' : '',
      '',
      next === 'extra'
        ? 'Quiero añadir otro audio a mi reto.'
        : 'Quiero subir a pack ' + next + ' · $' + PACKS[next].toLocaleString('es-MX') + ' MXN. Siguiente capa: ' + (want || 'la que me asignaron') + '.',
      '',
      'Confirmo por aquí y mando comprobante.'
    ].filter(Boolean);
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function renderUpgrades(s) {
    var pack = Number((s.access && s.access.pack) || s.pack || 1);
    var rec = s.rec || {};
    var layers = [
      { n: 1, audio: rec.primary, open: pack >= 1, label: 'Capa 1' },
      { n: 2, audio: rec.second, open: pack >= 2, label: 'Capa 2' },
      { n: 3, audio: rec.third, open: pack >= 3, label: 'Capa 3' }
    ];
    var rows = layers.map(function (L) {
      if (!L.audio || !L.open) return '';
      return '<div class="layer-row on"><span>' + L.label + ' · ' + L.audio.name + '</span><em>Tuya</em></div>';
    }).join('');
    if ($('upgradeBox')) {
      $('upgradeBox').innerHTML = rows
        ? '<div class="card foil-card" style="margin-top:1rem"><span class="num">Tus audios</span>' + rows + '</div>'
        : '';
    }
    if ($('upgradeHoy')) $('upgradeHoy').innerHTML = '';
  }

  function renderMyPack(s) {
    if (!$('myPackBox')) return;
    var pack = (s.access && s.access.pack) || s.pack || 1;
    var copy = PACK_COPY[pack] || PACK_COPY[1];
    var left = s.access && (s.access.days_left != null)
      ? s.access.days_left
      : (s.access && s.access.expires_at && window.P28Access ? P28Access.daysLeft(s.access.expires_at) : '—');
    $('myPackBox').innerHTML =
      '<div class="card foil-card"><span class="num">Tu acceso</span>' +
      '<p class="copy" style="margin:.4rem 0 .8rem">Quedan <b>' + left + '</b> días.</p>' +
      '<p class="note">' + copy.x + '</p></div>';
    renderUpgrades(s);
  }

  function showApp(s) {
    var data = s.data;
    var rec = s.rec;
    if ($('whoName')) $('whoName').textContent = data.name;
    if ($('whoMeta')) $('whoMeta').textContent = areaLabel(data.area) + ' · ' + data.serial;
    if ($('serialOut')) $('serialOut').textContent = data.serial;
    if ($('patternOut')) $('patternOut').textContent = rec.pattern || '';
    if ($('intentOut')) $('intentOut').textContent = intentLine(data.name, data.wants, data.area);
    renderAudio($('audioPrimary'), rec.primary, rec.why1 || '', rec.owned ? 'Ya es tuyo' : 'Audio 1');
    if (rec.second && rec.second.name !== rec.primary.name) {
      $('audioSecond').classList.remove('hidden');
      renderAudio($('audioSecond'), rec.second, rec.why2 || '', 'Audio 2');
    }
    renderDays($('dayGridApp'), s.days || {});
    renderMission(s);
    renderWall();
    renderMyPack(s);
    if (window.P28Vault) P28Vault.render(s);
    if ($('remindAt') && s.remindAt) $('remindAt').value = s.remindAt;
    if ($('btnRemind') && s.remindOn) $('btnRemind').textContent = 'On';
    go('hoy');
    renderStories(s);
    renderListenPlan(s);
    lockPurpose(s);
    renderInstallAndRemind(s);
    if (s.remindOn && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      subscribePhone(s.remindAt || '21:00').catch(function () {});
    }
    if (window.P28Vision) P28Vision.renderApp(s);
    maybeWelcome(s);
    window.scrollTo(0, 0);
  }

  function renderStories(s) {
    var bar = $('storyBar');
    if (!bar) return;
    var days = (s && s.days) || {};
    var today = currentDay(s || load());
    var html = '<button type="button" class="story story-video" id="storyVideo"><span class="story-ring"><i></i></span><em>Video</em></button>';
    for (var i = 1; i <= 28; i++) {
      html += '<button type="button" class="story' + (days[i] ? ' on' : '') + (i === today ? ' now' : '') + '" data-day="' + i + '"><span>' + i + '</span><em>Día</em></button>';
    }
    bar.innerHTML = html;
    var vid = $('storyVideo');
    if (vid) vid.onclick = function () {
      var player = $('homeVideo');
      if (player) {
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
        player.play().catch(function () {});
      }
    };
    bar.querySelectorAll('[data-day]').forEach(function (b) {
      b.onclick = function () { go('cal'); };
    });
  }

  function pauseWelcomeVideos() {
    ['landingVideo', 'homeVideo', 'appVideo'].forEach(function (id) {
      var el = $(id);
      if (el && !el.paused) el.pause();
    });
  }

  function isIOSPhone() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function isStandaloneApp() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  }

  function promptInstall() {
    if (deferredInstall) { deferredInstall.prompt(); return; }
    if (isIOSPhone()) {
      alert('iPhone: toca Compartir (el cuadrado con flecha) → Añadir a pantalla de inicio. Luego abre Erior Center desde el icono.');
      return;
    }
    alert('Android: menú ⋮ → Instalar app / Añadir a pantalla de inicio. Luego abre Erior Center desde el icono, no desde Chrome.');
  }

  function remindHint() {
    if (isIOSPhone() && !isStandaloneApp()) {
      return 'En iPhone los avisos solo funcionan si instalas. Compartir → Añadir a pantalla de inicio. Abre el icono y toca de nuevo.';
    }
    if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
      if (isIOSPhone()) return 'El iPhone bloqueó los avisos. Ajustes → Notificaciones → Erior Center → Permitir. Luego toca de nuevo.';
      return 'El celular bloqueó los avisos. Chrome → ⋮ → Ajustes → Notificaciones del sitio → eriorcenterguiaaudios → Permitir. O el candado de la barra. Luego toca de nuevo.';
    }
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') return '';
    return 'Toca el botón. Acepta el permiso. En celular, instala primero para que se sienta como app.';
  }

  function renderInstallAndRemind(s) {
    var card = $('installCard');
    if (card) {
      if (isStandaloneApp()) {
        card.classList.add('hidden');
        card.setAttribute('hidden', '');
      } else {
        card.classList.remove('hidden');
        card.removeAttribute('hidden');
      }
    }
    if ($('btnRemind') && s && s.remindOn && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      $('btnRemind').textContent = 'On';
    }
    if ($('remindMsg') && !(s && s.remindOn && typeof Notification !== 'undefined' && Notification.permission === 'granted')) {
      $('remindMsg').textContent = remindHint();
    }
  }

  function maybeWelcome(s) {
    var box = $('welcomeGate');
    if (!box) return;
    try {
      if (sessionStorage.getItem('p28-intro') === '1') return;
    } catch (e) {
      if (s && s.welcomed) return;
    }
    document.body.classList.add('is-welcome');
    box.classList.remove('hidden');
    box.removeAttribute('hidden');
  }

  function build(fromData, vision) {
    var s0 = load();
    if (!s0.access) {
      if ($('formErr')) $('formErr').textContent = 'Primero entra con tu código.';
      if ($('visionErr')) $('visionErr').textContent = 'Primero entra con tu código.';
      $('gate').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    var data = fromData || collect();
    var err = validate(data);
    if (err) {
      if ($('formErr')) $('formErr').textContent = err;
      if ($('visionErr')) $('visionErr').textContent = err;
      return;
    }
    if ($('formErr')) $('formErr').textContent = '';
    data.serial = s0.data && s0.data.serial ? s0.data.serial : serial(data.name);
    var rec = recommend(data);
    var state = patch(function (st) {
      st.data = data;
      st.rec = rec;
      if (vision) st.vision = vision;
      st.days = st.days || {};
      st.checks = st.checks || {};
      st.pack = (st.access && st.access.pack) || st.pack || 1;
      st.start = st.start || new Date().toISOString();
      st.remindAt = st.remindAt || '21:00';
    });
    applyMode(state);
    pingErior('P28 FICHA: ' + firstName(data.name) + ' · ' + areaLabel(data.area) + ' · pack ' + state.pack + ' · ' + data.serial);
  }

  function go(name) {
    document.querySelectorAll('.view').forEach(function (v) {
      var on = v.getAttribute('data-view') === name;
      v.classList.toggle('on', on);
    });
    document.querySelectorAll('.app-dock button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-go') === name);
    });
    patch(function (s) { s.view = name; });
    if (name !== 'hoy') {
      var homeVid = $('homeVideo');
      if (homeVid && !homeVid.paused) homeVid.pause();
    }
    if (name === 'com') renderWall();
    if (name === 'hoy') renderStories(load());
    if (name === 'audios') renderListenPlan(load());
    if (name === 'vision' && window.P28Vision) P28Vision.renderApp(load());
    if (window.P28Vault) P28Vault.render(load());
  }

  function toggleCheck(key) {
    var before = load();
    var n = currentDay(before);
    var was = !!(before.days && before.days[n]);
    var state = patch(function (st) {
      st.checks = st.checks || {};
      st.checks[n] = st.checks[n] || {};
      st.checks[n][key] = !st.checks[n][key];
      st.days = st.days || {};
      if (st.checks[n].night && st.checks[n].day && st.checks[n].mission) {
        st.days[n] = true;
      } else {
        st.days[n] = false;
      }
    });
    renderDays($('dayGridApp'), state.days || {});
    if (window.P28Vault) {
      P28Vault.renderProgress(state);
      if (!was && state.days && state.days[n]) P28Vault.onSeal(n, state);
    }
  }

  function sendTesti() {
    var text = ($('testi').value || '').trim();
    if (text.length < 12) { $('testiMsg').textContent = 'Escribe un poco más. Honesto cuenta.'; return; }
    var s = load();
    if (!s.access) { $('testiMsg').textContent = 'Entra con tu código para publicar.'; return; }
    var who = firstName((s.data && s.data.name) || (s.access && s.access.name) || 'Alumna');
    var item = { who: who, txt: text, day: currentDay(s) };
    $('testiMsg').textContent = 'Publicando…';
    (window.P28Access ? P28Access.postWall(who, text, item.day) : Promise.resolve(false)).then(function (ok) {
      pingErior('MURO P28 · ' + who + ' · día ' + item.day + '\n' + text);
      $('testi').value = '';
      $('testiMsg').textContent = ok ? 'Publicado. Todas lo ven. Solo tu nombre.' : 'No se pudo subir. Intenta de nuevo.';
      renderWall();
    });
  }

  function showNativeNotif(title, body, tag) {
    var opts = { body: body, icon: 'icon-192.png', badge: 'icon-192.png', tag: tag || 'p28-daily', renotify: true };
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(function (reg) {
        if (reg.showNotification) return reg.showNotification(title, opts);
        if (reg.active) reg.active.postMessage({ type: 'notify', title: title, body: body, tag: tag || 'p28-daily' });
      }).catch(function () {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(title, opts);
        }
      });
      return;
    }
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, opts);
    }
  }

  function urlB64ToUint8(b64) {
    var pad = '='.repeat((4 - (b64.length % 4)) % 4);
    var raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function subscribePhone(hour, sendTest) {
    var s = load();
    if (!navigator.serviceWorker || !window.P28Access) return Promise.resolve();
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return Promise.resolve();
    return P28Access.vapidPublic().then(function (pub) {
      if (!pub) throw new Error('Falta la llave de avisos.');
      return navigator.serviceWorker.ready.then(function (reg) {
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8(pub)
        });
      }).then(function (sub) {
        var json = sub.toJSON();
        return P28Access.subscribePush(json, s.access && s.access.code, hour || s.remindAt || '21:00').then(function () {
          if (!sendTest || !P28Access.pushTest) return { ok: true };
          return P28Access.pushTest(json);
        });
      });
    });
  }

  function activateReminders(demo) {
    var hour = ($('remindAt') && $('remindAt').value) || '21:00';
    if (isIOSPhone() && !isStandaloneApp()) {
      if ($('remindMsg')) $('remindMsg').textContent = remindHint();
      promptInstall();
      return;
    }
    if (!('Notification' in window)) {
      $('remindMsg').textContent = isIOSPhone()
        ? 'Instala primero (Añadir a pantalla de inicio) y abre el icono. Luego toca de nuevo.'
        : 'Este navegador no permite notificaciones.';
      return;
    }
    if (Notification.permission === 'denied') {
      if ($('remindMsg')) $('remindMsg').textContent = remindHint();
      return;
    }
    var s = patch(function (st) { st.remindAt = hour; st.remindOn = true; });
    if ($('remindMsg')) $('remindMsg').textContent = 'Pidiendo permiso…';
    Notification.requestPermission().then(function (p) {
      if (p !== 'granted') {
        $('remindMsg').textContent = remindHint();
        return;
      }
      $('remindMsg').textContent = 'On. Mandando aviso de prueba…';
      if ($('btnRemind')) $('btnRemind').textContent = 'On';
      showNativeNotif('Erior Center', 'Avisos encendidos. Este es el de prueba.', 'p28-test');
      if (demo) firePhrase(true, ['portal', 'listen', 'offer'][Math.floor(Math.random() * 3)]);
      subscribePhone(hour, true).then(function (res) {
        if (res && res.data && res.data.error) {
          $('remindMsg').textContent = 'On aquí. El aviso al celular falló: ' + res.data.error;
          return;
        }
        $('remindMsg').textContent = 'On. Ya te mandé uno de prueba. Van 4 al día: 08:08, 11:11, 16:16 y tu hora de noche.';
      }).catch(function (err) {
        $('remindMsg').textContent = 'On aquí. Si no llegó el aviso, instala la app y toca de nuevo. ' + ((err && err.message) || '');
      });
    });
  }

  function txtOwn(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function ownedNames(s) {
    var names = [];
    (s.library || []).forEach(function (t) { names.push(txtOwn(t.title)); });
    var rec = s.rec || {};
    ['primary', 'second', 'third'].forEach(function (k) {
      if (rec[k] && rec[k].name) names.push(txtOwn(rec[k].name));
    });
    return names;
  }

  function missingCatalog(s) {
    var have = ownedNames(s);
    return (window.P28_CATALOG || []).filter(function (c) {
      var n = txtOwn(c.name);
      var id = txtOwn(c.id);
      return !have.some(function (h) { return h.indexOf(n) !== -1 || h.indexOf(id) !== -1; });
    });
  }

  function pickListen() {
    var list = window.P28_LISTEN || [];
    if (!list.length) return { t: 'ERIOR', x: '¿Ya escuchaste tu audio hoy?' };
    return list[Math.floor(Math.random() * list.length)];
  }

  function pickOffer(s) {
    var miss = missingCatalog(s);
    if (!miss.length) return pickListen();
    var n = currentDay(s);
    return { t: miss[(n - 1) % miss.length].name, x: miss[(n - 1) % miss.length].pitch };
  }

  function pickNotif(kind, s, force) {
    if (kind === 'listen' || kind === 'night') return pickListen();
    if (kind === 'offer') return pickOffer(s);
    var n = currentDay(s);
    return phraseOfDay(n + (force ? Math.floor(Math.random() * 8) : 0));
  }

  function firePhrase(force, kind) {
    var s = load();
    if (!s.access) return;
    var p = pickNotif(kind || 'portal', s, force);
    showNativeNotif(p.t, p.x, force ? 'p28-demo' : ('p28-' + (kind || 'portal')));
    renderNotif(s);
  }

  function mexicoClock() {
    try {
      var hmParts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      var dateParts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit'
      }).formatToParts(new Date());
      var h = '00', m = '00', y = '1970', mo = '01', d = '01';
      hmParts.forEach(function (p) { if (p.type === 'hour') h = p.value; if (p.type === 'minute') m = p.value; });
      dateParts.forEach(function (p) {
        if (p.type === 'year') y = p.value;
        if (p.type === 'month') mo = p.value;
        if (p.type === 'day') d = p.value;
      });
      return { hm: h + ':' + m, date: y + '-' + mo + '-' + d };
    } catch (e) {
      var now = new Date();
      return {
        hm: ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2),
        date: now.toISOString().slice(0, 10)
      };
    }
  }

  function tryNotify() {
    var s = load();
    if (!s.remindOn || !s.access) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    var clock = mexicoClock();
    var night = s.remindAt || '21:00';
    var slots = { '08:08': 'listen', '11:11': 'portal', '16:16': 'offer' };
    slots[night] = slots[night] || 'night';
    var kind = slots[clock.hm];
    if (!kind) return;
    var key = clock.date + '-' + clock.hm;
    if (s.lastPing === key) return;
    patch(function (st) { st.lastPing = key; });
    firePhrase(false, kind);
  }

  function lockPurpose(s) {
    var locked = !!(s && s.purpose);
    if ($('purposeIn')) {
      $('purposeIn').disabled = locked;
      if (locked) $('purposeIn').value = s.purpose;
    }
    if ($('btnPurpose')) $('btnPurpose').classList.toggle('hidden', locked);
    if ($('purposeLockNote')) $('purposeLockNote').classList.toggle('hidden', !locked);
  }

  function doUnlock(code) {
    if (!window.P28Access) {
      $('gateErr').textContent = 'Recarga la página.';
      return;
    }
    $('gateErr').textContent = 'Revisando…';
    P28Access.unlock(code).then(function (access) {
      var state = patch(function (st) {
        st.access = access;
        st.pack = access.pack || st.pack || 1;
      });
      $('gateErr').textContent = '';
      applyMode(state);
    }).catch(function (err) {
      $('gateErr').textContent = err.message || 'Código no válido.';
    });
  }

  document.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'owned') $('ownedWrap').classList.toggle('hidden', val('owned') !== 'si');
  });

  $('btnWelcomeGo') && $('btnWelcomeGo').addEventListener('click', function () {
    patch(function (st) { st.welcomed = true; });
    try { sessionStorage.setItem('p28-intro', '1'); } catch (e) {}
    pauseWelcomeVideos();
    document.body.classList.remove('is-welcome');
    if ($('welcomeGate')) {
      $('welcomeGate').classList.add('hidden');
      $('welcomeGate').setAttribute('hidden', '');
    }
    go('hoy');
  });

  $('btnUnlock') && $('btnUnlock').addEventListener('click', function () {
    doUnlock($('accessCode').value);
  });
  $('accessCode') && $('accessCode').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doUnlock($('accessCode').value);
  });
  $('btnBuild') && $('btnBuild').addEventListener('click', build);
  $('btnEdit') && $('btnEdit').addEventListener('click', function () {
    document.body.classList.remove('is-app');
    document.body.classList.add('is-unlocked');
    if (window.P28Vision) P28Vision.start(load(), true);
    else if ($('intake')) $('intake').scrollIntoView({ behavior: 'smooth' });
  });
  $('btnPrint') && $('btnPrint').addEventListener('click', function () {
    $('dossier').classList.remove('hidden');
    $('dossier').removeAttribute('hidden');
    window.print();
  });
  $('btnTesti') && $('btnTesti').addEventListener('click', sendTesti);
  $('btnPurpose') && $('btnPurpose').addEventListener('click', function () {
    if (load().purpose) {
      if ($('purposeMsg')) $('purposeMsg').textContent = 'Ya está sellado. Es el propósito de tus 28 días.';
      lockPurpose(load());
      return;
    }
    var p = (($('purposeIn') && $('purposeIn').value) || '').trim();
    if (p.length < 8) {
      if ($('purposeMsg')) $('purposeMsg').textContent = 'Escribe el propósito de tus 28 días. Ejemplo: quiero manifestar mucho dinero.';
      return;
    }
    var state = patch(function (st) { st.purpose = p; });
    if ($('purposeMsg')) $('purposeMsg').textContent = 'Sellado. Una sola vez. El plan usa solo tus audios asignados.';
    lockPurpose(state);
    renderListenPlan(state);
    renderMission(state);
  });
  $('btnRemind') && $('btnRemind').addEventListener('click', function () { activateReminders(true); });
  $('btnInstallYo') && $('btnInstallYo').addEventListener('click', promptInstall);
  ['chkNight', 'chkDay', 'chkMission'].forEach(function (id) {
    $(id) && $(id).addEventListener('change', function () {
      toggleCheck(id === 'chkNight' ? 'night' : id === 'chkDay' ? 'day' : 'mission');
    });
  });
  document.querySelectorAll('.app-dock button').forEach(function (b) {
    b.addEventListener('click', function () { go(b.getAttribute('data-go')); });
  });
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredInstall = e;
  });
  $('btnInstall') && $('btnInstall').addEventListener('click', promptInstall);

  window.P28 = { currentDay: currentDay, go: go, load: load, renderListenPlan: renderListenPlan, build: build };

  function refreshThenApply(saved) {
    if (!saved.access || !saved.access.code || !window.P28Access) {
      applyMode(saved);
      return;
    }
    P28Access.unlock(saved.access.code).then(function (access) {
      var state = patch(function (st) {
        st.access = Object.assign({}, st.access || {}, access);
        delete st.access.expired;
        st.pack = access.pack || st.pack;
      });
      applyMode(state);
    }).catch(function (err) {
      var msg = (err && err.message) || '';
      if ((err && err.code === 'expired') || /30 días terminó|venc/i.test(msg)) {
        patch(function (st) {
          if (!st.access) return;
          st.access.expired = true;
          st.access.expires_at = st.access.expires_at || new Date(0).toISOString();
        });
        applyMode(load());
        return;
      }
      if ((err && err.code === 'devices') || /2 aparatos/i.test(msg)) {
        document.body.classList.add('is-lock');
        if ($('gateErr')) $('gateErr').textContent = msg;
        return;
      }
      applyMode(saved);
    });
  }

  function finishBoot() {
    document.body.classList.remove('is-boot');
    var params = new URLSearchParams(location.search);
    var q = params.get('acceso') || params.get('k');
    var saved = load();
    if (q) {
      if ($('accessCode')) $('accessCode').value = q;
      doUnlock(q);
    } else if (saved.access) {
      refreshThenApply(saved);
    } else {
      document.body.classList.add('is-lock');
    }
  }

  var bootDone = false;
  function endSplash() {
    if (bootDone) return;
    bootDone = true;
    finishBoot();
  }
  if ($('bootSplash')) {
    $('bootSplash').addEventListener('click', endSplash);
  }
  setTimeout(endSplash, 2200);
  setInterval(tryNotify, 30000);
  setInterval(paintTimer, 1000);
})();
