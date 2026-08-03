(function () {
  'use strict';

  var CATALOG = window.ERIOR_CATALOG || [];
  var WA = window.ERIOR_WHATSAPP || '5214432311761';

  /* Pregunta 2: se adapta al área elegida — aquí está la precisión */
  var FOCUS_BY_AREA = {
    amor: {
      title: 'En amor, ¿qué describe mejor tu situación?',
      subtitle: 'Esto define qué audio del catálogo te corresponde.',
      options: [
        { value: 'sp-volver', label: 'Quiero atraer o volver con alguien específico', ids: ['attraction', 'simulation-u', 'satori'], why: 'Bloqueos con persona específica' },
        { value: 'sp-obsesion', label: 'Estoy obsesionad@ / no puedo soltar a alguien', ids: ['satori', 'amor-propio-3', 'attraction'], why: 'Desapego + base de amor propio' },
        { value: 'pareja', label: 'Quiero mejorar mi relación actual', ids: ['erior-love', '11-11', 'curious'], why: 'Trabajo en el reflejo de pareja' },
        { value: 'nuevo', label: 'Quiero atraer una relación nueva sana', ids: ['attraction', 'amor-magic-2', '11-11'], why: 'Apertura + magnetismo limpio' },
        { value: 'corazon', label: 'Necesito sanar el corazón / miedo a amar', ids: ['curious', '11-11', 'amor-propio-3'], why: 'Sanación emocional profunda' },
      ],
    },
    dinero: {
      title: 'En abundancia, ¿qué necesitas más ahora?',
      subtitle: 'Cada opción apunta a un audio distinto del catálogo.',
      options: [
        { value: 'flujo', label: 'Más dinero / abrir el flujo económico', ids: ['money-tech', 'master-abundance', 'lucky'], why: 'Activación financiera directa' },
        { value: 'negocio', label: 'Negocio, clientes o crecimiento profesional', ids: ['master-abundance', 'money-tech', 'audio-you'], why: 'Estructura de negocio y abundancia' },
        { value: 'merecimiento', label: 'Sé que el bloqueo es de merecimiento', ids: ['money-tech', 'amor-propio-3', 'master-abundance'], why: 'Merecimiento + opulencia' },
        { value: 'suerte', label: 'Suerte, oportunidades o un golpe de fortuna', ids: ['lucky', 'money-tech', 'select'], why: 'Fortuna y apertura de puertas' },
        { value: 'personalizado', label: 'Quiero algo 100% a mi historia personal', ids: ['audio-you', 'audio-erior-3', 'master-abundance'], why: 'Audio ultra personalizado' },
      ],
    },
    autoestima: {
      title: 'En amor propio, ¿dónde está el nudo?',
      subtitle: 'Elegir bien aquí evita recomendaciones genéricas.',
      options: [
        { value: 'basico', label: 'Empezar a valorarme / glow up interno', ids: ['amor-magic-2', 'white-rabbit', 'mesmerizing'], why: 'Base de amor propio' },
        { value: 'codependencia', label: 'Codependencia o validación externa', ids: ['amor-propio-3', 'amor-propio-4', 'mesmerizing'], why: 'Cortar dependencia emocional' },
        { value: 'trauma', label: 'Trauma, dolor corporal o herida profunda', ids: ['amor-propio-4', 'vitamind', 'emergency-999'], why: 'Trabajo profundo de trauma' },
        { value: 'hombre', label: 'Soy hombre / energía masculina', ids: ['amor-propio-hombre', 'god-goddess', 'master-abundance'], why: 'Diseñado para energía masculina' },
        { value: 'presencia', label: 'Presencia, belleza o aura magnética', ids: ['eclat', 'icon-aura', 'mental-glow-up'], why: 'Imagen + presencia icónica' },
        { value: 'identidad', label: 'Reprogramar quién soy / autosabotaje', ids: ['identity', 'master-mind', 'god-goddess'], why: 'Identidad y mente' },
      ],
    },
    salud: {
      title: 'En salud y cuerpo, ¿qué buscas?',
      subtitle: 'Separar salud mental, física e imagen mejora el match.',
      options: [
        { value: 'fisica', label: 'Salud física, inmunidad o recuperación', ids: ['vitamind', 'fit-wave', 'keep-cool'], why: 'Salud física e inmunidad' },
        { value: 'mental', label: 'Ansiedad, depresión o agotamiento mental', ids: ['vitamind', 'keep-cool', 'wonderland'], why: 'Sistema nervioso y salud mental' },
        { value: 'cuerpo', label: 'Peso, forma física o biokinesis', ids: ['fit-wave', 'eclat', 'vitamind'], why: 'Cuerpo y rendimiento' },
        { value: 'trauma-cuerpo', label: 'Trauma o rechazo hacia mi cuerpo', ids: ['amor-propio-4', 'fit-wave', 'eclat'], why: 'Trauma corporal + amor propio' },
      ],
    },
    manifestacion: {
      title: 'En manifestación, ¿qué necesitas?',
      subtitle: 'No todos los audios de manifestación hacen lo mismo.',
      options: [
        { value: 'bloqueos', label: 'Estoy bloquead@ / necesito reiniciar', ids: ['booster', 'wonderland', 'satori'], why: 'Reinicio y neutralidad' },
        { value: 'calma', label: 'Calma mental para poder manifestar', ids: ['keep-cool', 'wonderland', 'booster'], why: 'Calma y coherencia' },
        { value: 'elegir', label: 'Elegir y sostener una realidad concreta', ids: ['select', 'simulation-u', 'audio-erior-3'], why: 'Elección consciente de realidad' },
        { value: 'futuro', label: 'Ver / conectar con mi versión futura', ids: ['simulation-u', 'select', 'identity'], why: 'YO futuro y visualización' },
        { value: 'script', label: 'Un script profundo personalizado', ids: ['audio-erior-3', 'audio-you', 'white-rabbit'], why: 'Personalización profunda' },
        { value: 'crisis', label: 'Situación compleja o urgente', ids: ['emergency-999', 'booster', 'amor-propio-4'], why: 'Protocolo de emergencia' },
      ],
    },
  };

  var QUESTIONS_BASE = [
    {
      id: 'area',
      title: '¿Qué área de tu vida necesita atención ahora?',
      subtitle: 'Elige una. El resto del diagnóstico se adapta a ella.',
      options: [
        { value: 'amor', label: 'Amor y relaciones' },
        { value: 'dinero', label: 'Dinero y abundancia' },
        { value: 'autoestima', label: 'Amor propio y autoestima' },
        { value: 'salud', label: 'Salud y bienestar' },
        { value: 'manifestacion', label: 'Manifestación y propósito' },
      ],
    },
    { id: 'focus', dynamic: true },
    {
      id: 'bloque',
      title: '¿Qué te está frenando más?',
      subtitle: 'Esto afina si necesitas base, desbloqueo o un salto.',
      options: [
        { value: 'mente', label: 'Mente ruidosa, ansiedad o sobrepensar', ids: ['keep-cool', 'wonderland', 'booster'], w: 5 },
        { value: 'emocion', label: 'Emociones intensas o heridas abiertas', ids: ['amor-propio-4', 'satori', 'curious'], w: 5 },
        { value: 'accion', label: 'Sé qué quiero pero no actúo / me saboteo', ids: ['master-mind', 'select', 'identity'], w: 5 },
        { value: 'energia', label: 'Me siento sin energía o desconectado', ids: ['booster', 'vitamind', 'god-goddess'], w: 4 },
        { value: 'externo', label: 'Circunstancias externas o crisis concreta', ids: ['emergency-999', 'attraction', 'money-tech'], w: 5 },
      ],
    },
    {
      id: 'urgencia',
      title: '¿Qué tan urgente es tu situación?',
      subtitle: 'Define si te conviene un audio base o un protocolo intenso.',
      options: [
        { value: 'explorar', label: 'Quiero empezar con algo claro y estable', ids: ['amor-magic-2', 'keep-cool', 'booster'], w: 3 },
        { value: 'avanzar', label: 'Ya trabajo en mí y quiero resultados más fuertes', ids: ['select', 'amor-propio-3', 'master-abundance'], w: 3 },
        { value: 'urgente', label: 'Es urgente — necesito un cambio ya', ids: ['emergency-999', 'attraction', 'money-tech', 'amor-propio-4'], w: 7 },
      ],
    },
    {
      id: 'historia',
      title: 'Describe tu situación con tus palabras',
      subtitle: 'Mínimo 40 caracteres. Cuanto más específico seas, más preciso será el match.',
      type: 'text',
    },
  ];

  var KEYWORD_MAP = [
    { re: /\bex\b|crush|persona espec|sp\b|no me hace caso|ghost|ignor|volver con/i, ids: ['attraction', 'simulation-u', 'satori'], w: 8 },
    { re: /obsesi|no puedo soltar|lo pienso todo el d[ií]a|stalk/i, ids: ['satori', 'amor-propio-3', 'attraction'], w: 8 },
    { re: /pareja|relaci[oó]n actual|novi[oa]|espos[oa]|matrimonio|mejorar (mi )?relaci/i, ids: ['erior-love', '11-11', 'curious'], w: 7 },
    { re: /dinero|deuda|bancarro|pobre|rico|abund|finanz|cobrar|factura|sueldo/i, ids: ['money-tech', 'master-abundance', 'lucky'], w: 7 },
    { re: /negocio|clientes|empresa|emprend|ventas|trabajo|empleo|ascenso/i, ids: ['master-abundance', 'money-tech', 'audio-you'], w: 7 },
    { re: /amor propio|merec|validaci|no me valoro|insegur|autoestima/i, ids: ['amor-magic-2', 'amor-propio-3', 'amor-propio-4'], w: 6 },
    { re: /codepend/i, ids: ['amor-propio-3', 'amor-propio-4', 'satori'], w: 9 },
    { re: /\bhombre\b|masculin|viril|var[oó]n|soy hombre/i, ids: ['amor-propio-hombre', 'god-goddess'], w: 10 },
    { re: /trauma|dolor corporal|herida profunda|abus/i, ids: ['amor-propio-4', 'vitamind', 'emergency-999'], w: 8 },
    { re: /depres|ansiedad|p[aá]nico|ataque de/i, ids: ['vitamind', 'keep-cool', 'wonderland'], w: 7 },
    { re: /belleza|guap|piel|rejuven|glow up|presencia|aura/i, ids: ['eclat', 'icon-aura', 'mental-glow-up'], w: 6 },
    { re: /peso|adelgaz|gord|gimnasio|deporte|cuerpo/i, ids: ['fit-wave', 'eclat', 'vitamind'], w: 6 },
    { re: /urgente|crisis|desesper|no aguanto|emergencia|ya no puedo/i, ids: ['emergency-999', 'booster', 'amor-propio-4'], w: 9 },
    { re: /manifest|visualiz|crear realidad|elegir mi realidad/i, ids: ['select', 'simulation-u', 'audio-erior-3'], w: 5 },
    { re: /identidad|aut[eé]ntic|prop[oó]sito|quien soy|autosabot/i, ids: ['identity', 'master-mind', 'god-goddess'], w: 6 },
    { re: /salud|enferm|inmun|hospital|dolor f[ií]sic/i, ids: ['vitamind', 'fit-wave'], w: 7 },
    { re: /suerte|loter[ií]a|sorteo|oportunidad/i, ids: ['lucky', 'select', 'money-tech'], w: 7 },
    { re: /personalizad|a mi medida|mi historia/i, ids: ['audio-you', 'audio-erior-3', 'white-rabbit'], w: 6 },
  ];

  var state = {
    step: 0,
    answers: {},
    unlocked: [],
    reasons: {},
    primary: null,
    selected: [],
    insight: '',
  };

  var el = {
    progress: document.getElementById('progressBar'),
    progressLabel: document.getElementById('progressLabel'),
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
    primaryCard: document.getElementById('primaryCard'),
    catalogGrid: document.getElementById('catalogGrid'),
    btnWhatsApp: document.getElementById('btnWhatsApp'),
    selectedLabel: document.getElementById('selectedLabel'),
  };

  function byId(id) {
    return CATALOG.find(function (a) { return a.id === id; });
  }

  function getQuestion(step) {
    var q = QUESTIONS_BASE[step];
    if (!q) return null;
    if (q.dynamic && q.id === 'focus') {
      var area = state.answers.area || 'autoestima';
      var pack = FOCUS_BY_AREA[area] || FOCUS_BY_AREA.autoestima;
      return {
        id: 'focus',
        title: pack.title,
        subtitle: pack.subtitle,
        options: pack.options,
      };
    }
    return q;
  }

  function addScore(scores, id, points, reasons, reason) {
    if (scores[id] == null) return;
    scores[id] += points;
    if (reason && points >= 5) {
      if (!reasons[id]) reasons[id] = [];
      if (reasons[id].indexOf(reason) === -1) reasons[id].push(reason);
    }
  }

  function scoreRecommendations(answers) {
    var scores = {};
    var reasons = {};
    CATALOG.forEach(function (a) { scores[a.id] = 0; });

    /* Área: boost moderado solo a esa categoría (no diluye tanto) */
    if (answers.area) {
      CATALOG.forEach(function (a) {
        if (a.cat === answers.area) scores[a.id] += 3;
      });
    }

    /* Focus específico: peso alto — es la pregunta más precisa */
    var focusQ = getQuestion(1);
    if (focusQ && answers.focus) {
      var focusOpt = focusQ.options.find(function (o) { return o.value === answers.focus; });
      if (focusOpt && focusOpt.ids) {
        focusOpt.ids.forEach(function (id, i) {
          addScore(scores, id, 12 - i * 2, reasons, focusOpt.why || focusOpt.label);
        });
      }
    }

    /* Bloqueo */
    var bloqueQ = QUESTIONS_BASE[2];
    if (answers.bloque) {
      var bloqueOpt = bloqueQ.options.find(function (o) { return o.value === answers.bloque; });
      if (bloqueOpt && bloqueOpt.ids) {
        bloqueOpt.ids.forEach(function (id, i) {
          addScore(scores, id, (bloqueOpt.w || 4) - i, reasons, bloqueOpt.label);
        });
      }
    }

    /* Urgencia */
    var urgQ = QUESTIONS_BASE[3];
    if (answers.urgencia) {
      var urgOpt = urgQ.options.find(function (o) { return o.value === answers.urgencia; });
      if (urgOpt && urgOpt.ids) {
        urgOpt.ids.forEach(function (id, i) {
          addScore(scores, id, (urgOpt.w || 3) - i, reasons, urgOpt.label);
        });
      }
    }

    /* Historia libre — peso alto si hay match claro */
    var story = (answers.historia || '').toLowerCase();
    KEYWORD_MAP.forEach(function (rule) {
      if (rule.re.test(story)) {
        rule.ids.forEach(function (id, i) {
          addScore(scores, id, rule.w - i, reasons, 'Coincide con tu descripción');
        });
      }
    });

    /* Reglas duras (casi siempre correctas) */
    if (answers.focus === 'hombre' || /\bhombre\b|soy hombre|masculin/i.test(story)) {
      addScore(scores, 'amor-propio-hombre', 14, reasons, 'Diseñado para hombres');
    }
    if (answers.focus === 'sp-volver' || answers.focus === 'sp-obsesion') {
      addScore(scores, 'attraction', 6, reasons, 'Persona específica');
    }
    if (answers.urgencia === 'urgente' || answers.focus === 'crisis') {
      addScore(scores, 'emergency-999', 8, reasons, 'Situación urgente');
    }
    if (answers.focus === 'trauma' || answers.focus === 'trauma-cuerpo') {
      addScore(scores, 'amor-propio-4', 8, reasons, 'Trauma / herida profunda');
    }

    var ranked = CATALOG.map(function (a) {
      return { id: a.id, score: scores[a.id] || 0, cat: a.cat };
    }).sort(function (x, y) { return y.score - x.score; });

    /* Siempre 3: primero por score, luego relleno por área */
    var top = [];
    ranked.forEach(function (r) {
      if (top.length >= 3) return;
      if (r.score > 0) top.push(r.id);
    });

    var fallbacks = answers.area === 'amor' ? ['attraction', 'erior-love', 'amor-magic-2', 'satori']
      : answers.area === 'dinero' ? ['money-tech', 'master-abundance', 'lucky', 'audio-you']
      : answers.area === 'salud' ? ['vitamind', 'fit-wave', 'keep-cool', 'amor-propio-4']
      : answers.area === 'manifestacion' ? ['select', 'booster', 'keep-cool', 'simulation-u']
      : ['amor-magic-2', 'select', 'master-abundance', 'attraction'];

    fallbacks.forEach(function (id) {
      if (top.length >= 3) return;
      if (top.indexOf(id) === -1 && byId(id)) top.push(id);
    });

    /* Último recurso: siguientes del ranking aunque score = 0 */
    ranked.forEach(function (r) {
      if (top.length >= 3) return;
      if (top.indexOf(r.id) === -1) top.push(r.id);
    });

    return {
      scores: scores,
      reasons: reasons,
      primary: top[0] || null,
      top: top.slice(0, 3),
    };
  }

  function buildInsight(answers, primaryId, altIds) {
    var primary = byId(primaryId);
    var areaLabels = {
      amor: 'amor y relaciones',
      dinero: 'abundancia',
      autoestima: 'amor propio',
      salud: 'salud y bienestar',
      manifestacion: 'manifestación',
    };
    var area = areaLabels[answers.area] || 'tu proceso';
    var alts = altIds.map(function (id) {
      var a = byId(id);
      return a ? a.name : id;
    }).join(' y ');
    return 'Selección exclusiva en ' + area + '. Mejor ajuste: ' +
      (primary ? primary.name : 'tu recomendación') +
      '. También desbloqueamos: ' + alts + '. El resto del catálogo sigue cerrado.';
  }

  function reasonText(id, reasons) {
    var list = reasons[id] || [];
    if (!list.length) return 'Coincide con el perfil de tus respuestas.';
    return list.slice(0, 2).join(' · ');
  }

  function showScreen(name) {
    ['screenIntro', 'screenQuiz', 'screenScan', 'screenResults'].forEach(function (id) {
      var node = document.getElementById(id);
      if (!node) return;
      var active = id === name;
      node.hidden = !active;
      if (active) {
        node.style.display = '';
        node.style.opacity = '1';
        node.style.visibility = 'visible';
      }
    });
  }

  function updateProgress() {
    var total = QUESTIONS_BASE.length;
    var current = Math.min(state.step + 1, total);
    var pct = Math.round((current / total) * 100);
    if (el.progress) el.progress.style.width = pct + '%';
    if (el.progressLabel) el.progressLabel.textContent = 'Pregunta ' + current + ' de ' + total;
  }

  function renderQuestion() {
    var q = getQuestion(state.step);
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
          '<span class="opt-label">' + opt.label + '</span>' +
          '<span class="opt-ring"></span></button>'
        );
      }).join('');

      el.qOptions.querySelectorAll('.opt-card').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.answers[q.id] = btn.getAttribute('data-value');
          /* Si cambia el área, limpia focus anterior */
          if (q.id === 'area') delete state.answers.focus;
          el.qOptions.querySelectorAll('.opt-card').forEach(function (b) { b.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
          validateNext();
        });
      });
    }
    validateNext();
  }

  function validateNext() {
    var q = getQuestion(state.step);
    var ok = false;
    if (q.type === 'text') {
      ok = (state.answers.historia || '').trim().length >= 40;
    } else {
      ok = !!state.answers[q.id];
    }
    if (el.btnNext) {
      el.btnNext.disabled = !ok;
      el.btnNext.textContent = state.step === QUESTIONS_BASE.length - 1 ? 'Ver mi diagnóstico' : 'Continuar';
    }
  }

  function runScanAnimation(callback) {
    showScreen('screenScan');
    var lines = [
      'Analizando tus respuestas…',
      'Comparando con el catálogo…',
      'Definiendo el mejor ajuste…',
      'Preparando tu recomendación…',
    ];
    var i = 0;
    if (el.scanText) el.scanText.textContent = lines[0];
    var timer = setInterval(function () {
      i += 1;
      if (i >= lines.length) {
        clearInterval(timer);
        setTimeout(callback, 450);
        return;
      }
      if (el.scanText) el.scanText.textContent = lines[i];
    }, 600);
  }

  function isSelected(id) {
    return state.selected.indexOf(id) !== -1;
  }

  function resolveImg(src) {
    if (!src) return '';
    if (/^https?:\/\//i.test(src)) return src;
    /* Rutas relativas al folder del diagnóstico (funciona en Netlify y local) */
    if (src.indexOf('img/') === 0 || src.indexOf('./img/') === 0) {
      try {
        return new URL(src.replace(/^\.\//, ''), window.location.href).href;
      } catch (e) {
        return src;
      }
    }
    if (src.charAt(0) === '/') return src;
    if (src.indexOf('../img/') === 0) {
      try {
        return new URL(src, window.location.href).href;
      } catch (e2) {
        return src.replace(/^\.\.\//, '/');
      }
    }
    return src;
  }

  function cardHtml(a, unlocked, selected, isPrimary, reason) {
    var catLabel = (window.ERIOR_CAT_LABELS || {})[a.cat] || a.cat;
    var badge = isPrimary ? 'MEJOR AJUSTE' : 'ALTERNATIVA';
    var img = resolveImg(a.img);
    return (
      '<article class="audio-card' +
      (unlocked ? ' is-unlocked' : ' is-locked') +
      (selected ? ' is-selected' : '') +
      (isPrimary ? ' is-primary' : '') +
      '" data-id="' + a.id + '" tabindex="' + (unlocked ? '0' : '-1') + '">' +
      (unlocked
        ? '<div class="unlock-badge">' + badge + '</div>'
        : '<div class="lock-overlay"><span>Bloqueado</span><span class="lock-sub">Disponible con diagnóstico</span></div>') +
      '<div class="audio-thumb">' +
      '<img src="' + img + '" alt="' + a.name.replace(/"/g, '') + '" loading="lazy" decoding="async" width="480" height="220">' +
      '</div>' +
      '<div class="audio-body">' +
      '<span class="audio-cat">' + catLabel + '</span>' +
      '<h3 class="audio-name">' + a.name + '</h3>' +
      '<p class="audio-pitch">' + a.pitch + '</p>' +
      (unlocked && reason ? '<p class="audio-why">' + reason + '</p>' : '') +
      (unlocked
        ? '<button type="button" class="btn-pick">' +
          (selected ? 'Quitar selección' : 'Agregar a mi selección') + '</button>'
        : '') +
      '</div></article>'
    );
  }

  function renderResults() {
    var result = scoreRecommendations(state.answers);
    state.unlocked = result.top;
    state.reasons = result.reasons;
    state.primary = result.primary;
    state.selected = result.primary ? [result.primary] : [];
    state.insight = buildInsight(
      state.answers,
      result.primary,
      result.top.slice(1)
    );
    if (el.insightText) el.insightText.textContent = state.insight;

    var primary = byId(result.primary);
    if (el.primaryCard && primary) {
      el.primaryCard.innerHTML = cardHtml(
        primary,
        true,
        isSelected(primary.id),
        true,
        reasonText(primary.id, result.reasons)
      );
      el.primaryCard.querySelectorAll('.audio-card').forEach(bindCardClick);
    }

    if (!el.catalogGrid) return;
    var others = CATALOG.filter(function (a) { return a.id !== result.primary; });
    el.catalogGrid.innerHTML = others.map(function (a) {
      var unlocked = state.unlocked.indexOf(a.id) !== -1;
      return cardHtml(
        a,
        unlocked,
        isSelected(a.id),
        false,
        unlocked ? reasonText(a.id, result.reasons) : ''
      );
    }).join('');

    el.catalogGrid.querySelectorAll('.audio-card.is-unlocked').forEach(bindCardClick);

    updateSelectedLabel();
    updateWhatsAppButton();
    showScreen('screenResults');
  }

  function bindCardClick(card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.btn-pick') || e.currentTarget === card) {
        selectAudio(card.getAttribute('data-id'));
      }
    });
  }

  function selectAudio(id) {
    if (state.unlocked.indexOf(id) === -1) return;
    var idx = state.selected.indexOf(id);
    if (idx === -1) {
      state.selected.push(id);
    } else {
      state.selected.splice(idx, 1);
    }

    document.querySelectorAll('.audio-card').forEach(function (card) {
      var cardId = card.getAttribute('data-id');
      var isSel = isSelected(cardId);
      card.classList.toggle('is-selected', isSel);
      var btn = card.querySelector('.btn-pick');
      if (btn) {
        btn.textContent = isSel ? 'Quitar selección' : 'Agregar a mi selección';
      }
    });

    updateSelectedLabel();
    updateWhatsAppButton();
  }

  function updateSelectedLabel() {
    if (!el.selectedLabel) return;
    if (!state.selected.length) {
      el.selectedLabel.textContent = 'Selecciona uno o más audios desbloqueados.';
      el.selectedLabel.hidden = false;
      return;
    }
    var names = state.selected.map(function (id) {
      var a = byId(id);
      return a ? a.name : id;
    });
    el.selectedLabel.textContent = state.selected.length === 1
      ? 'Selección: ' + names[0]
      : 'Selección (' + names.length + '): ' + names.join(' · ');
    el.selectedLabel.hidden = false;
  }

  function buildWhatsAppMessage() {
    if (!state.selected.length) return '';
    var names = state.selected.map(function (id) {
      var a = byId(id);
      return a ? a.name : id;
    });
    var story = (state.answers.historia || '').trim().slice(0, 400);
    var area = state.answers.area || '';
    var audioLine = names.length === 1
      ? 'Audio elegido: ' + names[0]
      : 'Audios elegidos (' + names.length + '):\n- ' + names.join('\n- ');
    var msg =
      'Hola Pauline, hice el Diagnóstico Erior y quiero cerrar.\n\n' +
      audioLine + '\n' +
      'Área: ' + area + '\n' +
      'Situación:\n"' + story + '"\n\n' +
      '¿Me orientas para elegir el audio ideal?';
    return encodeURIComponent(msg);
  }

  function updateWhatsAppButton() {
    if (!el.btnWhatsApp) return;
    if (state.selected.length) {
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
    var q = getQuestion(state.step);
    if (q.type === 'text') {
      state.answers.historia = (el.qText && el.qText.value || '').trim();
    }
    if (state.step < QUESTIONS_BASE.length - 1) {
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
    state.selected = [];
    state.unlocked = [];
    state.reasons = {};
    state.primary = null;
    showScreen('screenQuiz');
    renderQuestion();
  }
  window.__eriorStart = startQuiz;

  function bindUi() {
    var startBtn = document.getElementById('btnStart');
    if (startBtn) {
      startBtn.addEventListener('click', function (e) {
        e.preventDefault();
        startQuiz();
      });
    }
    if (el.btnNext) el.btnNext.addEventListener('click', nextStep);
    if (el.btnBack) el.btnBack.addEventListener('click', prevStep);
    if (el.qText) {
      el.qText.addEventListener('input', function () {
        state.answers.historia = el.qText.value.trim();
        validateNext();
      });
    }
    if (el.btnWhatsApp) {
      el.btnWhatsApp.addEventListener('click', function (e) {
        if (!state.selected.length) {
          e.preventDefault();
          if (el.selectedLabel) {
            el.selectedLabel.textContent = 'Selecciona al menos un audio desbloqueado antes de continuar.';
            el.selectedLabel.hidden = false;
          }
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindUi);
  } else {
    bindUi();
  }
})();
