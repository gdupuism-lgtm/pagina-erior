(function (w) {
  var STICKERS = [
    { e: '🎧', t: 10, l: 6 }, { e: '💸', t: 14, l: 74 }, { e: '💋', t: 26, l: 14 },
    { e: '✈️', t: 18, l: 46 }, { e: '💍', t: 6, l: 34 }, { e: '🌙', t: 34, l: 80 },
    { e: '🦋', t: 56, l: 8 }, { e: '🏙️', t: 60, l: 72 }, { e: '☕', t: 46, l: 40 },
    { e: '🍒', t: 70, l: 24 }, { e: '🏔️', t: 76, l: 58 }, { e: '✉️', t: 8, l: 80 },
    { e: '⭐', t: 40, l: 8 }, { e: '🌹', t: 68, l: 78 }
  ];

  var HOMES = [
    { v: 'penthouse', t: 'Penthouse' },
    { v: 'playa', t: 'Casa en la playa' },
    { v: 'loft', t: 'Loft' },
    { v: 'cabana', t: 'Cabaña' },
    { v: 'grande', t: 'Casa grande' },
    { v: 'depto', t: 'Departamento' },
    { v: 'mia', t: 'La que yo elija' }
  ];

  var MATTERS = [
    { v: 'amor', t: 'Relaciones' }, { v: 'carrera', t: 'Carrera' },
    { v: 'dinero', t: 'Dinero' }, { v: 'salud', t: 'Salud' },
    { v: 'confianza', t: 'Confianza' }, { v: 'familia', t: 'Familia' },
    { v: 'viajes', t: 'Viajes' }, { v: 'paz', t: 'Paz' }
  ];

  var AREAS = [
    { v: 'dinero', t: 'Dinero / negocio' }, { v: 'amor', t: 'Amor / relaciones' },
    { v: 'propio', t: 'Amor propio' }, { v: 'claridad', t: 'Claridad / foco' },
    { v: 'salud', t: 'Salud / energía' }, { v: 'cuerpo', t: 'Cuerpo' },
    { v: 'paz', t: 'Paz / calma' }
  ];

  var step = 0;
  var draft = emptyDraft();
  var editing = false;
  var vizI = 0;

  function $(id) { return document.getElementById(id); }
  function emptyDraft() {
    return {
      name: '', ig: '', phone: '', email: '', gender: 'otro', owned: 'no', ownedName: '',
      area: '', time: 'largo', urgency: 'ya', pain: '', wants: '',
      vision: { why: '', city: '', home: '', status: '', person: '', personKind: '', story: '', matters: [] }
    };
  }
  function firstName(raw) {
    return (w.P28Access && P28Access.firstName(raw)) || String(raw || '').trim().split(/\s+/)[0];
  }
  function load() {
    try { return JSON.parse(localStorage.getItem('erior-p28') || '{}'); } catch (e) { return {}; }
  }

  function steps() {
    var name = firstName(draft.name) || 'tú';
    return [
      { id: 'name', q: '¿Cómo te llamas?', kind: 'text', key: 'name', ph: 'Tu nombre' },
      { id: 'hi', q: 'Gracias por entrar, ' + name + '.', sub: 'Ahora unas preguntas. Con eso armo tu ficha y tu visualización.', kind: 'ok' },
      { id: 'wants', q: '¿Qué es lo que más quieres ahora?', sub: 'Cuéntalo con detalle. Esto se vuelve tu frase.', kind: 'long', key: 'wants', ph: 'Sé específica. Lo que sí quieres.' },
      { id: 'free', q: 'No te contengas, ' + name + '.', sub: 'Pretende que sí se puede. Luego lo instalamos con audio.', kind: 'ok' },
      { id: 'why', q: '¿Por qué es tan importante para ti?', kind: 'long', key: 'vision.why', ph: 'Lo que sientas está bien.' },
      { id: 'area', q: '¿Cuál es tu prioridad ahora?', kind: 'one', key: 'area', opts: AREAS },
      { id: 'matters', q: '¿Qué más te late?', sub: 'Puedes marcar varias.', kind: 'multi', key: 'vision.matters', opts: MATTERS },
      { id: 'status', q: '¿Cómo está tu vida amorosa?', kind: 'one', key: 'vision.status', opts: [
        { v: 'soltera', t: 'Soltera / soltero' }, { v: 'relacion', t: 'En una relación' },
        { v: 'casada', t: 'Casada / casado' }, { v: 'complicado', t: 'Es complicado' }
      ] },
      { id: 'personQ', q: '¿Hay alguien específico en lo que estás instalando?', kind: 'one', key: 'vision.hasPerson', opts: [
        { v: 'si', t: 'Sí' }, { v: 'no', t: 'No' }
      ] },
      { id: 'person', q: '¿Cómo se llama?', skip: function () { return draft.vision.hasPerson !== 'si'; }, kind: 'text', key: 'vision.person', ph: 'Nombre' },
      { id: 'partner', q: name + ', ¿qué tipo de pareja quieres atraer?', skip: function () { return draft.area !== 'amor' && draft.vision.hasPerson !== 'si'; }, kind: 'text', key: 'vision.personKind', ph: 'Cómo es. Cómo te hace sentir.' },
      { id: 'city', q: 'Cuando imaginas tu vida, ¿en qué ciudad estás?', kind: 'text', key: 'city', ph: 'Nueva York, CDMX, Londres…' },
      { id: 'home', q: '¿En qué tipo de casa te ves?', kind: 'one', key: 'vision.home', opts: HOMES },
      { id: 'pain', q: '¿Qué te está frenando ahora?', kind: 'long', key: 'pain', ph: 'Sé honesta. 1 o 2 líneas.' },
      { id: 'time', q: '¿Esto lleva tiempo o es puntual?', kind: 'one', key: 'time', opts: [
        { v: 'largo', t: 'Meses / años' }, { v: 'reciente', t: 'Pasó algo reciente' }, { v: 'ya', t: 'Lo necesito resolver ya' }
      ] },
      { id: 'urgency', q: '¿Cuándo quieres empezar a ver cambios?', kind: 'one', key: 'urgency', opts: [
        { v: 'ya', t: 'Lo antes posible' }, { v: 'semana', t: 'Esta semana' }, { v: 'largo', t: 'Sin prisa' }
      ] },
      { id: 'about', q: 'Para entenderte de verdad, ' + name + ', ¿qué necesita saber Erior de ti?', kind: 'long', key: 'vision.story', ph: 'Lo que sientas que importa.' },
      { id: 'contact', q: 'Tus datos. Solo los ve Erior.', kind: 'contact' }
    ];
  }

  function getKey(path) {
    var p = String(path || '').split('.');
    if (p[0] === 'vision') return draft.vision[p[1]];
    if (path === 'city') return draft.vision.city;
    return draft[path];
  }
  function setKey(path, value) {
    var p = String(path || '').split('.');
    if (path === 'city') { draft.vision.city = value; return; }
    if (p[0] === 'vision') { draft.vision[p[1]] = value; return; }
    draft[path] = value;
  }

  function visibleSteps() {
    return steps().filter(function (s) { return !s.skip || !s.skip(); });
  }

  function paintStickers(id) {
    var box = $(id || 'stickerField');
    if (!box || box.getAttribute('data-ready') === '1') return;
    box.setAttribute('data-ready', '1');
    box.innerHTML = STICKERS.map(function (s, i) {
      return '<button type="button" class="sticker" data-i="' + i + '" style="top:' + s.t + '%;left:' + s.l + '%;animation-delay:' + (i * .18) + 's">' + s.e + '</button>';
    }).join('');
    box.onclick = function (e) {
      var b = e.target.closest && e.target.closest('.sticker');
      if (!b) return;
      e.stopPropagation();
      var x = ((Math.random() * 56) - 28).toFixed(0);
      var y = ((Math.random() * 56) - 28).toFixed(0);
      var r = ((Math.random() * 28) - 14).toFixed(0);
      b.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + r + 'deg) scale(1.18)';
      b.classList.add('nudge');
    };
  }

  function showPane(id) {
    ['stickerIntro', 'visionAsk', 'visionWait'].forEach(function (k) {
      if ($(k)) {
        $(k).classList.toggle('on', k === id);
        $(k).classList.toggle('hidden', k !== id);
      }
    });
  }

  function renderStep() {
    var list = visibleSteps();
    if (step < 0) step = 0;
    if (step >= list.length) {
      finish();
      return;
    }
    var s = list[step];
    var bar = $('visionBar');
    if (bar) bar.style.width = Math.round(((step + 1) / list.length) * 100) + '%';
    if ($('visionQ')) $('visionQ').textContent = s.q;
    if ($('visionSub')) {
      $('visionSub').textContent = s.sub || '';
      $('visionSub').classList.toggle('hidden', !s.sub);
    }
    var body = $('visionBody');
    if (!body) return;
    if (s.kind === 'ok') {
      body.innerHTML = '';
    } else if (s.kind === 'text' || s.kind === 'long') {
      var tag = s.kind === 'long' ? 'textarea' : 'input';
      body.innerHTML = '<' + tag + ' id="visionIn" ' + (s.kind === 'text' ? 'type="text"' : '') + ' placeholder="' + (s.ph || '') + '">' + (s.kind === 'long' ? '</textarea>' : '');
      var el = $('visionIn');
      if (el) {
        el.value = getKey(s.key) || '';
        setTimeout(function () { el.focus(); }, 80);
      }
    } else if (s.kind === 'one') {
      var cur = getKey(s.key);
      body.innerHTML = '<div class="vision-pills">' + s.opts.map(function (o) {
        return '<button type="button" class="vision-pill' + (cur === o.v ? ' on' : '') + '" data-v="' + o.v + '">' + o.t + '</button>';
      }).join('') + '</div>';
      body.onclick = function (e) {
        var b = e.target.closest && e.target.closest('[data-v]');
        if (!b) return;
        setKey(s.key, b.getAttribute('data-v'));
        body.querySelectorAll('.vision-pill').forEach(function (x) { x.classList.toggle('on', x === b); });
      };
    } else if (s.kind === 'multi') {
      var have = getKey(s.key) || [];
      body.innerHTML = '<div class="vision-pills wrap">' + s.opts.map(function (o) {
        return '<button type="button" class="vision-pill' + (have.indexOf(o.v) >= 0 ? ' on' : '') + '" data-v="' + o.v + '">' + o.t + '</button>';
      }).join('') + '</div>';
      body.onclick = function (e) {
        var b = e.target.closest && e.target.closest('[data-v]');
        if (!b) return;
        var v = b.getAttribute('data-v');
        var next = (getKey(s.key) || []).slice();
        var i = next.indexOf(v);
        if (i >= 0) next.splice(i, 1);
        else next.push(v);
        setKey(s.key, next);
        b.classList.toggle('on');
      };
    } else if (s.kind === 'contact') {
      body.innerHTML =
        '<label>Instagram</label><input id="vIg" type="text" placeholder="@tuusuario" value="' + (draft.ig || '') + '">' +
        '<label>WhatsApp</label><input id="vPhone" type="tel" placeholder="52 1 443 000 0000" value="' + (draft.phone || '') + '">' +
        '<label>Correo</label><input id="vEmail" type="email" placeholder="tucorreo@email.com" value="' + (draft.email || '') + '">' +
        '<p class="vision-mini">¿Cómo te identificas?</p>' +
        '<div class="vision-pills wrap" id="vGender">' +
          pill('gender', 'mujer', 'Mujer') + pill('gender', 'hombre', 'Hombre') + pill('gender', 'otro', 'Prefiero no decir') +
        '</div>' +
        '<p class="vision-mini">¿Ya tenías un audio Erior?</p>' +
        '<div class="vision-pills wrap" id="vOwned">' +
          pill('owned', 'no', 'No') + pill('owned', 'si', 'Sí') +
        '</div>' +
        '<div id="vOwnedWrap"' + (draft.owned === 'si' ? '' : ' class="hidden"') + '>' +
          '<label>¿Cuál?</label><input id="vOwnedName" type="text" placeholder="Ej. Booster 2.0" value="' + (draft.ownedName || '') + '">' +
        '</div>';
      bindContact();
    }
    if ($('visionErr')) $('visionErr').textContent = '';
    if ($('btnVisionGo')) $('btnVisionGo').textContent = s.kind === 'ok' ? 'Continuar' : (step === list.length - 1 ? 'Armar mi ficha' : 'Continuar');
  }

  function pill(key, v, t) {
    var on = draft[key] === v ? ' on' : '';
    return '<button type="button" class="vision-pill' + on + '" data-k="' + key + '" data-v="' + v + '">' + t + '</button>';
  }
  function bindContact() {
    var box = $('visionBody');
    if (!box) return;
    box.onclick = function (e) {
      var b = e.target.closest && e.target.closest('[data-k]');
      if (!b) return;
      var k = b.getAttribute('data-k');
      var v = b.getAttribute('data-v');
      draft[k] = v;
      var wrap = b.parentNode;
      wrap.querySelectorAll('.vision-pill').forEach(function (x) { x.classList.toggle('on', x === b); });
      if (k === 'owned' && $('vOwnedWrap')) $('vOwnedWrap').classList.toggle('hidden', v !== 'si');
    };
  }

  function readCurrent() {
    var list = visibleSteps();
    var s = list[step];
    if (!s) return '';
    if (s.kind === 'text' || s.kind === 'long') {
      var el = $('visionIn');
      setKey(s.key, el ? String(el.value || '').trim() : '');
    }
    if (s.kind === 'contact') {
      draft.ig = ($('vIg') && $('vIg').value || '').replace(/^@/, '').trim();
      draft.phone = ($('vPhone') && $('vPhone').value || '').trim();
      draft.email = ($('vEmail') && $('vEmail').value || '').trim();
      draft.ownedName = ($('vOwnedName') && $('vOwnedName').value || '').trim();
    }
    if (s.id === 'name' && (!draft.name || draft.name.length < 2)) return 'Escribe tu nombre.';
    if (s.id === 'wants' && (!draft.wants || draft.wants.length < 8)) return 'Cuéntalo un poco más. Eso se vuelve tu frase.';
    if (s.id === 'area' && !draft.area) return 'Elige tu prioridad.';
    if (s.id === 'pain' && (!draft.pain || draft.pain.length < 8)) return 'Cuéntanos qué te frena.';
    if (s.id === 'contact' && draft.owned === 'si' && !draft.ownedName) return 'Escribe el audio que ya tenías.';
    return '';
  }

  function next() {
    var err = readCurrent();
    if (err) { if ($('visionErr')) $('visionErr').textContent = err; return; }
    step += 1;
    renderStep();
  }
  function back() {
    if (step <= 0) {
      showPane('stickerIntro');
      return;
    }
    step -= 1;
    renderStep();
  }

  function finish() {
    showPane('visionWait');
    var data = {
      name: draft.name, ig: draft.ig, phone: draft.phone, email: draft.email,
      gender: draft.gender || 'otro', owned: draft.owned || 'no', ownedName: draft.ownedName,
      area: draft.area, time: draft.time || 'largo', urgency: draft.urgency || 'ya',
      pain: draft.pain, wants: draft.wants
    };
    var vision = draft.vision || {};
    setTimeout(function () {
      if (w.P28 && P28.build) P28.build(data, vision);
    }, 900);
  }

  function start(state, isEdit) {
    editing = !!isEdit;
    draft = emptyDraft();
    if (state && state.access && state.access.name) draft.name = state.access.name;
    if (state && state.data) {
      Object.keys(state.data).forEach(function (k) {
        if (k !== 'vision' && k !== 'serial') draft[k] = state.data[k];
      });
    }
    if (state && state.vision) draft.vision = Object.assign(draft.vision, state.vision);
    paintStickers('stickerField');
    paintStickers('bootStickers');
    if (editing) {
      step = 0;
      showPane('visionAsk');
      renderStep();
      return;
    }
    step = 0;
    showPane('stickerIntro');
  }

  function dailyAffirm(s) {
    s = s || load();
    var n = (w.P28 && P28.currentDay) ? P28.currentDay(s) : 1;
    var name = firstName((s.data && s.data.name) || (s.access && s.access.name) || '');
    var wants = (s.purpose || (s.data && s.data.wants) || 'lo que ya es mío').replace(/\s+/g, ' ');
    var city = s.vision && s.vision.city;
    var list = [
      'Merezco cada capa de la vida que estoy instalando. ' + (name ? name + ', ' : '') + 'esto ya es mío.',
      'Yo soy ' + (name || 'yo') + '. En estos 28 días instalo: ' + wants + '.',
      city ? 'Me veo en ' + city + ' como quien ya llegó. El audio sostiene esa coordenada.' : 'El yo que ya lo tiene no pregunta si es posible. Yo soy ese.',
      'No persigo. Irradio. Lo que es mío reconoce la señal.',
      'Hoy no se evalúa. Hoy se instala. ' + wants + '.'
    ];
    return list[(Math.max(1, n) - 1) % list.length];
  }

  function vizCards(s) {
    s = s || load();
    var name = firstName((s.data && s.data.name) || '');
    var v = s.vision || {};
    var wants = s.purpose || (s.data && s.data.wants) || 'esta vida';
    var area = (s.data && s.data.area) || '';
    var cards = [];
    cards.push({
      k: '01',
      t: 'Tu yo de después',
      x: (name ? name + '. ' : '') + 'Ya sostienes: ' + wants + '. No lo pides. Lo ocupas.',
      e: '✨'
    });
    if (v.city) cards.push({ k: '02', t: 'La ciudad', x: 'Te despiertas en ' + v.city + '. Eso ya no es fantasía. Es coordenada.', e: '🏙️' });
    if (v.home) {
      var home = (HOMES.filter(function (h) { return h.v === v.home; })[0] || {}).t || v.home;
      cards.push({ k: '03', t: 'Tu casa', x: 'Vives en: ' + home + '. Entras como quien paga y elige.', e: '🏡' });
    }
    if (v.person) cards.push({ k: '04', t: 'Esa persona', x: v.person + (v.personKind ? ' · ' + v.personKind : '') + '. La frecuencia es tuya. El resto se ordena.', e: '💗' });
    if (area === 'dinero') cards.push({ k: '05', t: 'Dinero en movimiento', x: 'El canal está abierto. Cobra, elige, no mendigas el timing.', e: '💸' });
    if (area === 'amor' || v.hasPerson === 'si') cards.push({ k: '06', t: 'Amor sin hueco', x: 'Atraes desde completud. Dejas de perseguir.', e: '🌹' });
    if (v.why) cards.push({ k: '07', t: 'Por qué importa', x: v.why, e: '🌙' });
    cards.push({
      k: '28',
      t: 'Día 28',
      x: 'Testimonio al muro. Solo tu nombre. El loop viejo ya no manda.',
      e: '28'
    });
    return cards;
  }

  function renderApp(s) {
    s = s || load();
    var aff = $('affirmCard');
    if (aff) {
      aff.innerHTML =
        '<span class="num">Afirmación de hoy</span>' +
        '<p class="affirm-txt">' + dailyAffirm(s) + '</p>' +
        '<p class="note">Una al día. Léela antes del audio de noche.</p>';
    }
    var cards = vizCards(s);
    if (vizI >= cards.length) vizI = 0;
    var c = cards[vizI] || cards[0];
    var deck = $('vizDeck');
    if (deck && c) {
      deck.innerHTML =
        '<span class="num">Visualización · ' + c.k + '</span>' +
        '<div class="viz-card" id="vizCard">' +
          '<span class="viz-emoji">' + c.e + '</span>' +
          '<h3>' + c.t + '</h3>' +
          '<p>' + c.x + '</p>' +
        '</div>' +
        '<div class="viz-nav">' +
          '<button type="button" class="btn btn-ghost" id="vizPrev">Anterior</button>' +
          '<button type="button" class="btn btn-gold" id="vizNext">Siguiente visión</button>' +
        '</div>' +
        '<p class="note">Desliza o toca. Son escenas hechas con lo que escribiste. Pon tu audio mientras las lees.</p>';
      if ($('vizNext')) $('vizNext').onclick = function () { vizI = (vizI + 1) % cards.length; renderApp(s); };
      if ($('vizPrev')) $('vizPrev').onclick = function () { vizI = (vizI - 1 + cards.length) % cards.length; renderApp(s); };
      bindSwipe($('vizCard'), function (dir) {
        vizI = (vizI + dir + cards.length) % cards.length;
        renderApp(s);
      });
    }
    var hoy = $('affirmHoy');
    if (hoy) {
      hoy.innerHTML =
        '<header class="post-head"><span class="avatar">A</span><div><b>Afirmación</b><small>Hoy</small></div></header>' +
        '<div class="post-body"><p class="copy">' + dailyAffirm(s) + '</p>' +
        '<button type="button" class="btn btn-ghost btn-full" id="btnGoVision" style="margin-top:.8rem">Ver visualización</button></div>';
      if ($('btnGoVision') && w.P28 && P28.go) $('btnGoVision').onclick = function () { P28.go('vision'); };
    }
  }

  function bindSwipe(el, fn) {
    if (!el) return;
    var x0 = 0;
    el.ontouchstart = function (e) { x0 = e.changedTouches[0].clientX; };
    el.ontouchend = function (e) {
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) fn(dx < 0 ? 1 : -1);
    };
  }

  function bind() {
    paintStickers('stickerField');
    paintStickers('bootStickers');
    if ($('btnStickerGo')) $('btnStickerGo').onclick = function () {
      step = 0;
      showPane('visionAsk');
      renderStep();
    };
    if ($('btnVisionGo')) $('btnVisionGo').onclick = next;
    if ($('btnVisionBack')) $('btnVisionBack').onclick = back;
    document.addEventListener('keydown', function (e) {
      if (!document.body.classList.contains('is-unlocked')) return;
      if (e.key === 'Enter' && $('visionAsk') && $('visionAsk').classList.contains('on')) {
        if (e.target && e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        next();
      }
    });
  }

  bind();

  w.P28Vision = { start: start, renderApp: renderApp, dailyAffirm: dailyAffirm };
})(window);
