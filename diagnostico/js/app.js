(function () {
  'use strict';

  var CATALOG = window.ERIOR_CATALOG || [];
  var WA = window.ERIOR_WHATSAPP || '5214432311761';

  var QUESTIONS = [
    {
      id: 'area',
      title: '¿Qué área de tu vida pide más atención ahora?',
      subtitle: 'El universo ya está escuchando tu respuesta…',
      options: [
        { value: 'amor', label: 'Amor y relaciones', emoji: '💖', boost: { amor: 4 } },
        { value: 'dinero', label: 'Dinero y abundancia', emoji: '💰', boost: { dinero: 4 } },
        { value: 'autoestima', label: 'Amor propio y autoestima', emoji: '✨', boost: { autoestima: 4 } },
        { value: 'salud', label: 'Salud y bienestar', emoji: '🌿', boost: { salud: 4 } },
        { value: 'manifestacion', label: 'Manifestación y propósito', emoji: '🌀', boost: { manifestacion: 4 } },
      ],
    },
    {
      id: 'momento',
      title: '¿Cómo describirías tu momento actual?',
      subtitle: 'No hay respuesta incorrecta — solo tu frecuencia hoy.',
      options: [
        { value: 'inicio', label: 'Recién despertando / empezando', emoji: '🌱', ids: ['amor-magic-2', 'keep-cool', 'booster'] },
        { value: 'atascado', label: 'Me siento atascad@ o con bloqueos', emoji: '😣', ids: ['booster', 'wonderland', 'satori', 'attraction'] },
        { value: 'salto', label: 'Ya avanzo pero quiero un salto grande', emoji: '🔥', ids: ['select', 'god-goddess', 'white-rabbit', 'audio-erior-3'] },
        { value: 'urgente', label: 'Situación urgente o muy intensa', emoji: '🆘', ids: ['emergency-999', 'amor-propio-4', 'vitamind'] },
      ],
    },
    {
      id: 'emocion',
      title: '¿Qué emoción domina más tu día a día?',
      subtitle: 'Tu campo energético deja huella en cada respuesta.',
      options: [
        { value: 'ansiedad', label: 'Ansiedad, miedo o urgencia', emoji: '😰', ids: ['keep-cool', 'wonderland', 'booster', 'vitamind'] },
        { value: 'merecimiento', label: 'Falta de merecimiento o validación', emoji: '🪞', ids: ['amor-magic-2', 'amor-propio-3', 'amor-propio-4', 'mesmerizing'] },
        { value: 'codependencia', label: 'Codependencia u obsesión con alguien', emoji: '💔', ids: ['amor-propio-3', 'amor-propio-4', 'attraction', 'erior-love'] },
        { value: 'escasez', label: 'Escasez o estrés financiero', emoji: '📉', ids: ['money-tech', 'master-abundance', 'lucky', 'amor-propio-3'] },
        { value: 'cuerpo', label: 'Cansancio, salud o imagen corporal', emoji: '🫠', ids: ['vitamind', 'fit-wave', 'eclat', 'amor-propio-4'] },
      ],
    },
    {
      id: 'enfoque',
      title: '¿Hay algo específico que quieras atraer o sanar?',
      subtitle: 'Elige lo que más resuene — puedes afinar después.',
      options: [
        { value: 'sp', label: 'Persona específica (SP / ex / crush)', emoji: '👤', ids: ['attraction', 'simulation-u', 'erior-love'] },
        { value: 'relacion', label: 'Mejorar relación existente', emoji: '💑', ids: ['erior-love', '11-11', 'curious'] },
        { value: 'hombre', label: 'Energía masculina / soy hombre', emoji: '🧑', ids: ['amor-propio-hombre', 'god-goddess', 'master-abundance'] },
        { value: 'glow', label: 'Belleza, presencia o glow up', emoji: '💎', ids: ['eclat', 'icon-aura', 'mental-glow-up', 'amor-magic-2'] },
        { value: 'identidad', label: 'Reprogramar mente o identidad', emoji: '🧠', ids: ['identity', 'master-mind', 'audio-erior-3', 'select'] },
      ],
    },
    {
      id: 'historia',
      title: 'Cuéntanos con tus palabras',
      subtitle: '¿Qué estás viviendo o qué quieres manifestar? (mínimo 15 caracteres)',
      type: 'text',
    },
  ];

  var KEYWORD_MAP = [
    { re: /ex\b|crush|persona espec|sp\b|no me hace caso|ghost|ignor/i, ids: ['attraction', 'simulation-u', 'satori'], w: 5 },
    { re: /pareja|relaci[oó]n|novi[oa]|espos[oa]|matrimonio/i, ids: ['erior-love', '11-11', 'attraction'], w: 4 },
    { re: /dinero|deuda|bancarro|pobre|rico|abund|finanz|negocio|trabajo|empleo/i, ids: ['money-tech', 'master-abundance', 'lucky', 'audio-you'], w: 5 },
    { re: /amor propio|merec|validaci|codepend|no me valoro|insegur/i, ids: ['amor-magic-2', 'amor-propio-3', 'amor-propio-4', 'white-rabbit'], w: 5 },
    { re: /hombre|masculin|viril|var[oó]n/i, ids: ['amor-propio-hombre', 'god-goddess'], w: 6 },
    { re: /trauma|dolor|herida|abus|depres|ansiedad|p[aá]nico/i, ids: ['amor-propio-4', 'vitamind', 'keep-cool', 'emergency-999'], w: 4 },
    { re: /belleza|guap|físic|cuerpo|adelgaz|gord|piel|rejuven/i, ids: ['eclat', 'fit-wave', 'icon-aura'], w: 4 },
    { re: /urgente|crisis|desesper|no aguanto|emergencia/i, ids: ['emergency-999', 'booster', 'amor-propio-4'], w: 6 },
    { re: /manifest|visualiz|crear realidad|atrac/i, ids: ['select', 'simulation-u', 'audio-erior-3', 'booster'], w: 3 },
    { re: /identidad|aut[eé]ntic|prop[oó]sito|quien soy/i, ids: ['identity', 'master-mind', 'god-goddess'], w: 4 },
    { re: /salud|enferm|inmun|virus|c[aá]ncer|hospital/i, ids: ['vitamind', 'fit-wave', 'emergency-999'], w: 5 },
  ];

  var state = {
    step: 0,
    answers: {},
    unlocked: [],
    selected: null,
    insight: '',
  };

  var el = {
    progress: document.getElementById('progressBar'),
    progressLabel: document.getElementById('progressLabel'),
    stage: document.getElementById('stage'),
    screenIntro: document.getElementById('screenIntro'),
    screenQuiz: document.getElementById('screenQuiz'),
    screenScan: document.getElementById('screenScan'),
    screenResults: document.getElementById('screenResults'),
    qTitle: document.getElementById('qTitle'),
    qSubtitle: document.getElementById('qSubtitle'),
    qOptions: document.getElementById('qOptions'),
    qTextWrap: document.getElementById('qTextWrap'),
    qText: document.getElementById('qText'),
    btnNext: document.getElementById('btnNext'),
    btnBack: document.getElementById('btnBack'),
    scanText: document.getElementById('scanText'),
    insightText: document.getElementById('insightText'),
    catalogGrid: document.getElementById('catalogGrid'),
    btnWhatsApp: document.getElementById('btnWhatsApp'),
    selectedLabel: document.getElementById('selectedLabel'),
  };

  function byId(id) {
    return CATALOG.find(function (a) { return a.id === id; });
  }

  function scoreRecommendations(answers) {
    var scores = {};
    CATALOG.forEach(function (a) { scores[a.id] = 0; });

    QUESTIONS.forEach(function (q, idx) {
      if (q.type === 'text') return;
      var val = answers[q.id];
      if (!val) return;
      var opt = q.options.find(function (o) { return o.value === val; });
      if (!opt) return;
      if (opt.boost) {
        Object.keys(opt.boost).forEach(function (cat) {
          CATALOG.forEach(function (a) {
            if (a.cat === cat) scores[a.id] += opt.boost[cat];
          });
        });
      }
      if (opt.ids) {
        opt.ids.forEach(function (id, i) {
          if (scores[id] != null) scores[id] += 6 - i;
        });
      }
    });

    var story = (answers.historia || '').toLowerCase();
    KEYWORD_MAP.forEach(function (rule) {
      if (rule.re.test(story)) {
        rule.ids.forEach(function (id) {
          if (scores[id] != null) scores[id] += rule.w;
        });
      }
    });

    if (/trauma|dolor corporal|herida/i.test(story)) scores['amor-propio-4'] = (scores['amor-propio-4'] || 0) + 4;
    if (answers.enfoque === 'hombre') scores['amor-propio-hombre'] = (scores['amor-propio-hombre'] || 0) + 8;
    if (answers.momento === 'urgente') scores['emergency-999'] = (scores['emergency-999'] || 0) + 6;

    var ranked = CATALOG.map(function (a) {
      return { id: a.id, score: scores[a.id] || 0 };
    }).sort(function (x, y) { return y.score - x.score; });

    var top = [];
    ranked.forEach(function (r) {
      if (top.length >= 3) return;
      if (r.score <= 0 && top.length === 0) return;
      top.push(r.id);
    });

    if (top.length < 3) {
      var fallbacks = ['amor-magic-2', 'select', 'master-abundance', 'attraction', 'booster'];
      fallbacks.forEach(function (id) {
        if (top.length >= 3) return;
        if (top.indexOf(id) === -1) top.push(id);
      });
    }

    return { scores: scores, top: top.slice(0, 3) };
  }

  function buildInsight(answers, topIds) {
    var names = topIds.map(function (id) {
      var a = byId(id);
      return a ? a.emoji + ' ' + a.name : id;
    });
    var areaLabels = { amor: 'el amor', dinero: 'la abundancia', autoestima: 'tu amor propio', salud: 'tu bienestar', manifestacion: 'tu poder de manifestar' };
    var area = areaLabels[answers.area] || 'tu transformación';
    return 'Tu diagnóstico cuántico detectó una alineación fuerte en ' + area + '. Desbloqueamos ' + topIds.length + ' frecuencias hechas para tu situación: ' + names.join(' · ') + '. El resto del catálogo Erior sigue disponible cuando estés list@ para expandir tu videojuego.';
  }

  function showScreen(name) {
    ['screenIntro', 'screenQuiz', 'screenScan', 'screenResults'].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.hidden = id !== name;
    });
  }

  function updateProgress() {
    var total = QUESTIONS.length;
    var current = Math.min(state.step + 1, total);
    var pct = Math.round((current / total) * 100);
    if (el.progress) el.progress.style.width = pct + '%';
    if (el.progressLabel) el.progressLabel.textContent = 'Pregunta ' + current + ' de ' + total;
  }

  function renderQuestion() {
    var q = QUESTIONS[state.step];
    if (!q) return;
    updateProgress();
    if (el.qTitle) el.qTitle.textContent = q.title;
    if (el.qSubtitle) el.qSubtitle.textContent = q.subtitle;

    if (q.type === 'text') {
      if (el.qOptions) el.qOptions.hidden = true;
      if (el.qTextWrap) el.qTextWrap.hidden = false;
      if (el.qText) {
        el.qText.value = state.answers.historia || '';
        el.qText.focus();
      }
      validateNext();
      return;
    }

    if (el.qOptions) el.qOptions.hidden = false;
    if (el.qTextWrap) el.qTextWrap.hidden = true;
    if (el.qOptions) {
      el.qOptions.innerHTML = q.options.map(function (opt) {
        var sel = state.answers[q.id] === opt.value ? ' is-selected' : '';
        return (
          '<button type="button" class="opt-card' + sel + '" data-value="' + opt.value + '">' +
          '<span class="opt-emoji">' + opt.emoji + '</span>' +
          '<span class="opt-label">' + opt.label + '</span>' +
          '<span class="opt-ring"></span></button>'
        );
      }).join('');

      el.qOptions.querySelectorAll('.opt-card').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.answers[q.id] = btn.getAttribute('data-value');
          el.qOptions.querySelectorAll('.opt-card').forEach(function (b) { b.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
          validateNext();
        });
      });
    }
    validateNext();
  }

  function validateNext() {
    var q = QUESTIONS[state.step];
    var ok = false;
    if (q.type === 'text') {
      ok = (state.answers.historia || '').trim().length >= 15;
    } else {
      ok = !!state.answers[q.id];
    }
    if (el.btnNext) {
      el.btnNext.disabled = !ok;
      el.btnNext.textContent = state.step === QUESTIONS.length - 1 ? 'Ver mi diagnóstico ✦' : 'Continuar →';
    }
  }

  function runScanAnimation(callback) {
    showScreen('screenScan');
    var lines = [
      'Escaneando tu campo energético…',
      'Cruzando respuestas con el catálogo Erior…',
      'Calculando frecuencias compatibles…',
      'Desbloqueando audios para tu situación…',
    ];
    var i = 0;
    if (el.scanText) el.scanText.textContent = lines[0];
    var timer = setInterval(function () {
      i += 1;
      if (i >= lines.length) {
        clearInterval(timer);
        setTimeout(callback, 600);
        return;
      }
      if (el.scanText) el.scanText.textContent = lines[i];
    }, 700);
  }

  function renderResults() {
    var result = scoreRecommendations(state.answers);
    state.unlocked = result.top;
    state.insight = buildInsight(state.answers, state.unlocked);
    if (el.insightText) el.insightText.textContent = state.insight;

    if (!el.catalogGrid) return;
    el.catalogGrid.innerHTML = CATALOG.map(function (a) {
      var unlocked = state.unlocked.indexOf(a.id) !== -1;
      var selected = state.selected === a.id;
      var catLabel = (window.ERIOR_CAT_LABELS || {})[a.cat] || a.cat;
      return (
        '<article class="audio-card' + (unlocked ? ' is-unlocked' : ' is-locked') + (selected ? ' is-selected' : '') + '" data-id="' + a.id + '" tabindex="' + (unlocked ? '0' : '-1') + '">' +
        (unlocked ? '<div class="unlock-badge">DESBLOQUEADO</div>' : '<div class="lock-overlay"><span class="lock-icon">🔒</span><span>Solo con diagnóstico</span></div>') +
        '<div class="audio-thumb" style="background-image:url(\'' + a.img + '\')"></div>' +
        '<div class="audio-body">' +
        '<span class="audio-cat">' + catLabel + '</span>' +
        '<h3 class="audio-name">' + a.emoji + ' ' + a.name + '</h3>' +
        '<p class="audio-pitch">' + a.pitch + '</p>' +
        (unlocked ? '<button type="button" class="btn-pick"' + (selected ? ' disabled' : '') + '>' + (selected ? '✓ Elegido' : 'Elegir este audio') + '</button>' : '') +
        '</div></article>'
      );
    }).join('');

    el.catalogGrid.querySelectorAll('.audio-card.is-unlocked').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.btn-pick') || e.target === card) {
          selectAudio(card.getAttribute('data-id'));
        }
      });
    });

    updateWhatsAppButton();
    showScreen('screenResults');
  }

  function selectAudio(id) {
    state.selected = id;
    el.catalogGrid.querySelectorAll('.audio-card').forEach(function (card) {
      var isSel = card.getAttribute('data-id') === id;
      card.classList.toggle('is-selected', isSel);
      var btn = card.querySelector('.btn-pick');
      if (btn) {
        btn.textContent = isSel ? '✓ Elegido' : 'Elegir este audio';
        btn.disabled = isSel;
      }
    });
    var a = byId(id);
    if (el.selectedLabel && a) {
      el.selectedLabel.textContent = 'Tu elección: ' + a.emoji + ' ' + a.name;
      el.selectedLabel.hidden = false;
    }
    updateWhatsAppButton();
  }

  function buildWhatsAppMessage() {
    var a = byId(state.selected);
    if (!a) return '';
    var story = (state.answers.historia || '').trim().slice(0, 400);
    var msg =
      'Hola Pauline! 💜 Hice el Diagnóstico Cuántico Erior y quiero cerrar mi audio.\n\n' +
      '🎧 Audio elegido: ' + a.name + '\n' +
      '📝 Lo que quiero manifestar/sanar:\n"' + story + '"\n\n' +
      '¿Me ayudas con la promo disponible? ✨';
    return encodeURIComponent(msg);
  }

  function updateWhatsAppButton() {
    if (!el.btnWhatsApp) return;
    if (state.selected) {
      el.btnWhatsApp.href = 'https://wa.me/' + WA + '?text=' + buildWhatsAppMessage();
      el.btnWhatsApp.classList.remove('is-disabled');
      el.btnWhatsApp.removeAttribute('aria-disabled');
    } else {
      el.btnWhatsApp.href = '#';
      el.btnWhatsApp.classList.add('is-disabled');
      el.btnWhatsApp.setAttribute('aria-disabled', 'true');
    }
  }

  function nextStep() {
    var q = QUESTIONS[state.step];
    if (q.type === 'text') {
      state.answers.historia = (el.qText && el.qText.value || '').trim();
    }
    if (state.step < QUESTIONS.length - 1) {
      state.step += 1;
      renderQuestion();
      return;
    }
    runScanAnimation(renderResults);
  }

  function prevStep() {
    if (state.step <= 0) {
      showScreen('screenIntro');
      return;
    }
    state.step -= 1;
    showScreen('screenQuiz');
    renderQuestion();
  }

  function startQuiz() {
    state.step = 0;
    state.answers = {};
    state.selected = null;
    state.unlocked = [];
    showScreen('screenQuiz');
    renderQuestion();
  }

  function initParticles() {
    var canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function mkParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.2 + 0.4,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        hue: [180, 290, 320, 45][Math.floor(Math.random() * 4)],
      };
    }

    resize();
    for (var i = 0; i < 90; i += 1) particles.push(mkParticle());
    window.addEventListener('resize', resize);

    function frame() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(' + p.hue + ',100%,65%,0.55)';
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    frame();
  }

  document.getElementById('btnStart') && document.getElementById('btnStart').addEventListener('click', startQuiz);
  el.btnNext && el.btnNext.addEventListener('click', nextStep);
  el.btnBack && el.btnBack.addEventListener('click', prevStep);
  el.qText && el.qText.addEventListener('input', function () {
    state.answers.historia = el.qText.value.trim();
    validateNext();
  });
  el.btnWhatsApp && el.btnWhatsApp.addEventListener('click', function (e) {
    if (!state.selected) {
      e.preventDefault();
      if (el.selectedLabel) {
        el.selectedLabel.textContent = '⚠️ Elige uno de tus audios desbloqueados antes de continuar';
        el.selectedLabel.hidden = false;
      }
    }
  });

  initParticles();
})();
