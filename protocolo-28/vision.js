(function (w) {
  var HOMES = [
    { v: 'penthouse', t: 'Penthouse' },
    { v: 'playa', t: 'Casa en la playa' },
    { v: 'loft', t: 'Loft' },
    { v: 'cabana', t: 'Cabaña' },
    { v: 'grande', t: 'Casa grande' },
    { v: 'depto', t: 'Departamento' },
    { v: 'mia', t: 'La que yo elija' }
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
  var movieUrl = '';

  function $(id) { return document.getElementById(id); }
  function emptyDraft() {
    return {
      name: '', ig: '', phone: '', email: '', gender: 'otro', owned: 'no', ownedName: '',
      area: '', time: 'largo', urgency: 'ya', pain: '', wants: '',
      vision: { why: '', city: '', home: '', status: '', person: '', personKind: '', hasPerson: '', story: '', matters: [] }
    };
  }
  function firstName(raw) {
    return (w.P28Access && P28Access.firstName(raw)) || String(raw || '').trim().split(/\s+/)[0];
  }
  function load() {
    var key = (w.P28Access && P28Access.storeKey()) || 'erior-p28';
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { return {}; }
  }
  function isArea(v) { return draft.area === v; }

  function wantsPh() {
    return ({
      dinero: 'Ej. un negocio que cobra, casa propia, libertad de dinero.',
      amor: 'Ej. una relación estable, atraer a esa persona, dejar de perseguir.',
      propio: 'Ej. sentirme suficiente, dejar de pedirme permiso.',
      claridad: 'Ej. saber qué camino tomar y sostenerlo.',
      salud: 'Ej. energía de verdad, dormir bien, cuerpo que responde.',
      cuerpo: 'Ej. paz con mi cuerpo, moverme con gusto.',
      paz: 'Ej. no reaccionar a todo, calma en el día.'
    })[draft.area] || 'Lo que sí quieres. En 1 o 2 líneas.';
  }

  function steps() {
    var name = firstName(draft.name) || 'tú';
    return [
      { id: 'name', q: '¿Cómo te llamas?', kind: 'text', key: 'name', ph: 'Tu nombre' },
      { id: 'hi', q: 'Hola, ' + name + '.', sub: 'Solo te pregunto lo de tu reto. Según lo que elijas, cambian las siguientes.', kind: 'ok' },
      { id: 'area', q: '¿Cuál es la prioridad de tus 28 días?', sub: 'Elige una. Las siguientes preguntas son solo de eso.', kind: 'one', key: 'area', opts: AREAS },
      { id: 'wants', q: '¿Qué quieres instalar en eso?', sub: 'Esto se guarda para tus pasos de cada día.', kind: 'long', key: 'wants', ph: wantsPh() },
      { id: 'why', q: isArea('dinero') ? '¿Por qué el dinero es tan importante ahora?'
        : isArea('amor') ? '¿Por qué el amor es tan importante ahora?'
        : isArea('propio') ? '¿Qué quieres sentir de ti cuando terminen los 28 días?'
        : isArea('claridad') ? '¿Qué decisión o dirección necesitas sostener?'
        : isArea('salud') ? '¿Qué quieres recuperar en tu cuerpo o tu energía?'
        : isArea('cuerpo') ? '¿Cómo te quieres ver y sentir en tu cuerpo?'
        : isArea('paz') ? '¿Qué ruido quieres que deje de mandar tu día?'
        : '¿Por qué es tan importante para ti?', kind: 'long', key: 'vision.why', ph: 'Lo que sientas está bien.' },

      { id: 'city', q: 'Cuando ya tienes el dinero, ¿en qué ciudad te ves?', skip: function () { return !isArea('dinero'); }, kind: 'text', key: 'city', ph: 'CDMX, Nueva York, la que sea tuya…' },
      { id: 'home', q: '¿En qué tipo de casa te ves?', skip: function () { return !isArea('dinero'); }, kind: 'one', key: 'vision.home', opts: HOMES },

      { id: 'status', q: '¿Cómo está tu vida amorosa hoy?', skip: function () { return !isArea('amor'); }, kind: 'one', key: 'vision.status', opts: [
        { v: 'soltera', t: 'Soltera / soltero' }, { v: 'relacion', t: 'En una relación' },
        { v: 'casada', t: 'Casada / casado' }, { v: 'complicado', t: 'Es complicado' }
      ] },
      { id: 'personQ', q: '¿Hay alguien específico en lo que estás instalando?', skip: function () { return !isArea('amor'); }, kind: 'one', key: 'vision.hasPerson', opts: [
        { v: 'si', t: 'Sí' }, { v: 'no', t: 'No' }
      ] },
      { id: 'person', q: '¿Cómo se llama?', skip: function () { return !isArea('amor') || draft.vision.hasPerson !== 'si'; }, kind: 'text', key: 'vision.person', ph: 'Nombre' },
      { id: 'partner', q: name + ', ¿qué tipo de pareja quieres atraer?', skip: function () { return !isArea('amor'); }, kind: 'text', key: 'vision.personKind', ph: 'Cómo es. Cómo te hace sentir.' },

      { id: 'pain', q: isArea('dinero') ? '¿Qué te frena con el dinero ahora?'
        : isArea('amor') ? '¿Qué te frena en el amor ahora?'
        : isArea('propio') ? '¿Qué te frena para sostenerte tú?'
        : isArea('claridad') ? '¿Qué te nubla o te saca del foco?'
        : isArea('salud') ? '¿Qué te está drenando la energía?'
        : isArea('cuerpo') ? '¿Qué historia te cuentas de tu cuerpo?'
        : isArea('paz') ? '¿Qué te saca de la calma una y otra vez?'
        : '¿Qué te está frenando ahora?', kind: 'long', key: 'pain', ph: 'Sé honesta. 1 o 2 líneas.' },
      { id: 'time', q: '¿Esto lleva tiempo o es puntual?', kind: 'one', key: 'time', opts: [
        { v: 'largo', t: 'Meses / años' }, { v: 'reciente', t: 'Pasó algo reciente' }, { v: 'ya', t: 'Lo necesito resolver ya' }
      ] },
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

  function showPane(id) {
    ['visionAsk', 'visionWait'].forEach(function (k) {
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
    body.onclick = null;
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
    } else if (s.kind === 'contact') {
      body.innerHTML =
        '<label>Instagram</label><input id="vIg" type="text" placeholder="@tuusuario" value="' + (draft.ig || '') + '">' +
        '<label>WhatsApp</label><input id="vPhone" type="tel" placeholder="52 1 443 231 1761" value="' + (draft.phone || '') + '">' +
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
    if ($('btnVisionGo')) $('btnVisionGo').textContent = s.kind === 'ok' ? 'Continuar' : (step === list.length - 1 ? 'Guardar y entrar' : 'Continuar');
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
    if (s.id === 'area' && !draft.area) return 'Elige tu prioridad. Las siguientes preguntas salen de esa.';
    if (s.id === 'wants' && (!draft.wants || draft.wants.length < 8)) return 'Cuéntalo un poco más. Eso se guarda para tus días.';
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
    if (step <= 0) return;
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
    }, 700);
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
    step = 0;
    showPane('visionAsk');
    renderStep();
  }

  function dayIndex(s) {
    var n = (w.P28 && P28.currentDay) ? P28.currentDay(s) : 1;
    return Math.max(1, n);
  }
  function pickLine(list, n, fallback) {
    if (!list || !list.length) return fallback;
    return list[(n - 1) % list.length] || fallback;
  }
  function dailyQuote(s) {
    s = s || load();
    var n = dayIndex(s);
    var list = w.P28_PHRASES || [];
    var p = list[(n - 1) % Math.max(1, list.length)];
    return (p && p.x) || 'Hoy no se evalúa. Hoy se instala.';
  }
  function dailyAffirm(s) {
    s = s || load();
    return pickLine(w.P28_AFFIRMS, dayIndex(s), 'Yo soy muy magnetic@.');
  }

  function paintQuote(el, s, n) {
    if (!el) return;
    el.innerHTML =
      '<span class="num">Quote del día</span>' +
      '<p class="affirm-txt">' + dailyQuote(s) + '</p>' +
      '<p class="note">Un mensaje. Mañana es otro.</p>';
  }

  function paintIamCard(el, s, n, teaser) {
    if (!el) return;
    el.innerHTML =
      '<span class="num">Afirmación · día ' + n + ' de 28</span>' +
      '<div class="iam-txt">' + dailyAffirm(s) + '</div>' +
      '<p class="note">' + (teaser
        ? 'Toca. Hoy es esta. Mañana cambia sola.'
        : 'Léela en voz alta. Hoy es esta. Mañana cambia sola. No se elige.') + '</p>';
  }

  function paintAffirmList(el, s, n) {
    if (!el) return;
    var list = w.P28_AFFIRMS || [];
    var said = '';
    if (n > 1) {
      said = '<div class="affirm-said">' + list.slice(0, n - 1).map(function (line, i) {
        return '<p><b>' + (i + 1) + '</b> ' + line + '</p>';
      }).join('') + '</div>';
    }
    el.innerHTML =
      '<span class="num">Los 28 días</span>' +
      '<p class="note">Hoy se ve. Las que ya pasaron se quedan aquí. Las de adelante aparecen solas.</p>' +
      '<div class="affirm-strip">' + list.map(function (_, i) {
        var d = i + 1;
        var cls = 'affirm-chip' + (d === n ? ' now' : (d < n ? ' past' : ''));
        return '<span class="' + cls + '">' + d + '</span>';
      }).join('') + '</div>' + said;
  }

  function waMind() {
    return 'https://wa.me/5214432311761?text=' + encodeURIComponent('Hola, quiero mi Mind Movie.');
  }

  function renderMindMovie(s) {
    var box = $('mindMovieBox');
    if (!box) return;
    box.innerHTML =
      '<span class="num">Tu Mind Movie</span>' +
      '<div id="mmPlayerWrap"></div>' +
      '<input id="mmFile" type="file" accept="video/*" hidden>' +
      '<button type="button" class="btn btn-gold btn-full" id="btnMmPick" style="margin-top:1rem">Subir o cambiar video</button>' +
      '<p class="note" id="mmMsg">' + (s.mindMovie ? 'Ya está en tu perfil. Queda en este aparato, atado a tu código.' : 'Sube el video que te armó Erior. Una sola película.') + '</p>';
    var want = $('mmWantWrap');
    if (want) {
      if (s.mindMovie) {
        want.innerHTML = '';
        want.hidden = true;
      } else {
        want.hidden = false;
        want.innerHTML = '<a class="btn btn-gold btn-full mm-want" href="' + waMind() + '" target="_blank" rel="noopener">Quiero mi Mind Movie</a>';
      }
    }
    if ($('btnMmPick')) $('btnMmPick').onclick = function () { $('mmFile') && $('mmFile').click(); };
    if ($('mmFile')) $('mmFile').onchange = function () {
      var f = this.files && this.files[0];
      if (!f || !w.P28Vault) return;
      if ($('mmMsg')) $('mmMsg').textContent = 'Guardando…';
      P28Vault.saveMindMovie(f).then(function () {
        renderApp(load());
      }).catch(function (err) {
        if ($('mmMsg')) $('mmMsg').textContent = err.message || 'No se pudo guardar.';
      });
    };
    if (w.P28Vault && P28Vault.getMindMovie) {
      P28Vault.getMindMovie().then(function (blob) {
        if (!blob) return;
        if (movieUrl) URL.revokeObjectURL(movieUrl);
        movieUrl = URL.createObjectURL(blob);
        var wrap = $('mmPlayerWrap');
        if (wrap) wrap.innerHTML = '<video id="mmVideo" controls playsinline src="' + movieUrl + '"></video>';
      });
    }
  }

  function renderApp(s) {
    s = s || load();
    var n = dayIndex(s);
    paintQuote($('homeAffirm'), s, n);
    paintIamCard($('homeIam'), s, n, true);
    paintIamCard($('affirmHero'), s, n, false);
    paintAffirmList($('affirmAll'), s, n);
    if ($('homeIam')) {
      $('homeIam').onclick = function () {
        if (w.P28 && P28.go) P28.go('afirma');
      };
    }
    renderMindMovie(s);
  }

  function bind() {
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

  w.P28Vision = { start: start, renderApp: renderApp, dailyAffirm: dailyAffirm, dailyQuote: dailyQuote };
})(window);
