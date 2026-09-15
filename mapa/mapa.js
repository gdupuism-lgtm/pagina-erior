(function () {
  'use strict';

  var LANG = (document.documentElement.lang || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';
  var WA = '5214432311761';
  var STORAGE_KEY = 'erior_mapa_v7';
  var GAME_VERSION = 7;
  var CREDIT_MXN = 444;
  var CREDIT_USD = 26;
  var UNLOCK_FN = '/.netlify/functions/mapa-unlock';
  var DIAGNOSE_FN = '/.netlify/functions/mapa-diagnose';

  var I18N = {
    es: {
      brand: 'Erior',
      langOther: 'EN',
      langHref: '/en/mapa/',
      homeHref: '/',
      reset: 'Reiniciar',
      kickerStart: 'Reporte del inconsciente',
      titleStart: 'La distancia no está en el deseo',
      leadStart:
        'Puedes querer expansión de forma consciente y, aun así, estar psicológicamente apegado a lo familiar de quien has sido. Este reporte no pregunta por qué no lo has manifestado. Pregunta qué problemas crearía realmente conseguirlo — y qué patrón lo sostiene.',
      startCta: 'Empezar mi reporte',
      footNote: 'Análisis gratuito parcial · archivo completo $444 MXN con clave tras pago verificado · crédito hacia frecuencias',
      qProgress: 'Pregunta',
      of: 'de',
      next: 'Continuar',
      diagnoseCta: 'Generar mi reporte',
      busy: 'Leyendo tu inconsciente…',
      miniTag: 'Revelación parcial',
      miniTitle: 'Esto es solo el borde del patrón',
      unlockTitle: 'Archivo completo · $444 MXN',
      unlockLead:
        'Lectura completa en voz Erior: el patrón, lo que tendrías que dejar atrás, el guión operativo y 3 frecuencias neuronales recomendadas para TI. Los $444 se descuentan si activas audio(s).',
      unlockCta: 'Continuar al pago ($444 MXN)',
      payTitle: 'Paga y recibe tu clave',
      payLead: 'Monto: $444 MXN. Pon tu código en el concepto. Envía comprobante. Pauline te manda la clave — sin clave no se abre el archivo.',
      paidCta: 'Ya pagué — avisar y pedir clave',
      keyLabel: 'Clave de acceso (te la envía Pauline)',
      keyPlaceholder: 'AB12CD34',
      keyCta: 'Abrir archivo con clave',
      keyWait:
        'Después de pagar, envía tu comprobante con el código MAPA-… Pauline verifica y te manda la clave de 8 caracteres.',
      keyHint: 'Usa exactamente la clave que Pauline te envíe para este código. No inventes una.',
      codeLabel: 'Tu código de pedido',
      copyCode: 'Copiar código',
      waPay: 'Pagar / avisar por WhatsApp',
      fullTag: 'Archivo completo',
      creditNote: 'Crédito activo: $444 MXN. Si activas frecuencia(s) ahora, solo pagas la diferencia.',
      upsellTitle: 'Instala la frecuencia neuronal',
      upsellLead: 'Estas 3 frecuencias recalibran el patrón detectado. Elige 1, 2 o 3 — el diagnóstico ya está pagado.',
      buy1: '1 audio · diferencia',
      buy2: '2 audios + libro · diferencia',
      buy3: '3 audios + Alicia Premium · diferencia',
      backHome: 'Volver al centro',
      copy: 'Copiar',
      copied: '¡Copiado!',
      scriptTag: 'Guión del inconsciente',
      protocolTag: 'Protocolo de recalibración',
      fromYou: 'Desde tus respuestas',
      patternTag: 'Patrón dominante',
      freqTag: 'Frecuencia sugerida',
      methods: [
        { id: 'oxxo', label: 'OXXO' },
        { id: 'transfer', label: 'Transferencia' },
        { id: 'paypal', label: 'PayPal' },
        { id: 'alt', label: 'Crypto / WU' }
      ],
      questions: [
        {
          kicker: '01 · El deseo',
          title: '¿Qué estás intentando crear?',
          lead: 'Riqueza. Éxito. Amor. Visibilidad. Un cuerpo. Un negocio. Sé concreto.',
          placeholder: 'Ej: Quiero generar mucho más dinero y que mi trabajo se vea…'
        },
        {
          kicker: '02 · La incomodidad',
          title: 'Imagina que llega mañana. ¿Qué se vuelve incómodo?',
          lead: 'Olvida lo que mejoraría. ¿Qué tendrías que confrontar? ¿Detrás de qué ya no podrías esconderte?',
          placeholder: 'Ej: Me incomodaría que mi familia… / Ser visto… / Tener que…'
        },
        {
          kicker: '03 · La identidad',
          title: '¿En quién tendrías que convertirte?',
          lead: '¿A quién podrías dejar atrás? ¿Qué dejaría de ser “normal” para ti?',
          placeholder: 'Ej: Tendría que convertirme en alguien que… y dejar de…'
        },
        {
          kicker: '04 · Lo que late',
          title: 'Escribe cómo te sientes ahora, sin filtro',
          lead: 'El loop que repites. Lo que no dices en voz alta. La resistencia debajo del deseo.',
          placeholder: 'Puedes quererlo con desesperación y, al mismo tiempo, te incomoda todo lo que tenerlo te exigiría…'
        }
      ]
    },
    en: {
      brand: 'Erior',
      langOther: 'ES',
      langHref: '/mapa/',
      homeHref: '/en/',
      reset: 'Restart',
      kickerStart: 'Unconscious report',
      titleStart: 'The distance isn’t in the desire',
      leadStart:
        'You can want expansion consciously and still be psychologically attached to the familiar self you’ve been. This report doesn’t ask why you haven’t manifested it. It asks what problems getting it would actually create — and which pattern holds that.',
      startCta: 'Start my report',
      footNote: 'Free partial analysis · full file $26 USD with verified payment key · credit toward frequencies',
      qProgress: 'Question',
      of: 'of',
      next: 'Continue',
      diagnoseCta: 'Generate my report',
      busy: 'Reading your unconscious…',
      miniTag: 'Partial reveal',
      miniTitle: 'This is only the edge of the pattern',
      unlockTitle: 'Full file · $26 USD',
      unlockLead:
        'Full Erior reading: the pattern, what you’d have to leave behind, the operative script, and 3 neural frequencies for YOU. The $26 is credited if you activate audio(s).',
      unlockCta: 'Continue to payment ($26 USD)',
      payTitle: 'Pay and get your key',
      payLead: 'Amount: $26 USD. Put your code in the memo. Send the receipt. Pauline sends the key — no key, no file.',
      paidCta: 'I paid — notify & request key',
      keyLabel: 'Access key (Pauline sends it)',
      keyPlaceholder: 'AB12CD34',
      keyCta: 'Open file with key',
      keyWait:
        'After you pay, send your receipt with the MAPA-… code. Pauline verifies and sends an 8-character key.',
      keyHint: 'Use exactly the key Pauline sends for this code. Don’t invent one.',
      codeLabel: 'Your order code',
      copyCode: 'Copy code',
      waPay: 'Pay / notify on WhatsApp',
      fullTag: 'Full file',
      creditNote: 'Active credit: $26 USD. If you activate frequenc(ies) now, you only pay the difference.',
      upsellTitle: 'Install the neural frequency',
      upsellLead: 'These 3 frequencies recalibrate the detected pattern. Choose 1, 2 or 3 — diagnosis already paid.',
      buy1: '1 audio · difference',
      buy2: '2 audios + book · difference',
      buy3: '3 audios + Alicia Premium · difference',
      backHome: 'Back to center',
      copy: 'Copy',
      copied: 'Copied!',
      scriptTag: 'Unconscious script',
      protocolTag: 'Recalibration protocol',
      fromYou: 'From your answers',
      patternTag: 'Dominant pattern',
      freqTag: 'Suggested frequency',
      methods: [
        { id: 'wire', label: 'ACH / Wire' },
        { id: 'paypal', label: 'PayPal' },
        { id: 'alt', label: 'Crypto / WU' }
      ],
      questions: [
        {
          kicker: '01 · Desire',
          title: 'What are you trying to create?',
          lead: 'Wealth. Success. Love. Visibility. A body. A business. Be concrete.',
          placeholder: 'e.g. I want to make significantly more money and be seen for my work…'
        },
        {
          kicker: '02 · Discomfort',
          title: 'Imagine it arrives tomorrow. What becomes uncomfortable?',
          lead: 'Forget what would improve. What would you have to confront? What couldn’t you hide behind?',
          placeholder: 'e.g. I’d be uncomfortable if my family… / Being seen… / Having to…'
        },
        {
          kicker: '03 · Identity',
          title: 'Who would you have to become?',
          lead: 'Who might you leave behind? What would stop feeling “normal”?',
          placeholder: 'e.g. I’d have to become someone who… and stop…'
        },
        {
          kicker: '04 · What pulses',
          title: 'Write how you feel right now, unfiltered',
          lead: 'The loop you repeat. What you won’t say out loud. The resistance under the desire.',
          placeholder: 'You can want it desperately and still be uncomfortable with everything having it would require…'
        }
      ]
    }
  };

  var t = I18N[LANG];

  var ARCH = {
    loop: {
      es: {
        name: 'Loop de Control',
        mini: 'Quieres el resultado, pero tu sistema exige previsibilidad antes de permitirte llegar.',
        script: '“Si yo no controlo, alguien más decide — y eso es peligroso.”',
        blocks: [
          { t: 'Seguridad = control', d: 'Relajas solo cuando todo está “bajo control”.' },
          { t: 'Amenaza de caos', d: 'La incertidumbre se lee como peligro, no como espacio.' },
          { t: 'Pensar para no sentir', d: 'Optimizas para no cruzar el umbral emocional.' },
          { t: 'Posponer operativo', d: 'Esperas el momento perfecto que nunca llega.' }
        ],
        protocol: '7 días · Protocolo Control Off: una micro-decisión diaria sin optimizarla. Observa la señal de ansiedad sin ejecutarla.'
      },
      en: {
        name: 'Control Loop',
        mini: 'You want the outcome, but your system demands predictability before allowing arrival.',
        script: '“If I don’t control it, someone else decides — and that’s dangerous.”',
        blocks: [
          { t: 'Safety = control', d: 'You only relax when everything feels handled.' },
          { t: 'Chaos threat', d: 'Uncertainty reads as danger, not space.' },
          { t: 'Think to not feel', d: 'You optimize to avoid the emotional threshold.' },
          { t: 'Operational delay', d: 'You wait for a perfect moment that never arrives.' }
        ],
        protocol: '7 days · Control Off protocol: one daily micro-decision with no optimizing. Watch the anxiety signal without running it.'
      },
      audios: [
        { name: 'Booster 2.0', whyEs: 'Reinicia el campo y corta el circuito de control.', whyEn: 'Resets the field and cuts the control circuit.', img: '/img/catalog/booster-2-0.jpg' },
        { name: 'LIMITLESS', whyEs: 'Detecta el patrón invisible que te atrapa.', whyEn: 'Detects the invisible pattern trapping you.', img: '/img/catalog/limitless.jpg' },
        { name: 'Wonderland Coherence', whyEs: 'Coherencia al soltar el mando.', whyEn: 'Coherence when releasing the wheel.', img: '/img/catalog/wonderland-coherence.jpg' }
      ]
    },
    espejo: {
      es: {
        name: 'Espejo Relacional',
        mini: 'Quieres amor o elección… y al mismo tiempo te proteges de ser conocido de verdad.',
        script: '“Si me eligen, valgo. Si me ignoran, desaparezco.”',
        blocks: [
          { t: 'Validación externa', d: 'Tu estado depende de cómo te miran.' },
          { t: 'Perseguir / retirar', d: 'Te acercas demasiado o desapareces.' },
          { t: 'Miedo al abandono', d: 'Aceptas migajas para no quedarte sola/o.' },
          { t: 'Identidad en el otro', d: 'Te defines por la relación.' }
        ],
        protocol: '7 días · Protocolo Valor Fijo: cada mañana escribe “Mi valor no negocia.” No envíes el mensaje que suele “salvar” la escena.'
      },
      en: {
        name: 'Relational Mirror',
        mini: 'You want love or being chosen… and still protect yourself from being truly known.',
        script: '“If they choose me, I matter. If they ignore me, I vanish.”',
        blocks: [
          { t: 'External validation', d: 'Your state depends on how you’re seen.' },
          { t: 'Chase / withdraw', d: 'Too close, then gone.' },
          { t: 'Abandonment fear', d: 'You accept crumbs to avoid being alone.' },
          { t: 'Identity in the other', d: 'You define yourself by the relationship.' }
        ],
        protocol: '7 days · Fixed Worth protocol: each morning write “My worth doesn’t negotiate.” Don’t send the message that usually saves the scene.'
      },
      audios: [
        { name: 'SEDUCTION', whyEs: 'Deja de perseguir; recupera magnetismo.', whyEn: 'Stop chasing; restore magnetism.', img: '/img/catalog/seduction.jpg' },
        { name: 'Amor Propio Magic 4.0', whyEs: 'Merecimiento sin codependencia.', whyEn: 'Worth without codependency.', img: '/img/catalog/amor-propio-magic-4-0.jpg' },
        { name: 'Mesmerizing Love', whyEs: 'Presencia que enamora sin forzar.', whyEn: 'Presence that magnetizes without force.', img: '/img/catalog/mesmerizing-love.jpg' }
      ]
    },
    vacio: {
      es: {
        name: 'Vacío de Identidad',
        mini: 'El deseo pide una versión nueva de ti — y tu sistema aún no la ha instalado como “normal”.',
        script: '“Si elijo mal quién soy, pierdo todo lo que construí.”',
        blocks: [
          { t: 'Piloto automático', d: 'Operas disociada/o con suavidad.' },
          { t: 'Miedo a definirte', d: 'Elegir una versión se siente traición.' },
          { t: 'Comparación', d: 'Mides tu vida con películas ajenas.' },
          { t: 'Sin guión', d: 'Sabes lo que no quieres; no el rol que sí.' }
        ],
        protocol: '7 días · Protocolo Identidad Activa: 3 mañanas “Hoy opero como la persona que ___.” Un gesto mínimo coherente.'
      },
      en: {
        name: 'Identity Void',
        mini: 'The desire asks for a new version of you — and your system hasn’t installed it as “normal” yet.',
        script: '“If I choose the wrong who-I-am, I lose everything I built.”',
        blocks: [
          { t: 'Autopilot', d: 'Soft dissociation.' },
          { t: 'Fear of defining', d: 'Choosing a version feels like betrayal.' },
          { t: 'Comparison', d: 'You measure life against other films.' },
          { t: 'No script', d: 'You know what you don’t want — not the role you do.' }
        ],
        protocol: '7 days · Active Identity protocol: 3 mornings “Today I operate as the person who ___.” One matching micro-action.'
      },
      audios: [
        { name: 'Identity', whyEs: 'Rediseña tu película y el rol principal.', whyEn: 'Redesign your film and lead role.', img: '/img/catalog/identity.jpg' },
        { name: 'IMAGINE', whyEs: 'Imagina desde el resultado ya vivido.', whyEn: 'Imagine from the lived result.', img: '/img/catalog/imagine.jpg' },
        { name: 'GOD / GODDESS', whyEs: 'Instala el YO SOY creador.', whyEn: 'Install the creative I AM.', img: '/img/catalog/god-goddess.jpg' }
      ]
    },
    ruido: {
      es: {
        name: 'Ruido Mental',
        mini: 'Quieres claridad para avanzar, pero tu mente satura el canal para no cruzar el umbral.',
        script: '“Si dejo de pensar, se me escapa algo importante.”',
        blocks: [
          { t: 'Hipervigilancia', d: 'Escaneas amenazas sin incendio.' },
          { t: 'Multitarea emocional', d: 'Sientes 5 escenarios a la vez.' },
          { t: 'Insomnio creativo', d: 'Ideas cuando deberías dormir.' },
          { t: 'Duda crónica', d: 'Revisas cada decisión hasta vaciarla.' }
        ],
        protocol: '7 días · Protocolo Canal Único: 10 min/día auriculares + una sola pregunta + cero pantallas.'
      },
      en: {
        name: 'Mental Noise',
        mini: 'You want clarity to move, but your mind saturates the channel so you never cross the threshold.',
        script: '“If I stop thinking, something important will slip.”',
        blocks: [
          { t: 'Hypervigilance', d: 'Scanning threats with no fire.' },
          { t: 'Emotional multitasking', d: 'Five scenarios at once.' },
          { t: 'Creative insomnia', d: 'Ideas when you should sleep.' },
          { t: 'Chronic doubt', d: 'Revising until the choice is empty.' }
        ],
        protocol: '7 days · Single Channel protocol: 10 min/day headphones + one question + zero screens.'
      },
      audios: [
        { name: 'LIMITLESS', whyEs: 'Claridad láser sobre el ruido.', whyEn: 'Laser clarity over the noise.', img: '/img/catalog/limitless.jpg' },
        { name: 'Keep Cool', whyEs: 'Baja el volumen del sistema.', whyEn: 'Lowers system volume.', img: '/img/catalog/keep-cool.jpg' },
        { name: 'MASTER MIND', whyEs: 'Orden para visiones grandes.', whyEn: 'Order for big visions.', img: '/img/catalog/master-mind.jpg' }
      ]
    },
    carencia: {
      es: {
        name: 'Código de Carencia',
        mini: 'Quieres riqueza — y te incomoda ser la persona de tu familia que tiene significativamente más.',
        script: '“Si me llega de más, algo malo viene después.”',
        blocks: [
          { t: 'Culpa al recibir', d: 'Ganar se siente inseguro.' },
          { t: 'Fugas invisibles', d: 'Entra y se va sin explicación.' },
          { t: 'Techo de merecimiento', d: 'Saboteas cuando sube el nivel.' },
          { t: 'Identidad de escasez', d: 'Programa: “la gente como yo no opera a ese nivel.”' }
        ],
        protocol: '7 días · Protocolo Señal de Abundancia: al pagar, registra “circula a través de mí” y continúa sin drama.'
      },
      en: {
        name: 'Lack Code',
        mini: 'You want wealth — and you’re uncomfortable being the family member who has significantly more.',
        script: '“If too much arrives, something bad follows.”',
        blocks: [
          { t: 'Guilt receiving', d: 'Earning feels unsafe.' },
          { t: 'Invisible leaks', d: 'It comes and goes without a clear why.' },
          { t: 'Worth ceiling', d: 'Sabotage as the level rises.' },
          { t: 'Scarcity identity', d: 'Program: “people like me don’t operate at that level.”' }
        ],
        protocol: '7 days · Abundance Signal protocol: when you pay, register “it circulates through me” and continue without drama.'
      },
      audios: [
        { name: 'MONEY TECH', whyEs: 'Fórmula diurna/nocturna de abundancia.', whyEn: 'Day/night abundance formula.', img: '/img/catalog/money-tech.jpg' },
        { name: 'Master Abundance', whyEs: 'Sostener el flujo sin sabotaje.', whyEn: 'Sustain flow without sabotage.', img: '/img/catalog/master-abundance.jpg' },
        { name: 'LUCKY', whyEs: 'Suerte como identidad operativa.', whyEn: 'Luck as operative identity.', img: '/img/catalog/lucky.jpg' }
      ]
    },
    sueno: {
      es: {
        name: 'Soñador Atrapado',
        mini: 'El deseo vive enorme en tu mente — y se protege de volverse real para no romperse.',
        script: '“Mientras sea posible en mi mente, no puede fallar afuera.”',
        blocks: [
          { t: 'Fantasía-refugio', d: 'Sueñas para no arriesgar.' },
          { t: 'Perfeccionismo', d: 'Nunca está “listo”.' },
          { t: 'Miedo al juicio', d: 'Si lo muestro, me pueden reducir.' },
          { t: 'Retraso operativo', d: 'Esperas inspiración en vez de protocolo.' }
        ],
        protocol: 'Hoy · Protocolo Salida del Vestíbulo: publica o envía una versión imperfecta. El acto > la obra maestra.'
      },
      en: {
        name: 'Trapped Dreamer',
        mini: 'The desire lives huge in your mind — and protects itself from becoming real so it can’t break.',
        script: '“As long as it’s possible in my mind, it can’t fail outside.”',
        blocks: [
          { t: 'Fantasy shelter', d: 'Dreaming to avoid risk.' },
          { t: 'Perfectionism', d: 'Never “ready”.' },
          { t: 'Fear of judgment', d: 'Showing it might shrink you.' },
          { t: 'Operational delay', d: 'Waiting for inspiration instead of protocol.' }
        ],
        protocol: 'Today · Leave-the-Lobby protocol: publish or send an imperfect version. Act > masterpiece.'
      },
      audios: [
        { name: 'IMAGINE', whyEs: 'Materializa desde imaginación entrenada.', whyEn: 'Materialize from trained imagination.', img: '/img/catalog/imagine.jpg' },
        { name: 'White Rabbit Code', whyEs: 'Boost para salir del vestíbulo.', whyEn: 'Boost to leave the lobby.', img: '/img/catalog/white-rabbit-code.jpg' },
        { name: 'Simulation U', whyEs: 'Entiende el juego y juega en serio.', whyEn: 'Understand the game; play for real.', img: '/img/catalog/simulation-u.jpg' }
      ]
    }
  };

  function blankState() {
    return {
      step: 'start',
      q: 0,
      answers: { desire: '', discomfort: '', identity: '', feelings: '' },
      scores: {},
      archetype: null,
      unlocked: false,
      keyVerified: false,
      code: null,
      notified: false,
      diagnosis: null,
      gameVersion: GAME_VERSION
    };
  }

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  var rawState = loadState();
  var state;
  if (!rawState || rawState.gameVersion !== GAME_VERSION) {
    state = blankState();
  } else {
    state = rawState;
    if (state.unlocked && !state.keyVerified) {
      state.unlocked = false;
      state.step = 'start';
    }
    if (!state.answers) state.answers = blankState().answers;
  }
  try {
    localStorage.removeItem('erior_mapa_v1');
    localStorage.removeItem('erior_mapa_v2');
    localStorage.removeItem('erior_mapa_v3');
  } catch (e) {}

  var root = document.getElementById('app');
  var bar = document.getElementById('progressBar');
  var flash = document.getElementById('flash');

  function saveState() {
    try {
      state.gameVersion = GAME_VERSION;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (state.unlocked && state.keyVerified) {
        localStorage.setItem(
          'erior_mapa_credit',
          JSON.stringify({
            mxn: CREDIT_MXN,
            usd: CREDIT_USD,
            archetype: state.archetype,
            code: state.code,
            at: Date.now()
          })
        );
      }
    } catch (e) {}
  }

  function resetGame() {
    state = blankState();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    saveState();
    pulseFlash();
    render();
  }

  function archCopy(id) {
    return ARCH[id][LANG];
  }

  function makeCode() {
    return 'MAPA-' + Math.random().toString(36).slice(2, 6).toUpperCase() + Date.now().toString(36).slice(-3).toUpperCase();
  }

  function waUrl(msg) {
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }

  function pulseFlash() {
    if (!flash) return;
    flash.classList.add('on');
    setTimeout(function () {
      flash.classList.remove('on');
    }, 180);
  }

  function setMood(name) {
    document.body.className = document.body.className
      .split(/\s+/)
      .filter(function (c) {
        return c && c.indexOf('mood-') !== 0;
      })
      .join(' ');
    document.body.classList.add('mood-' + name);
    if (!document.body.classList.contains('scene-matrix') && !document.body.classList.contains('scene-dna') && !document.body.classList.contains('scene-hole')) {
      document.body.classList.add('scene-matrix');
    }
  }

  function setProgress(p) {
    if (bar) bar.style.width = Math.max(0, Math.min(100, p)) + '%';
  }

  function copyText(btn, text) {
    var ok = function () {
      var o = btn.textContent;
      btn.textContent = t.copied;
      setTimeout(function () {
        btn.textContent = o;
      }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(function () {
        fallbackCopy(text, ok);
      });
    } else fallbackCopy(text, ok);
  }

  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {}
    document.body.removeChild(ta);
    if (cb) cb();
  }

  function priceDiff(pack) {
    if (LANG === 'en') return Math.max(0, { 1: 46, 2: 85, 3: 135 }[pack] - CREDIT_USD);
    return Math.max(0, { 1: 777, 2: 1444, 3: 2299 }[pack] - CREDIT_MXN);
  }

  function formatDiff(pack) {
    var d = priceDiff(pack);
    return LANG === 'en' ? '$' + d + ' USD' : '$' + d.toLocaleString('es-MX') + ' MXN';
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function combinedFeelings() {
    var a = state.answers || {};
    return [
      'DESEO: ' + (a.desire || ''),
      'INCOMODIDAD SI LLEGA: ' + (a.discomfort || ''),
      'EN QUIÉN CONVERTIRME: ' + (a.identity || ''),
      'CÓMO ME SIENTO: ' + (a.feelings || '')
    ].join('\n\n');
  }

  function scoreFromAnswers() {
    var text = combinedFeelings().toLowerCase();
    var map = {
      loop: ['control', 'ansiedad', 'perfecto', 'sobrepensar', 'caos', 'anxiety', 'worry', 'plan'],
      espejo: ['amor', 'pareja', 'ex', 'abandono', 'rechazo', 'love', 'lonely', 'familia', 'juzg', 'visto', 'novio', 'novia'],
      vacio: ['identidad', 'quién', 'quien', 'vacio', 'vacío', 'identity', 'empty', 'normal', 'convert'],
      ruido: ['ruido', 'mente', 'insomnio', 'saturad', 'noise', 'stress', 'foco', 'focus', 'pensar'],
      carencia: ['dinero', 'riqueza', 'falta', 'pobre', 'deuda', 'money', 'wealth', 'abundancia', 'más', 'mas'],
      sueno: ['sueño', 'proyecto', 'procrastin', 'después', 'dream', 'later', 'manifest', 'empezar', 'mostrar']
    };
    var tally = { loop: 0, espejo: 0, vacio: 0, ruido: 0, carencia: 0, sueno: 0 };
    Object.keys(map).forEach(function (k) {
      map[k].forEach(function (w) {
        if (text.indexOf(w) !== -1) tally[k] += 2;
      });
    });
    return tally;
  }

  function winnerFrom(scores) {
    var best = 'vacio';
    var max = -1;
    Object.keys(scores || {}).forEach(function (k) {
      if (scores[k] > max) {
        max = scores[k];
        best = k;
      }
    });
    return best;
  }

  function localDiagnose() {
    var scores = scoreFromAnswers();
    state.scores = scores;
    var id = winnerFrom(scores);
    var a = archCopy(id);
    var desire = (state.answers.desire || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    var discomfort = (state.answers.discomfort || '').replace(/\s+/g, ' ').trim().slice(0, 140);
    var reading;
    if (LANG === 'en') {
      reading =
        'You say you want “' +
        (desire || 'this expansion') +
        '”. And in the same breath, your system names the cost: “' +
        (discomfort || 'the discomfort of becoming someone new') +
        '”. The resistance isn’t toward the desire itself. It’s toward the identity, expectations, and responsibilities that desire represents. Pattern detected: ' +
        a.name +
        '. ' +
        a.mini;
    } else {
      reading =
        'Dices que quieres “' +
        (desire || 'esta expansión') +
        '”. Y en la misma respiración, tu sistema nombra el costo: “' +
        (discomfort || 'la incomodidad de convertirte en alguien nuevo') +
        '”. La resistencia no es hacia el deseo en sí. Es hacia la identidad, las expectativas y las responsabilidades que ese deseo representa. Patrón detectado: ' +
        a.name +
        '. ' +
        a.mini;
    }
    return {
      ok: true,
      source: 'local',
      archetype: id,
      name: a.name,
      mini: a.mini,
      reading: reading,
      script: a.script,
      blocks: a.blocks,
      protocol: a.protocol,
      audios: ARCH[id].audios
    };
  }

  function notifyTeam(kind) {
    var a = state.archetype ? archCopy(state.archetype).name : '?';
    var msg =
      kind === 'paid'
        ? '🔑 MAPA PAGO PENDIENTE VERIFICAR\nCódigo: ' +
          state.code +
          '\nPatrón: ' +
          a +
          '\nIdioma: ' +
          LANG +
          '\nCliente dice que pagó $' +
          (LANG === 'en' ? '26 USD' : '444 MXN') +
          '.'
        : '🟣 MAPA REPORTE\nCódigo: ' + state.code + '\nPatrón: ' + a;
    Promise.all([
      fetch('https://api.callmebot.com/whatsapp.php?phone=5214432311761&text=' + encodeURIComponent(msg) + '&apikey=6870409'),
      fetch('https://api.callmebot.com/whatsapp.php?phone=5214791936105&text=' + encodeURIComponent(msg) + '&apikey=2412047')
    ]).catch(function () {});
  }

  function answerKey(q) {
    return ['desire', 'discomfort', 'identity', 'feelings'][q];
  }

  function renderStart() {
    setProgress(6);
    setMood('0');
    root.innerHTML =
      '<section class="stage report-stage">' +
      '<p class="kicker">' +
      t.kickerStart +
      '</p>' +
      '<h1 class="report-title">' +
      t.titleStart +
      '</h1>' +
      '<p class="lead report-lead">' +
      t.leadStart +
      '</p>' +
      '<div class="cta-row"><button type="button" class="btn btn-solid" id="btnStart">' +
      t.startCta +
      '</button></div>' +
      '<p class="foot-note">' +
      t.footNote +
      '</p></section>';
    document.getElementById('btnStart').onclick = function () {
      pulseFlash();
      state = blankState();
      state.step = 'question';
      state.q = 0;
      state.code = makeCode();
      saveState();
      render();
    };
  }

  function renderQuestion() {
    var q = state.q || 0;
    var meta = t.questions[q];
    var key = answerKey(q);
    setProgress(12 + q * 16);
    setMood(String(Math.min(q + 1, 5)));
    root.innerHTML =
      '<section class="stage report-stage">' +
      '<p class="kicker">' +
      t.qProgress +
      ' ' +
      (q + 1) +
      ' ' +
      t.of +
      ' 4</p>' +
      '<p class="q-kicker">' +
      meta.kicker +
      '</p>' +
      '<h2>' +
      meta.title +
      '</h2>' +
      '<p class="lead">' +
      meta.lead +
      '</p>' +
      '<textarea id="qIn" class="feel-box report-input" rows="6" maxlength="1200" placeholder="' +
      esc(meta.placeholder) +
      '">' +
      esc(state.answers[key] || '') +
      '</textarea>' +
      '<div class="cta-row"><button type="button" class="btn btn-solid" id="btnNext">' +
      (q === 3 ? t.diagnoseCta : t.next) +
      '</button></div>' +
      '<p class="err" id="qErr"></p></section>';

    document.getElementById('btnNext').onclick = async function () {
      var err = document.getElementById('qErr');
      var val = document.getElementById('qIn').value.trim();
      err.textContent = '';
      if (val.length < 18) {
        err.textContent =
          LANG === 'en' ? 'Go deeper — a few honest sentences.' : 'Ve más profundo — unas frases honestas.';
        return;
      }
      state.answers[key] = val;
      if (q < 3) {
        state.q = q + 1;
        saveState();
        pulseFlash();
        render();
        return;
      }
      var btn = document.getElementById('btnNext');
      btn.disabled = true;
      btn.textContent = t.busy;
      state.scores = scoreFromAnswers();
      var diagnosis = null;
      try {
        var res = await fetch(DIAGNOSE_FN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feelings: combinedFeelings(),
            scores: state.scores,
            lang: LANG,
            archetypeHint: winnerFrom(state.scores)
          })
        });
        diagnosis = await res.json();
        if (!diagnosis || !diagnosis.ok) throw new Error('fail');
      } catch (e) {
        diagnosis = localDiagnose();
      }
      state.diagnosis = diagnosis;
      state.archetype = diagnosis.archetype || winnerFrom(state.scores);
      state.step = 'mini';
      if (!state.code) state.code = makeCode();
      saveState();
      pulseFlash();
      render();
    };
  }

  function renderMini() {
    setProgress(72);
    setMood('5');
    if (!state.diagnosis || !state.archetype) {
      state.step = 'question';
      state.q = 0;
      render();
      return;
    }
    var d = state.diagnosis;
    var name = d.name || archCopy(state.archetype).name;
    var mini = d.mini || archCopy(state.archetype).mini;
    var snippet = (state.answers.discomfort || state.answers.feelings || '').replace(/\s+/g, ' ').trim().slice(0, 140);
    var au = d.audios && d.audios[0];
    root.innerHTML =
      '<section class="stage report-stage">' +
      '<p class="kicker">' +
      t.miniTag +
      '</p>' +
      '<h2>' +
      t.miniTitle +
      '</h2>' +
      '<div class="card"><span class="tag">' +
      t.patternTag +
      '</span><h3>' +
      esc(name) +
      '</h3><p>' +
      esc(mini) +
      '</p></div>' +
      (snippet
        ? '<div class="card feel-echo"><span class="tag">' +
          t.fromYou +
          '</span><p class="quote-line">“' +
          esc(snippet) +
          '…”</p></div>'
        : '') +
      (au
        ? '<div class="card"><span class="tag">' +
          t.freqTag +
          '</span><h3 style="font-size:1.2rem">' +
          esc(au.name) +
          '</h3><p style="margin-top:.35rem">' +
          esc(LANG === 'en' ? au.whyEn || au.why || '' : au.whyEs || au.why || '') +
          '</p></div>'
        : '') +
      '<div class="card"><h3 style="font-size:1.25rem">' +
      t.unlockTitle +
      '</h3><p style="margin-top:.35rem">' +
      t.unlockLead +
      '</p><div class="cta-row"><button type="button" class="btn btn-solid" id="btnUnlock">' +
      t.unlockCta +
      '</button></div></div></section>';
    document.getElementById('btnUnlock').onclick = function () {
      pulseFlash();
      state.step = 'pay';
      saveState();
      render();
    };
  }

  function row(label, value) {
    return (
      '<div class="pay-row"><span>' +
      label +
      '</span><b>' +
      value +
      '</b><button type="button" class="copy-btn" data-c="' +
      value.replace(/"/g, '&quot;') +
      '">' +
      t.copy +
      '</button></div>'
    );
  }

  function payPanelHtml(method) {
    if (LANG === 'en') {
      if (method === 'paypal') {
        return (
          '<p>Pay <b>$26 USD</b> · memo: <b>' +
          state.code +
          '</b></p>' +
          row('PayPal', 'paypal.me/sheismagique') +
          '<p class="hint"><a href="https://www.paypal.me/sheismagique" target="_blank" rel="noopener">Open PayPal →</a></p>'
        );
      }
      if (method === 'alt') return '<p>Crypto / WU — WhatsApp Pauline with code <b>' + state.code + '</b>.</p>';
      return (
        '<p>ACH / Wire · <b>$26 USD</b> · memo <b>' +
        state.code +
        '</b></p>' +
        row('Beneficiary', 'Paulina Lopez') +
        row('Bank', 'Lead Bank') +
        row('Routing', '101019644') +
        row('Account', '219021482598')
      );
    }
    if (method === 'oxxo') {
      return '<p>OXXO · <b>$444 MXN</b> · guarda tu código <b>' + state.code + '</b></p>' + row('Tarjeta', '4741 7435 2658 3795') + row('Banco', 'Banregio');
    }
    if (method === 'paypal') {
      return (
        '<p>PayPal · <b>$444 MXN</b> / $26 USD · concepto <b>' +
        state.code +
        '</b></p>' +
        row('Link', 'paypal.me/sheismagique') +
        '<p class="hint"><a href="https://www.paypal.me/sheismagique" target="_blank" rel="noopener">Ir a PayPal →</a></p>'
      );
    }
    if (method === 'alt') return '<p>Crypto / WU — WhatsApp con código <b>' + state.code + '</b>.</p>';
    return (
      '<p>Transferencia · <b>$444 MXN</b> · concepto <b>' +
      state.code +
      '</b></p>' +
      row('Nombre', 'Paulina López Gutiérrez') +
      row('CLABE NVIO', '710969000048503916') +
      row('CLABE Banregio', '058470000010260425')
    );
  }

  function renderPay() {
    setProgress(88);
    setMood('pay');
    if (!state.code) {
      state.code = makeCode();
      saveState();
    }
    var methods = t.methods;
    var active = methods[0].id;
    root.innerHTML =
      '<section class="stage report-stage">' +
      '<p class="kicker">' +
      t.codeLabel +
      '</p>' +
      '<h2>' +
      t.payTitle +
      '</h2>' +
      '<p class="lead">' +
      t.payLead +
      '</p>' +
      '<div class="order-card">' +
      '<span class="order-card-label">' +
      t.codeLabel +
      '</span>' +
      '<strong class="order-card-code">' +
      state.code +
      '</strong>' +
      '<button type="button" class="btn btn-ghost copy-btn" id="btnCopyCode">' +
      t.copyCode +
      '</button></div>' +
      '<div class="pay-box"><div class="pay-tabs" id="payTabs"></div><div class="pay-panel" id="payPanel"></div></div>' +
      '<div class="cta-row" style="margin-top:1.1rem">' +
      '<button type="button" class="btn btn-solid" id="btnPaid">' +
      t.paidCta +
      '</button>' +
      '<a class="btn btn-ghost" id="waPay" target="_blank" rel="noopener">' +
      t.waPay +
      '</a></div>' +
      '<div class="waiting">' +
      t.keyWait +
      '</div>' +
      '<p class="hint">' +
      t.keyHint +
      '</p>' +
      '<div class="unlock-box">' +
      '<label for="keyIn">' +
      t.keyLabel +
      '</label>' +
      '<input id="keyIn" maxlength="12" placeholder="' +
      t.keyPlaceholder +
      '" autocomplete="one-time-code">' +
      '<div class="cta-row"><button type="button" class="btn btn-solid" id="btnKey">' +
      t.keyCta +
      '</button></div>' +
      '<p class="err" id="keyErr"></p></div></section>';

    var tabs = document.getElementById('payTabs');
    var panel = document.getElementById('payPanel');
    function paint(id) {
      active = id;
      tabs.querySelectorAll('.pay-tab').forEach(function (b) {
        b.classList.toggle('active', b.dataset.m === id);
      });
      panel.innerHTML = payPanelHtml(id);
      panel.querySelectorAll('.copy-btn').forEach(function (b) {
        b.onclick = function () {
          copyText(b, b.getAttribute('data-c'));
        };
      });
    }
    methods.forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pay-tab';
      b.dataset.m = m.id;
      b.textContent = m.label;
      b.onclick = function () {
        paint(m.id);
      };
      tabs.appendChild(b);
    });
    paint(active);

    document.getElementById('btnCopyCode').onclick = function () {
      copyText(document.getElementById('btnCopyCode'), state.code);
    };

    var aName = state.archetype ? archCopy(state.archetype).name : '?';
    var waMsg =
      LANG === 'en'
        ? 'Hi! I paid the Unconscious Report ($26 USD). Code: ' + state.code + '. Pattern: ' + aName + '. Please send my access key.'
        : 'Hola! Ya pagué el Reporte del Inconsciente ($444 MXN). Código: ' + state.code + '. Patrón: ' + aName + '. Por favor envíenme la clave de acceso.';
    document.getElementById('waPay').href = waUrl(waMsg);

    document.getElementById('btnPaid').onclick = function () {
      notifyTeam('paid');
      state.notified = true;
      saveState();
      pulseFlash();
    };

    document.getElementById('btnKey').onclick = async function () {
      var err = document.getElementById('keyErr');
      var key = document.getElementById('keyIn').value;
      err.textContent = '';
      try {
        var res = await fetch(UNLOCK_FN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify', orderId: state.code, key: key })
        });
        var data = await res.json();
        if (!data.ok) {
          throw new Error(
            LANG === 'en'
              ? 'Wrong key for ' + state.code + '. Wait for Pauline’s key after payment verification.'
              : 'Clave incorrecta para ' + state.code + '. Espera la clave de Pauline tras verificar tu pago.'
          );
        }
        state.unlocked = true;
        state.keyVerified = true;
        state.step = 'full';
        saveState();
        pulseFlash();
        render();
      } catch (e) {
        err.textContent = e.message || String(e);
      }
    };
  }

  function renderFull() {
    setProgress(100);
    setMood('full');
    var a = archCopy(state.archetype);
    var d = state.diagnosis || {};
    var audios = d.audios && d.audios.length ? d.audios : ARCH[state.archetype].audios;
    var blocksSrc = d.blocks && d.blocks.length ? d.blocks : a.blocks;
    var blocks = blocksSrc
      .map(function (b) {
        return '<div class="blok"><b>' + esc(b.t) + '</b><span>' + esc(b.d) + '</span></div>';
      })
      .join('');
    var reading = d.reading || a.mini;
    var script = d.script || a.script;
    var protocol = d.protocol || d.ritual || a.protocol;
    var title = d.name || a.name;
    var audioHtml = audios
      .map(function (au) {
        return (
          '<div class="audio-card"><img src="' +
          au.img +
          '" alt=""><div><h4>' +
          esc(au.name) +
          '</h4><p>' +
          esc(LANG === 'en' ? au.whyEn || au.why || '' : au.whyEs || au.why || '') +
          '</p></div></div>'
        );
      })
      .join('');
    var names = audios.map(function (x) {
      return x.name;
    });
    function waBuy(pack) {
      var list = names.slice(0, pack).join(' + ');
      if (LANG === 'en') {
        return waUrl(
          'Hi! Unconscious Report paid (' + state.code + '). Pack ' + pack + ': ' + list + '. Difference only: ' + formatDiff(pack) + ' ($26 credit).'
        );
      }
      return waUrl(
        'Hola! Reporte pagado (' + state.code + '). Pack ' + pack + ': ' + list + '. Solo diferencia: ' + formatDiff(pack) + ' (crédito $444).'
      );
    }
    var answersHtml =
      '<div class="card feel-echo"><span class="tag">' +
      t.fromYou +
      '</span>' +
      '<p><b>' +
      (LANG === 'en' ? 'Desire' : 'Deseo') +
      ':</b> ' +
      esc(state.answers.desire) +
      '</p>' +
      '<p style="margin-top:.55rem"><b>' +
      (LANG === 'en' ? 'If it arrived' : 'Si llegara') +
      ':</b> ' +
      esc(state.answers.discomfort) +
      '</p>' +
      '<p style="margin-top:.55rem"><b>' +
      (LANG === 'en' ? 'Become' : 'Convertirme') +
      ':</b> ' +
      esc(state.answers.identity) +
      '</p></div>';

    root.innerHTML =
      '<section class="stage report-stage">' +
      '<p class="kicker">' +
      t.fullTag +
      ' · ' +
      state.code +
      '</p>' +
      '<h2>' +
      esc(title) +
      '</h2>' +
      '<p class="lead report-reading">' +
      esc(reading) +
      '</p>' +
      answersHtml +
      '<div class="card"><span class="tag">' +
      t.scriptTag +
      '</span><p class="quote-line">' +
      esc(script) +
      '</p></div>' +
      '<div class="bloks">' +
      blocks +
      '</div>' +
      '<div class="card"><h3 style="font-size:1.15rem">' +
      t.protocolTag +
      '</h3><p style="margin-top:.35rem">' +
      esc(protocol) +
      '</p></div>' +
      '<div class="price-line">' +
      t.creditNote +
      '</div>' +
      '<h2 style="margin-top:1.6rem;font-size:1.55rem">' +
      t.upsellTitle +
      '</h2>' +
      '<p class="lead">' +
      t.upsellLead +
      '</p>' +
      '<div class="audio-grid">' +
      audioHtml +
      '</div>' +
      '<div class="cta-row">' +
      '<a class="btn btn-solid" target="_blank" rel="noopener" href="' +
      waBuy(1) +
      '">' +
      t.buy1 +
      ' · ' +
      formatDiff(1) +
      '</a>' +
      '<a class="btn" target="_blank" rel="noopener" href="' +
      waBuy(2) +
      '">' +
      t.buy2 +
      ' · ' +
      formatDiff(2) +
      '</a>' +
      '<a class="btn" target="_blank" rel="noopener" href="' +
      waBuy(3) +
      '">' +
      t.buy3 +
      ' · ' +
      formatDiff(3) +
      '</a>' +
      '<a class="btn btn-ghost" href="' +
      t.homeHref +
      '">' +
      t.backHome +
      '</a></div></section>';
  }

  function render() {
    if (state.step === 'start') renderStart();
    else if (state.step === 'question') renderQuestion();
    else if (state.step === 'mini') renderMini();
    else if (state.step === 'pay') renderPay();
    else if (state.step === 'full') {
      if (!(state.unlocked && state.keyVerified)) {
        state.step = 'pay';
        renderPay();
      } else renderFull();
    } else renderStart();
  }

  // Soft background motion only
  (function initFx() {
    var cMatrix = document.getElementById('fxMatrix');
    var cDna = document.getElementById('fxDna');
    if (!cMatrix || !cDna) return;
    var mtx = cMatrix.getContext('2d');
    var dna = cDna.getContext('2d');
    var cols = [];
    var helix = [];
    var chars = '01ΑΒΓΔλΨΩ∞∴∵ERIOR';
    function resize() {
      cMatrix.width = cDna.width = window.innerWidth;
      cMatrix.height = cDna.height = window.innerHeight;
      var n = Math.floor(cMatrix.width / 22);
      cols = [];
      for (var i = 0; i < n; i++) {
        cols.push({ x: i * 22, y: Math.random() * cMatrix.height, speed: 0.6 + Math.random() * 1.8 });
      }
      helix = [];
      for (var h = 0; h < 18; h++) {
        helix.push({
          t: Math.random() * Math.PI * 2,
          y: Math.random() * cDna.height,
          speed: 0.25 + Math.random() * 0.5,
          amp: 36 + Math.random() * 50,
          r: 1.2 + Math.random() * 1.8
        });
      }
    }
    function tick() {
      mtx.fillStyle = 'rgba(5,4,10,0.18)';
      mtx.fillRect(0, 0, cMatrix.width, cMatrix.height);
      mtx.font = '12px "Share Tech Mono", monospace';
      cols.forEach(function (c) {
        var ch = chars.charAt(Math.floor(Math.random() * chars.length));
        mtx.fillStyle = 'rgba(94,240,192,0.35)';
        mtx.fillText(ch, c.x, c.y);
        c.y += c.speed;
        if (c.y > cMatrix.height + 20) {
          c.y = -20;
          c.speed = 0.6 + Math.random() * 1.8;
        }
      });
      dna.clearRect(0, 0, cDna.width, cDna.height);
      var cx = cDna.width * 0.5;
      helix.forEach(function (p, i) {
        p.t += 0.02;
        p.y += p.speed;
        if (p.y > cDna.height + 20) p.y = -20;
        var x1 = cx + Math.sin(p.t) * p.amp;
        var x2 = cx + Math.sin(p.t + Math.PI) * p.amp;
        dna.strokeStyle = 'rgba(125,249,255,0.1)';
        dna.beginPath();
        dna.moveTo(x1, p.y);
        dna.lineTo(x2, p.y);
        dna.stroke();
        dna.beginPath();
        dna.fillStyle = i % 2 ? 'rgba(255,107,203,0.45)' : 'rgba(77,163,255,0.45)';
        dna.arc(x1, p.y, p.r, 0, Math.PI * 2);
        dna.fill();
        dna.beginPath();
        dna.fillStyle = i % 2 ? 'rgba(94,240,192,0.4)' : 'rgba(255,230,109,0.35)';
        dna.arc(x2, p.y, p.r, 0, Math.PI * 2);
        dna.fill();
      });
      requestAnimationFrame(tick);
    }
    resize();
    window.addEventListener('resize', resize);
    tick();
  })();

  var brand = document.getElementById('brandLink');
  var lang = document.getElementById('langLink');
  var btnReset = document.getElementById('btnReset');
  if (brand) brand.href = t.homeHref;
  if (lang) {
    lang.href = t.langHref;
    lang.textContent = t.langOther;
  }
  if (btnReset) {
    btnReset.textContent = t.reset;
    btnReset.onclick = function () {
      if (window.confirm(LANG === 'en' ? 'Restart the report from the beginning?' : '¿Reiniciar el reporte desde el inicio?')) resetGame();
    };
  }

  var q = new URLSearchParams(location.search);
  if (q.get('play') === '1' || q.get('reset') === '1') resetGame();
  else render();
})();
