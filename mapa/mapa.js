(function () {
  'use strict';

  var LANG = (document.documentElement.lang || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';
  var WA = '5214432311761';
  var STORAGE_KEY = 'erior_mapa_v3';
  var GAME_VERSION = 4;
  var CREDIT_MXN = 444;
  var CREDIT_USD = 26;
  var UNLOCK_FN = '/.netlify/functions/mapa-unlock';

  var SCENE_MODES = ['matrix', 'hole', 'dna', 'matrix', 'hole', 'dna', 'matrix'];

  var I18N = {
    es: {
      brand: 'Erior',
      langOther: 'EN',
      langHref: '/en/mapa/',
      homeHref: '/',
      kickerStart: 'Capa 0 · Umbral',
      titleStart: 'El mapa del inconsciente',
      leadStart: 'No es un test de botones. Es un juego: ordena piezas, descifra códigos, mueve objetos y abre tu archivo solo con clave real tras el pago.',
      startCta: 'Jugar el mapa',
      miniTag: 'Revelación parcial',
      miniTitle: 'Esto es solo el borde',
      unlockTitle: 'Archivo completo · $444 MXN',
      unlockLead: 'Patrón completo, 4 bloqueos, guión inconsciente y 2–3 frecuencias. Los $444 se descuentan si luego activas audio(s).',
      unlockCta: 'Continuar al pago ($444 MXN)',
      payTitle: 'Paga y pide tu clave',
      payLead: 'Monto: $444 MXN. Pon tu código en el concepto / asunto. Envía comprobante. Pauline te manda la clave — sin clave no se abre el archivo.',
      paidCta: 'Ya pagué — avisar y pedir clave',
      keyLabel: 'Clave de 8 caracteres (la genera el admin, no se inventa)',
      keyPlaceholder: 'AB12CD34',
      keyCta: 'Abrir archivo con clave',
      keyWait: 'Pasos: 1) Copia tu código MAPA-… 2) Abre /mapa/admin.html 3) Pega el código + password mapa444 4) Genera la clave 5) Pégala aquí. Si inventas una clave, fallará.',
      keyHint: 'La clave depende de TU código. Si en admin usaste otro MAPA-…, no abrirá.',
      codeLabel: 'Tu código de pedido',
      copyCode: 'Copiar código',
      waPay: 'Pagar / avisar por WhatsApp',
      fullTag: 'Archivo completo',
      creditNote: 'Crédito activo: $444 MXN. Si activas frecuencia(s) ahora, solo pagas la diferencia.',
      upsellTitle: 'Activa la frecuencia',
      upsellLead: 'Estas 3 señales cortan tu patrón. Elige 1, 2 o 3 — el diagnóstico ya está pagado.',
      buy1: '1 audio · diferencia',
      buy2: '2 audios + libro · diferencia',
      buy3: '3 audios + Alicia Premium · diferencia',
      waReport: 'Enviar mi mapa a Pauline',
      backHome: 'Volver al centro',
      copy: 'Copiar',
      copied: '¡Copiado!',
      rooms: [
        { kicker: 'Nivel 1 · Rompecabezas', title: 'Ordena la frase y abre una puerta', lead: 'Toca una pieza, luego un hueco. Cuando la frase esté bien, suelta la llave en una puerta.' },
        { kicker: 'Nivel 2 · Cifrado', title: 'Descifra la voz que hay que callar', lead: 'Arma la frase secreta moviendo las letras a los huecos.' },
        { kicker: 'Nivel 3 · Ensamble', title: 'Arma el objeto que tomas', lead: 'Arrastra (o toca + hueco) 2 piezas correctas sobre un solo objeto.' },
        { kicker: 'Nivel 4 · Algoritmo', title: 'Repite la secuencia del inconsciente', lead: 'Memoriza el patrón luminoso y repítelo tocando los nodos.' },
        { kicker: 'Nivel 5 · Rompecabezas', title: 'Arma el portal pieza por pieza', lead: 'Toca una pieza del montón y luego un hueco del tablero. Completa las 6 piezas.' }
      ],
      methods: [
        { id: 'oxxo', label: 'OXXO' },
        { id: 'transfer', label: 'Transferencia' },
        { id: 'paypal', label: 'PayPal' },
        { id: 'alt', label: 'Crypto / WU' }
      ]
    },
    en: {
      brand: 'Erior',
      langOther: 'ES',
      langHref: '/mapa/',
      homeHref: '/en/',
      kickerStart: 'Layer 0 · Threshold',
      titleStart: 'Map of the Unconscious',
      leadStart: 'Not a button quiz. A game: sort pieces, crack ciphers, move objects — and open your file only with a real key after payment.',
      startCta: 'Play the map',
      miniTag: 'Partial reveal',
      miniTitle: 'This is only the edge',
      unlockTitle: 'Full file · $26 USD',
      unlockLead: 'Full pattern, 4 blocks, unconscious script and 2–3 frequencies. The $26 is credited if you activate audio(s) after.',
      unlockCta: 'Continue to payment ($26 USD)',
      payTitle: 'Pay, then get your key',
      payLead: 'Amount: $26 USD. Put your code in the memo/subject. Send the receipt. Pauline sends the key — no key, no file.',
      paidCta: 'I paid — notify & request key',
      keyLabel: '8-character key (from admin — not invented)',
      keyPlaceholder: 'AB12CD34',
      keyCta: 'Open file with key',
      keyWait: 'Steps: 1) Copy your MAPA-… code 2) Open /mapa/admin.html 3) Paste code + password mapa444 4) Generate key 5) Paste it here. Invented keys always fail.',
      keyHint: 'The key is tied to YOUR code. If admin used a different MAPA-…, it won’t open.',
      codeLabel: 'Your order code',
      copyCode: 'Copy code',
      waPay: 'Pay / notify on WhatsApp',
      fullTag: 'Full file',
      creditNote: 'Active credit: $26 USD. If you activate frequenc(ies) now, you only pay the difference.',
      upsellTitle: 'Activate the frequency',
      upsellLead: 'These 3 signals cut your pattern. Choose 1, 2 or 3 — diagnosis already paid.',
      buy1: '1 audio · difference',
      buy2: '2 audios + book · difference',
      buy3: '3 audios + Alicia Premium · difference',
      waReport: 'Send my map to Pauline',
      backHome: 'Back to center',
      copy: 'Copy',
      copied: 'Copied!',
      rooms: [
        { kicker: 'Level 1 · Puzzle', title: 'Order the phrase, then open a door', lead: 'Tap a piece, then a slot. When the phrase is right, drop the key on a door.' },
        { kicker: 'Level 2 · Cipher', title: 'Decode the voice that must go quiet', lead: 'Build the secret phrase by moving letters into the slots.' },
        { kicker: 'Level 3 · Assemble', title: 'Build the object you take', lead: 'Drag (or tap + slot) 2 correct pieces onto one object.' },
        { kicker: 'Level 4 · Algorithm', title: 'Replay the unconscious sequence', lead: 'Memorize the light pattern, then repeat it on the nodes.' },
        { kicker: 'Level 5 · Jigsaw', title: 'Assemble the portal piece by piece', lead: 'Tap a piece from the pile, then a board slot. Fill all 6 pieces.' }
      ],
      methods: [
        { id: 'wire', label: 'ACH / Wire' },
        { id: 'paypal', label: 'PayPal' },
        { id: 'alt', label: 'Crypto / WU' }
      ]
    }
  };

  var t = I18N[LANG];

  var ARCH = {
    loop: {
      es: {
        name: 'Loop de Control',
        mini: 'Tu inconsciente busca previsibilidad. Repite el circuito para no perder el mando.',
        script: '“Si yo no controlo, alguien más decide — y eso es peligroso.”',
        blocks: [
          { t: 'Control como seguridad', d: 'Relajas solo cuando todo está “bajo control”.' },
          { t: 'Miedo al caos', d: 'La incertidumbre se siente como amenaza.' },
          { t: 'Sobrepensar', d: 'Piensas para no sentir.' },
          { t: 'Loop de posponer', d: 'Esperas el momento perfecto que nunca llega.' }
        ],
        ritual: '7 días: una micro-decisión al azar sin optimizarla. Observa la ansiedad sin obedecerla.'
      },
      en: {
        name: 'Control Loop',
        mini: 'Your unconscious wants predictability. It repeats the circuit so you never lose the wheel.',
        script: '“If I don’t control it, someone else decides — and that’s dangerous.”',
        blocks: [
          { t: 'Control as safety', d: 'You only relax when everything feels handled.' },
          { t: 'Fear of chaos', d: 'Uncertainty feels like threat.' },
          { t: 'Overthinking', d: 'You think to avoid feeling.' },
          { t: 'Postpone loop', d: 'You wait for a perfect moment that never arrives.' }
        ],
        ritual: '7 days: one random micro-decision, no optimizing. Watch anxiety without obeying it.'
      },
      audios: [
        { name: 'Booster 2.0', whyEs: 'Rompe el loop y vuelve al punto cero.', whyEn: 'Breaks the loop; returns to zero point.', img: '/img/catalog/booster-2-0.jpg' },
        { name: 'LIMITLESS', whyEs: 'Detecta el patrón invisible.', whyEn: 'Detects the invisible pattern.', img: '/img/catalog/limitless.jpg' },
        { name: 'Wonderland Coherence', whyEs: 'Coherencia al soltar el control.', whyEn: 'Coherence when releasing control.', img: '/img/catalog/wonderland-coherence.jpg' }
      ]
    },
    espejo: {
      es: {
        name: 'Espejo Relacional',
        mini: 'Tu vida amorosa es un espejo: atraes para confirmar una historia vieja de valor.',
        script: '“Si me eligen, valgo. Si me ignoran, desaparezco.”',
        blocks: [
          { t: 'Validación externa', d: 'Tu estado depende de cómo te miran.' },
          { t: 'Perseguir / retirar', d: 'Te acercas demasiado o desapareces.' },
          { t: 'Miedo al abandono', d: 'Aceptas migajas para no quedarte sola/o.' },
          { t: 'Identidad en el otro', d: 'Te defines por la relación.' }
        ],
        ritual: 'Escribe 10 veces: “Mi valor no negocia.” No envíes el mensaje que suele “salvar” la escena.'
      },
      en: {
        name: 'Relational Mirror',
        mini: 'Your love life is a mirror: you attract to confirm an old worth story.',
        script: '“If they choose me, I matter. If they ignore me, I vanish.”',
        blocks: [
          { t: 'External validation', d: 'Your state depends on how you’re seen.' },
          { t: 'Chase / withdraw', d: 'Too close, then gone.' },
          { t: 'Abandonment fear', d: 'You accept crumbs to avoid being alone.' },
          { t: 'Identity in the other', d: 'You define yourself by the relationship.' }
        ],
        ritual: 'Write 10×: “My worth doesn’t negotiate.” Don’t send the message that usually saves the scene.'
      },
      audios: [
        { name: 'SEDUCTION', whyEs: 'Deja de perseguir; vuelve el magnetismo.', whyEn: 'Stop chasing; restore magnetism.', img: '/img/catalog/seduction.jpg' },
        { name: 'Amor Propio Magic 4.0', whyEs: 'Merecimiento sin codependencia.', whyEn: 'Worth without codependency.', img: '/img/catalog/amor-propio-magic-4-0.jpg' },
        { name: 'Mesmerizing Love', whyEs: 'Presencia que enamora sin forzar.', whyEn: 'Presence that magnetizes.', img: '/img/catalog/mesmerizing-love.jpg' }
      ]
    },
    vacio: {
      es: {
        name: 'Vacío de Identidad',
        mini: 'El personaje actual ya no cabe — y el nuevo aún no se instaló.',
        script: '“Si elijo mal quién soy, pierdo todo lo que construí.”',
        blocks: [
          { t: 'Piloto automático', d: 'Vives disociada/o con suavidad.' },
          { t: 'Miedo a definirte', d: 'Elegir una versión se siente traición.' },
          { t: 'Comparación', d: 'Mides tu vida con películas ajenas.' },
          { t: 'Sin guión', d: 'Sabes lo que no quieres; no el rol que sí.' }
        ],
        ritual: '3 mañanas: “Hoy soy la persona que ___.” Un gesto mínimo acorde.'
      },
      en: {
        name: 'Identity Void',
        mini: 'The current character no longer fits — and the new one isn’t installed yet.',
        script: '“If I choose the wrong who-I-am, I lose everything I built.”',
        blocks: [
          { t: 'Autopilot', d: 'Soft dissociation.' },
          { t: 'Fear of defining', d: 'Choosing a version feels like betrayal.' },
          { t: 'Comparison', d: 'You measure life against other films.' },
          { t: 'No script', d: 'You know what you don’t want — not the role you do.' }
        ],
        ritual: '3 mornings: “Today I am the person who ___.” One tiny matching act.'
      },
      audios: [
        { name: 'Identity', whyEs: 'Rediseña tu película y el rol principal.', whyEn: 'Redesign your film and lead role.', img: '/img/catalog/identity.jpg' },
        { name: 'IMAGINE', whyEs: 'Imagina desde el resultado.', whyEn: 'Imagine from the result.', img: '/img/catalog/imagine.jpg' },
        { name: 'GOD / GODDESS', whyEs: 'Instala el YO SOY creador.', whyEn: 'Install the creative I AM.', img: '/img/catalog/god-goddess.jpg' }
      ]
    },
    ruido: {
      es: {
        name: 'Ruido Mental',
        mini: 'Tu mente no está rota: está saturada. Demasiadas pestañas abiertas.',
        script: '“Si dejo de pensar, se me escapa algo importante.”',
        blocks: [
          { t: 'Hipervigilancia', d: 'Escaneas amenazas sin incendio.' },
          { t: 'Multitarea emocional', d: 'Sientes 5 escenarios a la vez.' },
          { t: 'Insomnio creativo', d: 'Ideas cuando deberías dormir.' },
          { t: 'Duda crónica', d: 'Revisas cada decisión hasta vaciarla.' }
        ],
        ritual: '10 min/día: auriculares, una pregunta, cero pantallas. Un solo insight.'
      },
      en: {
        name: 'Mental Noise',
        mini: 'Your mind isn’t broken — saturated. Too many tabs open.',
        script: '“If I stop thinking, something important will slip.”',
        blocks: [
          { t: 'Hypervigilance', d: 'Scanning threats with no fire.' },
          { t: 'Emotional multitasking', d: 'Five scenarios at once.' },
          { t: 'Creative insomnia', d: 'Ideas when you should sleep.' },
          { t: 'Chronic doubt', d: 'Revising until the choice is empty.' }
        ],
        ritual: '10 min/day: headphones, one question, zero screens. One insight only.'
      },
      audios: [
        { name: 'LIMITLESS', whyEs: 'Claridad láser.', whyEn: 'Laser clarity.', img: '/img/catalog/limitless.jpg' },
        { name: 'Keep Cool', whyEs: 'Baja el ruido del sistema.', whyEn: 'Lowers system noise.', img: '/img/catalog/keep-cool.jpg' },
        { name: 'MASTER MIND', whyEs: 'Orden para visiones grandes.', whyEn: 'Order for big visions.', img: '/img/catalog/master-mind.jpg' }
      ]
    },
    carencia: {
      es: {
        name: 'Código de Carencia',
        mini: 'El dinero es el termómetro. Aún corre el programa “nunca alcanza”.',
        script: '“Si me llega de más, algo malo viene después.”',
        blocks: [
          { t: 'Culpa al recibir', d: 'Ganar se siente inseguro.' },
          { t: 'Fugas invisibles', d: 'Entra y se va sin explicación.' },
          { t: 'Techo de merecimiento', d: 'Saboteas cuando sube el nivel.' },
          { t: 'Identidad pobre', d: '“La gente como yo no tiene eso.”' }
        ],
        ritual: 'Al pagar algo hoy: “Circula a través de mí.” Nueva señal, sin drama.'
      },
      en: {
        name: 'Lack Code',
        mini: 'Money is the thermometer. “Never enough” is still running.',
        script: '“If too much arrives, something bad follows.”',
        blocks: [
          { t: 'Guilt receiving', d: 'Earning feels unsafe.' },
          { t: 'Invisible leaks', d: 'It comes and goes without a clear why.' },
          { t: 'Worth ceiling', d: 'Sabotage as the level rises.' },
          { t: 'Poor identity', d: '“People like me don’t get that.”' }
        ],
        ritual: 'When you pay today: whisper “It circulates through me.”'
      },
      audios: [
        { name: 'MONEY TECH', whyEs: 'Fórmula diurna/nocturna de abundancia.', whyEn: 'Day/night abundance formula.', img: '/img/catalog/money-tech.jpg' },
        { name: 'Master Abundance', whyEs: 'Sostener el flujo.', whyEn: 'Sustain the flow.', img: '/img/catalog/master-abundance.jpg' },
        { name: 'LUCKY', whyEs: 'Suerte como identidad.', whyEn: 'Luck as identity.', img: '/img/catalog/lucky.jpg' }
      ]
    },
    sueno: {
      es: {
        name: 'Soñador Atrapado',
        mini: 'Mundos enormes… y te quedas en el vestíbulo. El sueño se protege para no romperse.',
        script: '“Mientras sea posible en mi mente, no puede fallar afuera.”',
        blocks: [
          { t: 'Fantasía-refugio', d: 'Sueñas para no arriesgar.' },
          { t: 'Perfeccionismo', d: 'Nunca está “listo”.' },
          { t: 'Miedo al juicio', d: 'Si lo muestro, me pueden reducir.' },
          { t: 'Procrastinación sagrada', d: 'Esperas inspiración en vez de ritual.' }
        ],
        ritual: 'Hoy: publica o envía una versión imperfecta. El acto > la obra maestra.'
      },
      en: {
        name: 'Trapped Dreamer',
        mini: 'Huge worlds… stuck in the lobby. The dream protects itself from becoming real.',
        script: '“As long as it’s possible in my mind, it can’t fail outside.”',
        blocks: [
          { t: 'Fantasy shelter', d: 'Dreaming to avoid risk.' },
          { t: 'Perfectionism', d: 'Never “ready”.' },
          { t: 'Fear of judgment', d: 'Showing it might shrink you.' },
          { t: 'Sacred delay', d: 'Waiting for inspiration instead of ritual.' }
        ],
        ritual: 'Today: publish or send an imperfect version. Act > masterpiece.'
      },
      audios: [
        { name: 'IMAGINE', whyEs: 'Materializa desde imaginación entrenada.', whyEn: 'Materialize from trained imagination.', img: '/img/catalog/imagine.jpg' },
        { name: 'White Rabbit Code', whyEs: 'Boost para salir del vestíbulo.', whyEn: 'Boost to leave the lobby.', img: '/img/catalog/white-rabbit-code.jpg' },
        { name: 'Simulation U', whyEs: 'Entiende el juego y juega en serio.', whyEn: 'Understand the game; play for real.', img: '/img/catalog/simulation-u.jpg' }
      ]
    }
  };

  var OUTCOMES = [
    [
      { labelEs: 'Puerta de metal', labelEn: 'Metal door', img: '/img/catalog/booster-2-0.jpg', scores: { loop: 2, ruido: 1 } },
      { labelEs: 'Puerta de espejo', labelEn: 'Mirror door', img: '/img/catalog/mesmerizing-love.jpg', scores: { espejo: 2, vacio: 1 } },
      { labelEs: 'Puerta de niebla', labelEn: 'Fog door', img: '/img/catalog/imagine.jpg', scores: { sueno: 2, vacio: 1, carencia: 1 } }
    ],
    [
      { labelEs: 'Y SI SALGO MAL', labelEn: 'WHAT IF IT FAILS', scores: { loop: 2, ruido: 1 } },
      { labelEs: 'NO SOY SUFICIENTE', labelEn: 'I AM NOT ENOUGH', scores: { espejo: 2, carencia: 1 } },
      { labelEs: 'DESPUES LO HAGO YA', labelEn: 'DO IT LATER NOW', scores: { sueno: 2, vacio: 1 } }
    ],
    [
      { labelEs: 'Llave', labelEn: 'Key', glyph: '🗝️', scores: { loop: 2, carencia: 1 }, parts: ['ojo', 'diente'] },
      { labelEs: 'Auricular', labelEn: 'Earbud', glyph: '🎧', scores: { ruido: 2, sueno: 1 }, parts: ['onda', 'cable'] },
      { labelEs: 'Carta', labelEn: 'Letter', glyph: '✉️', scores: { vacio: 2, espejo: 1 }, parts: ['sello', 'tinta'] }
    ],
    [
      { labelEs: 'Esto ya lo viví', labelEn: 'I’ve lived this', seq: [0, 2, 1, 3], scores: { loop: 2, ruido: 1 } },
      { labelEs: 'Me están mirando', labelEn: 'They’re watching', seq: [1, 3, 0, 2], scores: { espejo: 2, ruido: 1 } },
      { labelEs: 'Aún no es mi momento', labelEn: 'Not my time yet', seq: [3, 1, 2, 0], scores: { sueno: 2, carencia: 1, vacio: 1 } }
    ],
    [
      { labelEs: 'Casi… y se cae', labelEn: 'Almost… then drops', img: '/img/catalog/master-abundance.jpg', scores: { carencia: 2, loop: 1 } },
      { labelEs: 'Eligen a otra persona', labelEn: 'They choose someone else', img: '/img/catalog/erior-love.jpg', scores: { espejo: 2, vacio: 1 } },
      { labelEs: 'Tienes el mapa… no das el paso', labelEn: 'Map in hand… no step', img: '/img/catalog/wonderland-coherence.jpg', scores: { sueno: 2, ruido: 1 } }
    ]
  ];

  var rawState = loadState();
  var state;
  if (!rawState || rawState.gameVersion !== GAME_VERSION) {
    state = {
      step: 'start',
      room: 0,
      scores: {},
      archetype: null,
      unlocked: false,
      keyVerified: false,
      code: null,
      notified: false,
      gameVersion: GAME_VERSION
    };
  } else {
    state = rawState;
    if (state.unlocked && !state.keyVerified) {
      state.unlocked = false;
      state.step = 'start';
      state.room = 0;
    }
  }
  try {
    localStorage.removeItem('erior_mapa_v1');
    localStorage.removeItem('erior_mapa_v2');
  } catch (e) {}

  var root = document.getElementById('app');
  var bar = document.getElementById('progressBar');
  var worldImg = null;
  var flash = document.getElementById('flash');

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function resetGame() {
    state = {
      step: 'start',
      room: 0,
      scores: {},
      archetype: null,
      unlocked: false,
      keyVerified: false,
      code: null,
      notified: false,
      gameVersion: GAME_VERSION
    };
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('erior_mapa_v1');
      localStorage.removeItem('erior_mapa_v2');
    } catch (e) {}
    saveState();
    pulseFlash();
    render();
  }

  function saveState() {
    try {
      state.gameVersion = GAME_VERSION;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (state.unlocked && state.keyVerified) {
        localStorage.setItem(
          'erior_mapa_credit',
          JSON.stringify({ mxn: CREDIT_MXN, usd: CREDIT_USD, archetype: state.archetype, code: state.code, at: Date.now() })
        );
      }
    } catch (e) {}
  }

  function addScores(scores) {
    Object.keys(scores).forEach(function (k) {
      state.scores[k] = (state.scores[k] || 0) + scores[k];
    });
  }

  function winner() {
    var best = 'loop';
    var max = -1;
    Object.keys(state.scores).forEach(function (k) {
      if (state.scores[k] > max) {
        max = state.scores[k];
        best = k;
      }
    });
    return best;
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

  var currentSceneIdx = 0;
  function setScene(idx) {
    currentSceneIdx = idx;
    var mode = SCENE_MODES[idx % SCENE_MODES.length];
    document.body.classList.remove('scene-matrix', 'scene-dna', 'scene-hole');
    document.body.classList.add('scene-' + mode);
  }

  function setMood(name) {
    var sceneClass = '';
    document.body.className.split(/\s+/).forEach(function (c) {
      if (c.indexOf('scene-') === 0) sceneClass = c;
    });
    document.body.className = document.body.className
      .split(/\s+/)
      .filter(function (c) {
        return c && c.indexOf('mood-') !== 0 && c.indexOf('scene-') !== 0;
      })
      .join(' ');
    document.body.classList.add('mood-' + name);
    if (sceneClass) document.body.classList.add(sceneClass);
    else setScene(currentSceneIdx);
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

  function setProgress(p) {
    if (bar) bar.style.width = Math.max(0, Math.min(100, p)) + '%';
  }

  function priceDiff(pack) {
    if (LANG === 'en') return Math.max(0, { 1: 46, 2: 85, 3: 135 }[pack] - CREDIT_USD);
    return Math.max(0, { 1: 777, 2: 1444, 3: 2299 }[pack] - CREDIT_MXN);
  }

  function formatDiff(pack) {
    var d = priceDiff(pack);
    return LANG === 'en' ? '$' + d + ' USD' : '$' + d.toLocaleString('es-MX') + ' MXN';
  }

  function archCopy(id) {
    return ARCH[id][LANG];
  }

  function tone() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!tone.ctx) tone.ctx = new Ctx();
      var ctx = tone.ctx;
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 220 + Math.random() * 280;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
      o.stop(ctx.currentTime + 0.5);
    } catch (e) {}
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
          '.\nGenera clave en /mapa/admin.html y envíasela.'
        : '🟣 MAPA INICIÓ PAGO\nCódigo: ' + state.code + '\nPatrón: ' + a;
    Promise.all([
      fetch('https://api.callmebot.com/whatsapp.php?phone=5214432311761&text=' + encodeURIComponent(msg) + '&apikey=6870409'),
      fetch('https://api.callmebot.com/whatsapp.php?phone=5214791936105&text=' + encodeURIComponent(msg) + '&apikey=2412047')
    ]).catch(function () {});
  }

  function finishRoom(scores) {
    tone();
    pulseFlash();
    addScores(scores);
    if (state.room >= OUTCOMES.length - 1) {
      state.archetype = winner();
      state.code = state.code || makeCode();
      state.step = 'mini';
    } else {
      state.room = state.room + 1;
    }
    saveState();
    render();
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t0 = a[i];
      a[i] = a[j];
      a[j] = t0;
    }
    return a;
  }

  /** Click-to-pick then click-to-place (mobile friendly) */
  function bindPickPlace(trayEl, slotsEl, onChange) {
    var selected = null;
    function clearSel() {
      trayEl.querySelectorAll('.piece').forEach(function (p) {
        p.classList.remove('selected');
      });
      selected = null;
    }
    trayEl.addEventListener('click', function (e) {
      var piece = e.target.closest('.piece');
      if (!piece || !trayEl.contains(piece)) return;
      if (selected === piece) {
        clearSel();
        return;
      }
      clearSel();
      selected = piece;
      piece.classList.add('selected');
      tone();
    });
    slotsEl.addEventListener('click', function (e) {
      var slot = e.target.closest('.slot');
      if (!slot || !slotsEl.contains(slot)) return;
      if (slot.firstChild && !selected) {
        trayEl.appendChild(slot.firstChild);
        slot.classList.remove('filled');
        if (onChange) onChange();
        return;
      }
      if (!selected) return;
      if (slot.firstChild) trayEl.appendChild(slot.firstChild);
      slot.appendChild(selected);
      slot.classList.add('filled');
      clearSel();
      if (onChange) onChange();
    });
  }

  function roomShell(inner) {
    var meta = t.rooms[state.room];
    return (
      '<section class="stage">' +
      '<p class="kicker">' +
      meta.kicker +
      '</p>' +
      '<h2>' +
      meta.title +
      '</h2>' +
      '<p class="lead">' +
      meta.lead +
      '</p>' +
      inner +
      '<p class="game-status" id="gameStatus"></p></section>'
    );
  }

  function gameSortDoors() {
    var words = LANG === 'en' ? ['CLOSE', 'YOUR', 'EYES', 'CHOOSE'] : ['CIERRA', 'LOS', 'OJOS', 'ELIGE'];
    var correct = words.join(' ');
    var doors = OUTCOMES[0];
    root.innerHTML = roomShell(
      '<p class="game-hint">' +
        (LANG === 'en'
          ? 'Order the 4 words. Then drop the key 🔑 on a door.'
          : 'Ordena las 4 palabras. Luego suelta la llave 🔑 en una puerta.') +
        '</p>' +
        '<div class="slots" id="slots"></div>' +
        '<div class="tray" id="tray"></div>' +
        '<div id="doorsWrap" style="display:none"></div>'
    );
    var slots = document.getElementById('slots');
    var tray = document.getElementById('tray');
    words.forEach(function () {
      var s = document.createElement('div');
      s.className = 'slot';
      slots.appendChild(s);
    });
    shuffle(words).forEach(function (w) {
      var p = document.createElement('button');
      p.type = 'button';
      p.className = 'piece';
      p.textContent = w;
      p.dataset.w = w;
      tray.appendChild(p);
    });
    function readPhrase() {
      return Array.prototype.map
        .call(slots.children, function (s) {
          return s.firstChild ? s.firstChild.dataset.w : '';
        })
        .join(' ');
    }
    function unlockDoors() {
      var wrap = document.getElementById('doorsWrap');
      wrap.style.display = 'block';
      wrap.innerHTML =
        '<p class="game-hint ok-pulse">' +
        (LANG === 'en' ? 'Phrase unlocked. Choose a door.' : 'Frase abierta. Elige una puerta.') +
        '</p><div class="doors-row" id="doors"></div>';
      var doorsEl = document.getElementById('doors');
      doors.forEach(function (d, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'door-drop openable';
        b.innerHTML =
          '<span class="bg"></span><span class="lbl"><strong>' +
          (LANG === 'en' ? d.labelEn : d.labelEs) +
          '</strong><span>🔑</span></span>';
        b.dataset.v = String(i);
        b.onclick = function () {
          finishRoom(d.scores);
        };
        doorsEl.appendChild(b);
      });
    }
    bindPickPlace(tray, slots, function () {
      var status = document.getElementById('gameStatus');
      if (readPhrase() === correct) {
        status.textContent = LANG === 'en' ? 'Correct' : 'Correcto';
        tray.querySelectorAll('.piece').forEach(function (p) {
          p.classList.add('ghost');
        });
        unlockDoors();
      } else {
        status.textContent = '';
      }
    });
  }

  function gameCipher() {
    var opts = OUTCOMES[1];
    // Pick one target phrase randomly for the cipher board — player builds whichever they believe; scoring by which phrase they complete
    var letters = [];
    opts.forEach(function (o) {
      var phrase = LANG === 'en' ? o.labelEn : o.labelEs;
      phrase.replace(/[^A-ZÁÉÍÓÚÑ]/gi, '').toUpperCase().split('').forEach(function (ch) {
        letters.push(ch);
      });
    });
    // Too many letters - better: one scrambled target but allow building any of 3 by choosing tiles from a shared pool of unique letters for the chosen phrase
    // Simpler approach: show 3 ciphered options as tiles groups - player sorts ONE phrase from its own scrambled letters

    var pick = opts[Math.floor(Math.random() * opts.length)];
    // Actually user should choose which voice - so show all 3 as mini sort puzzles? Too heavy.
    // Better: letter bank from all 3 phrases (unique), slots for max length, and check if slots match any phrase

    var phrases = opts.map(function (o) {
      return (LANG === 'en' ? o.labelEn : o.labelEs).toUpperCase().replace(/\s+/g, ' ').trim();
    });
    var bank = shuffle(
      phrases
        .join('')
        .replace(/[^A-ZÁÉÍÓÚÑ]/g, '')
        .split('')
    );
    // Deduplicate bank length - use letters only from a random phrase but reveal cipher of all three as hints
    var targetLetters = shuffle(phrases[Math.floor(Math.random() * 3)].replace(/ /g, '').split(''));

    root.innerHTML = roomShell(
      '<p class="game-hint">' +
        (LANG === 'en'
          ? 'Cipher hint: vowels became symbols. Rebuild ONE voice below.'
          : 'Pista cifrada: las vocales son símbolos. Arma UNA de las voces.') +
        '</p>' +
        '<div class="cipher-box">' +
        phrases
          .map(function (p) {
            return p
              .replace(/A/g, '@')
              .replace(/E/g, '3')
              .replace(/I/g, '1')
              .replace(/O/g, '0')
              .replace(/U/g, 'µ');
          })
          .join('<br>') +
        '</div>' +
        '<div class="slots" id="slots"></div>' +
        '<div class="tray" id="tray"></div>' +
        '<div class="cta-row"><button type="button" class="btn" id="btnCheck">' +
        (LANG === 'en' ? 'Check phrase' : 'Comprobar frase') +
        '</button></div>'
    );

    // Use letters from all phrases combined unique pool for flexibility - take first phrase's letters + extras
    var pool = shuffle(
      Array.from(
        new Set(
          phrases
            .join('')
            .replace(/[^A-ZÁÉÍÓÚÑ]/g, '')
            .split('')
        )
      )
    );
    // Need enough letters - for spaces use word slots instead of letter slots
    // Switch to WORD tiles for each phrase's words
    var allWords = [];
    opts.forEach(function (o, oi) {
      var phrase = (LANG === 'en' ? o.labelEn : o.labelEs).toUpperCase();
      phrase.split(/\s+/).forEach(function (w) {
        allWords.push({ w: w, oi: oi });
      });
    });
    root.innerHTML = roomShell(
      '<p class="game-hint">' +
        (LANG === 'en'
          ? 'Move word tiles into the row to rebuild the voice you must silence first.'
          : 'Mueve las palabras a la fila para armar la voz que hay que callar primero.') +
        '</p>' +
        '<div class="cipher-box">' +
        phrases
          .map(function (p) {
            return p
              .replace(/A/g, '@')
              .replace(/E/g, '3')
              .replace(/I/g, '1')
              .replace(/O/g, '0')
              .replace(/U/g, 'µ');
          })
          .join('<br>') +
        '</div>' +
        '<div class="slots" id="slots"></div>' +
        '<div class="tray" id="tray"></div>'
    );
    var slots = document.getElementById('slots');
    var tray = document.getElementById('tray');
    for (var i = 0; i < 4; i++) {
      var s = document.createElement('div');
      s.className = 'slot';
      slots.appendChild(s);
    }
    shuffle(allWords).forEach(function (item) {
      var p = document.createElement('button');
      p.type = 'button';
      p.className = 'piece';
      p.textContent = item.w;
      p.dataset.w = item.w;
      tray.appendChild(p);
    });
    bindPickPlace(tray, slots, function () {
      var built = Array.prototype.map
        .call(slots.children, function (s) {
          return s.firstChild ? s.firstChild.dataset.w : '';
        })
        .filter(Boolean)
        .join(' ');
      var status = document.getElementById('gameStatus');
      for (var i = 0; i < phrases.length; i++) {
        if (built === phrases[i]) {
          status.textContent = LANG === 'en' ? 'Decoded' : 'Descifrado';
          finishRoom(opts[i].scores);
          return;
        }
      }
      status.textContent = built ? (LANG === 'en' ? 'Keep decoding…' : 'Sigue descifrando…') : '';
    });
  }

  function gameAssemble() {
    var objs = OUTCOMES[2];
    var parts = [];
    objs.forEach(function (o, oi) {
      o.parts.forEach(function (part) {
        parts.push({ id: part, oi: oi, label: part.toUpperCase() });
      });
    });
    // decoy parts
    parts.push({ id: 'humo', oi: -1, label: 'HUMO' });
    parts.push({ id: 'eco', oi: -1, label: 'ECO' });
    root.innerHTML = roomShell(
      '<p class="game-hint">' +
        (LANG === 'en'
          ? 'Place 2 matching pieces on the same object to claim it.'
          : 'Coloca 2 piezas que coincidan en el mismo objeto para tomarlo.') +
        '</p>' +
        '<div class="assemble-grid" id="board"></div>' +
        '<div class="tray" id="tray"></div>'
    );
    var board = document.getElementById('board');
    var tray = document.getElementById('tray');
    objs.forEach(function (o, oi) {
      var card = document.createElement('div');
      card.className = 'assemble-card';
      card.dataset.oi = String(oi);
      card.innerHTML =
        '<div style="font-size:2rem">' +
        o.glyph +
        '</div><h4>' +
        (LANG === 'en' ? o.labelEn : o.labelEs) +
        '</h4><div class="assemble-slots slots" data-oi="' +
        oi +
        '"><div class="slot"></div><div class="slot"></div></div>';
      board.appendChild(card);
    });
    shuffle(parts).forEach(function (part) {
      var p = document.createElement('button');
      p.type = 'button';
      p.className = 'piece';
      p.textContent = part.label;
      p.dataset.oi = String(part.oi);
      p.dataset.id = part.id;
      tray.appendChild(p);
    });
    var selected = null;
    function clearSel() {
      tray.querySelectorAll('.piece').forEach(function (x) {
        x.classList.remove('selected');
      });
      selected = null;
    }
    tray.onclick = function (e) {
      var piece = e.target.closest('.piece');
      if (!piece) return;
      clearSel();
      selected = piece;
      piece.classList.add('selected');
      tone();
    };
    board.onclick = function (e) {
      var slot = e.target.closest('.slot');
      if (!slot) return;
      if (slot.firstChild && !selected) {
        tray.appendChild(slot.firstChild);
        slot.classList.remove('filled');
        return;
      }
      if (!selected) return;
      if (slot.firstChild) tray.appendChild(slot.firstChild);
      slot.appendChild(selected);
      slot.classList.add('filled');
      clearSel();
      // check each object
      board.querySelectorAll('.assemble-card').forEach(function (card) {
        var oi = +card.dataset.oi;
        var filled = card.querySelectorAll('.slot .piece');
        if (filled.length < 2) return;
        var ok = true;
        filled.forEach(function (p) {
          if (+p.dataset.oi !== oi) ok = false;
        });
        if (ok) finishRoom(objs[oi].scores);
      });
    };
  }

  function gameSequence() {
    var opts = OUTCOMES[3];
    var pick = opts[Math.floor(Math.random() * opts.length)];
    var symbols = ['✧', '◈', '⬡', '◎'];
    root.innerHTML = roomShell(
      '<p class="game-hint">' +
        (LANG === 'en'
          ? 'Watch the sequence, then repeat it. Your pattern reveals the locked phrase.'
          : 'Mira la secuencia y repítela. Tu patrón revela la frase cerrada.') +
        '</p>' +
        '<div class="seq-board" id="nodes"></div>' +
        '<div class="cta-row"><button type="button" class="btn btn-solid" id="btnReplay">' +
        (LANG === 'en' ? 'Show sequence again' : 'Ver secuencia otra vez') +
        '</button></div>'
    );
    var nodes = document.getElementById('nodes');
    symbols.forEach(function (sym, i) {
      var n = document.createElement('button');
      n.type = 'button';
      n.className = 'seq-node';
      n.textContent = sym;
      n.dataset.i = String(i);
      nodes.appendChild(n);
    });
    var input = [];
    var locked = true;
    function playSeq() {
      locked = true;
      input = [];
      var i = 0;
      function step() {
        nodes.querySelectorAll('.seq-node').forEach(function (n) {
          n.classList.remove('on');
        });
        if (i >= pick.seq.length) {
          locked = false;
          document.getElementById('gameStatus').textContent = LANG === 'en' ? 'Your turn' : 'Tu turno';
          return;
        }
        var el = nodes.querySelector('.seq-node[data-i="' + pick.seq[i] + '"]');
        if (el) {
          el.classList.add('on');
          tone();
        }
        i++;
        setTimeout(step, 650);
      }
      setTimeout(step, 400);
    }
    nodes.onclick = function (e) {
      if (locked) return;
      var n = e.target.closest('.seq-node');
      if (!n) return;
      var idx = +n.dataset.i;
      input.push(idx);
      n.classList.add('tap');
      tone();
      setTimeout(function () {
        n.classList.remove('tap');
      }, 200);
      if (input.length === pick.seq.length) {
        var ok = input.every(function (v, i) {
          return v === pick.seq[i];
        });
        if (ok) {
          document.getElementById('gameStatus').textContent = (LANG === 'en' ? pick.labelEn : pick.labelEs);
          setTimeout(function () {
            finishRoom(pick.scores);
          }, 500);
        } else {
          document.getElementById('gameStatus').textContent = LANG === 'en' ? 'Wrong pattern — watch again' : 'Patrón incorrecto — mira otra vez';
          input = [];
          setTimeout(playSeq, 700);
        }
      }
    };
    document.getElementById('btnReplay').onclick = playSeq;
    playSeq();
  }

  function gameJigsaw() {
    var opts = OUTCOMES[4];
    var ids = [0, 1, 2, 3, 4, 5];
    root.innerHTML = roomShell(
      '<p class="game-hint">' +
        (LANG === 'en'
          ? 'Look at the small preview. Tap a piece, then tap its empty slot. Numbers help: 1 goes top-left.'
          : 'Mira la vista previa. Toca una pieza y luego su hueco vacío. Los números ayudan: el 1 va arriba a la izquierda.') +
        '</p>' +
        '<div class="puzzle-preview" aria-hidden="true">' +
        '<span class="puzzle-preview-label">' +
        (LANG === 'en' ? 'Complete portal' : 'Portal completo') +
        '</span><div class="puzzle-preview-art"></div></div>' +
        '<div class="puzzle-board slots" id="puzzleBoard"></div>' +
        '<p class="puzzle-tray-label">' +
        (LANG === 'en' ? 'Pieces' : 'Piezas') +
        '</p>' +
        '<div class="puzzle-tray tray" id="puzzleTray"></div>' +
        '<div id="scenePick" style="display:none"></div>'
    );
    var board = document.getElementById('puzzleBoard');
    var tray = document.getElementById('puzzleTray');
    var cols = 3;
    ids.forEach(function (id) {
      var slot = document.createElement('div');
      slot.className = 'slot puzzle-slot';
      slot.dataset.expect = String(id);
      var col = id % cols;
      var row = Math.floor(id / cols);
      slot.innerHTML = '<span class="puzzle-ghost-num">' + (id + 1) + '</span>';
      slot.style.setProperty('--gx', String(col));
      slot.style.setProperty('--gy', String(row));
      board.appendChild(slot);
    });
    shuffle(ids).forEach(function (id) {
      var piece = document.createElement('button');
      piece.type = 'button';
      piece.className = 'piece puzzle-piece shape-' + id;
      piece.dataset.id = String(id);
      piece.setAttribute('aria-label', (LANG === 'en' ? 'Piece ' : 'Pieza ') + (id + 1));
      var col = id % cols;
      var row = Math.floor(id / cols);
      piece.style.setProperty('--px', String(col));
      piece.style.setProperty('--py', String(row));
      piece.innerHTML =
        '<span class="puzzle-face"></span><span class="puzzle-num">' + (id + 1) + '</span>';
      tray.appendChild(piece);
    });
    function showScenes() {
      var wrap = document.getElementById('scenePick');
      wrap.style.display = 'block';
      wrap.innerHTML =
        '<p class="game-hint ok-pulse">' +
        (LANG === 'en' ? 'Portal open. Which scene keeps looping?' : 'Portal abierto. ¿Qué escena se repite?') +
        '</p><div class="doors-row"></div>';
      var row = wrap.querySelector('.doors-row');
      opts.forEach(function (o) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'door-drop openable';
        b.innerHTML =
          '<span class="bg"></span><span class="lbl"><strong>' +
          (LANG === 'en' ? o.labelEn : o.labelEs) +
          '</strong></span>';
        b.onclick = function () {
          finishRoom(o.scores);
        };
        row.appendChild(b);
      });
    }
    var done = false;
    bindPickPlace(tray, board, function () {
      if (done) return;
      var slots = board.querySelectorAll('.puzzle-slot');
      var ok = true;
      var filled = 0;
      slots.forEach(function (slot) {
        var piece = slot.querySelector('.puzzle-piece');
        if (!piece) {
          ok = false;
          return;
        }
        filled += 1;
        if (piece.dataset.id !== slot.dataset.expect) ok = false;
      });
      var status = document.getElementById('gameStatus');
      if (ok && filled === 6) {
        done = true;
        status.textContent = LANG === 'en' ? 'Puzzle complete' : 'Rompecabezas completo';
        board.classList.add('solved');
        tray.querySelectorAll('.piece').forEach(function (p) {
          p.classList.add('ghost');
        });
        showScenes();
      } else if (filled === 6) {
        status.textContent = LANG === 'en' ? 'Almost — check the numbers' : 'Casi — revisa los números';
      } else {
        status.textContent = '';
      }
    });
  }

  function renderStart() {
    setProgress(5);
    setMood('0');
    setScene(0);
    root.innerHTML =
      '<section class="stage">' +
      '<div class="hero-orb" aria-hidden="true"><img src="/img/alicia-orb.png" alt=""></div>' +
      '<p class="kicker">' +
      t.kickerStart +
      '</p>' +
      '<h1>' +
      t.titleStart +
      '</h1>' +
      '<p class="lead">' +
      t.leadStart +
      '</p>' +
      '<div class="cta-row"><button type="button" class="btn btn-solid" id="btnStart">' +
      t.startCta +
      '</button></div>' +
      '<p class="foot-note">ERIOR · juego-puzzle gratis · mini revelación gratis · archivo $' +
      (LANG === 'en' ? '26 USD' : '444 MXN') +
      ' con clave tras pago verificado</p></section>';
    document.getElementById('btnStart').onclick = function () {
      tone();
      pulseFlash();
      state.step = 'room';
      state.room = 0;
      state.scores = {};
      state.unlocked = false;
      state.keyVerified = false;
      state.archetype = null;
      state.notified = false;
      state.code = null;
      state.gameVersion = GAME_VERSION;
      saveState();
      render();
    };
  }

  function renderRoom() {
    var r = state.room;
    setProgress(12 + r * 14);
    setMood(String(r + 1));
    setScene(r + 1);
    if (r === 0) gameSortDoors();
    else if (r === 1) gameCipher();
    else if (r === 2) gameAssemble();
    else if (r === 3) gameSequence();
    else gameJigsaw();
  }

  function renderMini() {
    setProgress(78);
    setMood('5');
    setScene(5);
    var a = archCopy(state.archetype);
    root.innerHTML =
      '<section class="stage">' +
      '<p class="kicker">' +
      t.miniTag +
      '</p>' +
      '<h2>' +
      t.miniTitle +
      '</h2>' +
      '<div class="card"><span class="tag">' +
      (LANG === 'en' ? 'Dominant pattern' : 'Patrón dominante') +
      '</span><h3>' +
      a.name +
      '</h3><p>' +
      a.mini +
      '</p></div>' +
      '<div class="card"><h3 style="font-size:1.25rem">' +
      t.unlockTitle +
      '</h3><p style="margin-top:.35rem">' +
      t.unlockLead +
      '</p>' +
      '<div class="cta-row"><button type="button" class="btn btn-solid" id="btnUnlock">' +
      t.unlockCta +
      '</button></div></div></section>';
    document.getElementById('btnUnlock').onclick = function () {
      tone();
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
      if (method === 'alt') {
        return '<p>Crypto / WU — WhatsApp Pauline with code <b>' + state.code + '</b>.</p>';
      }
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
    if (method === 'alt') {
      return '<p>Crypto / WU — WhatsApp con código <b>' + state.code + '</b>.</p>';
    }
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
    setScene(6);
    if (!state.code) {
      state.code = makeCode();
      saveState();
    }
    var methods = t.methods;
    var active = methods[0].id;
    root.innerHTML =
      '<section class="stage">' +
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
      '<strong class="order-card-code" id="orderCode">' +
      state.code +
      '</strong>' +
      '<button type="button" class="btn btn-ghost copy-btn" id="btnCopyCode" data-c="' +
      state.code +
      '">' +
      t.copyCode +
      '</button></div>' +
      '<div class="pay-box"><div class="pay-tabs" id="payTabs"></div><div class="pay-panel" id="payPanel"></div></div>' +
      '<div class="cta-row" style="margin-top:1.1rem">' +
      '<button type="button" class="btn btn-solid" id="btnPaid">' +
      t.paidCta +
      '</button>' +
      '<a class="btn btn-ghost" id="waPay" target="_blank" rel="noopener">' +
      t.waPay +
      '</a>' +
      '<button type="button" class="btn btn-ghost" id="btnReplay">' +
      (LANG === 'en' ? '← Play the game first' : '← Primero jugar el mapa') +
      '</button></div>' +
      '<div class="waiting" id="waitNote">' +
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
      '<p class="err" id="keyErr"></p>' +
      '</div></section>';

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

    var a = archCopy(state.archetype);
    var waMsg =
      LANG === 'en'
        ? 'Hi! I paid the Unconscious Map ($26 USD). Code: ' + state.code + '. Pattern: ' + a.name + '. Please send my access key.'
        : 'Hola! Ya pagué el Mapa del Inconsciente ($444 MXN). Código: ' + state.code + '. Patrón: ' + a.name + '. Por favor envíenme la clave de acceso.';
    document.getElementById('waPay').href = waUrl(waMsg);

    document.getElementById('btnPaid').onclick = function () {
      notifyTeam('paid');
      state.notified = true;
      saveState();
      tone();
    };

    var replay = document.getElementById('btnReplay');
    if (replay) replay.onclick = resetGame;

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
          var msg =
            LANG === 'en'
              ? 'Wrong key for ' +
                state.code +
                '. Generate it in /mapa/admin.html with this exact code + password mapa444.'
              : 'Clave incorrecta para ' +
                state.code +
                '. Genérala en /mapa/admin.html con este mismo código + password mapa444.';
          throw new Error(msg);
        }
        state.unlocked = true;
        state.keyVerified = true;
        state.step = 'full';
        saveState();
        pulseFlash();
        tone();
        render();
      } catch (e) {
        err.textContent = e.message || String(e);
      }
    };
  }

  function renderFull() {
    setProgress(100);
    setMood('full');
    setScene(0);
    var a = archCopy(state.archetype);
    var audios = ARCH[state.archetype].audios;
    var blocks = a.blocks
      .map(function (b) {
        return '<div class="blok"><b>' + b.t + '</b><span>' + b.d + '</span></div>';
      })
      .join('');
    var audioHtml = audios
      .map(function (au) {
        return (
          '<div class="audio-card"><img src="' +
          au.img +
          '" alt=""><div><h4>' +
          au.name +
          '</h4><p>' +
          (LANG === 'en' ? au.whyEn : au.whyEs) +
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
          'Hi! Unconscious Map paid (' + state.code + '). Pack ' + pack + ': ' + list + '. Difference only: ' + formatDiff(pack) + ' ($26 credit).'
        );
      }
      return waUrl(
        'Hola! Mapa pagado (' + state.code + '). Pack ' + pack + ': ' + list + '. Solo diferencia: ' + formatDiff(pack) + ' (crédito $444).'
      );
    }
    root.innerHTML =
      '<section class="stage">' +
      '<p class="kicker">' +
      t.fullTag +
      ' · ' +
      state.code +
      '</p>' +
      '<h2>' +
      a.name +
      '</h2>' +
      '<p class="lead">' +
      a.mini +
      '</p>' +
      '<div class="card"><span class="tag">' +
      (LANG === 'en' ? 'Unconscious script' : 'Guión del inconsciente') +
      '</span><p style="font-family:var(--serif);font-size:1.3rem;color:var(--ink)">' +
      a.script +
      '</p></div>' +
      '<div class="bloks">' +
      blocks +
      '</div>' +
      '<div class="card"><h3 style="font-size:1.15rem">' +
      (LANG === 'en' ? 'Micro-ritual' : 'Micro-ritual') +
      '</h3><p style="margin-top:.35rem">' +
      a.ritual +
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
    else if (state.step === 'room') renderRoom();
    else if (state.step === 'mini') renderMini();
    else if (state.step === 'pay') renderPay();
    else if (state.step === 'full') {
      if (!(state.unlocked && state.keyVerified)) {
        state.step = 'pay';
        renderPay();
      } else renderFull();
    } else renderStart();
  }

  // Matrix rain + DNA helix particles
  (function initFx() {
    var cMatrix = document.getElementById('fxMatrix');
    var cDna = document.getElementById('fxDna');
    if (!cMatrix || !cDna) return;
    var mtx = cMatrix.getContext('2d');
    var dna = cDna.getContext('2d');
    var cols = [];
    var helix = [];
    var chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01アイウエオカキクケコサシスセソΑΒΓΔλΨΩ∞∴∵';
    function resize() {
      cMatrix.width = cDna.width = window.innerWidth;
      cMatrix.height = cDna.height = window.innerHeight;
      var n = Math.floor(cMatrix.width / 16);
      cols = [];
      for (var i = 0; i < n; i++) {
        cols.push({ x: i * 16, y: Math.random() * cMatrix.height, speed: 1.2 + Math.random() * 3.5 });
      }
      helix = [];
      for (var h = 0; h < 28; h++) {
        helix.push({
          t: Math.random() * Math.PI * 2,
          y: Math.random() * cDna.height,
          speed: 0.4 + Math.random() * 0.9,
          amp: 40 + Math.random() * 70,
          r: 1.5 + Math.random() * 2.5
        });
      }
    }
    function tick() {
      // Matrix
      mtx.fillStyle = 'rgba(5,4,10,0.12)';
      mtx.fillRect(0, 0, cMatrix.width, cMatrix.height);
      mtx.font = '14px "Share Tech Mono", monospace';
      cols.forEach(function (c) {
        var ch = chars.charAt(Math.floor(Math.random() * chars.length));
        mtx.fillStyle = Math.random() > 0.92 ? '#fff' : '#5ef0c0';
        mtx.fillText(ch, c.x, c.y);
        c.y += c.speed;
        if (c.y > cMatrix.height + 20) {
          c.y = -20;
          c.speed = 1.2 + Math.random() * 3.5;
        }
      });
      // DNA
      dna.clearRect(0, 0, cDna.width, cDna.height);
      var cx = cDna.width * 0.5;
      helix.forEach(function (p, i) {
        p.t += 0.035;
        p.y += p.speed;
        if (p.y > cDna.height + 20) p.y = -20;
        var x1 = cx + Math.sin(p.t) * p.amp;
        var x2 = cx + Math.sin(p.t + Math.PI) * p.amp;
        dna.strokeStyle = 'rgba(125,249,255,0.18)';
        dna.beginPath();
        dna.moveTo(x1, p.y);
        dna.lineTo(x2, p.y);
        dna.stroke();
        dna.beginPath();
        dna.fillStyle = i % 2 ? 'rgba(255,107,203,0.85)' : 'rgba(77,163,255,0.85)';
        dna.arc(x1, p.y, p.r, 0, Math.PI * 2);
        dna.fill();
        dna.beginPath();
        dna.fillStyle = i % 2 ? 'rgba(94,240,192,0.85)' : 'rgba(255,230,109,0.75)';
        dna.arc(x2, p.y, p.r, 0, Math.PI * 2);
        dna.fill();
      });
      requestAnimationFrame(tick);
    }
    resize();
    tick();
    window.addEventListener('resize', resize);
  })();

  document.getElementById('brandLink').textContent = t.brand;
  document.getElementById('brandLink').href = t.homeHref;
  document.getElementById('langLink').textContent = t.langOther;
  document.getElementById('langLink').href = t.langHref;
  var resetBtn = document.getElementById('btnReset');
  if (resetBtn) {
    resetBtn.textContent = LANG === 'en' ? 'Restart' : 'Reiniciar';
    resetBtn.onclick = function () {
      if (window.confirm(LANG === 'en' ? 'Restart the game from level 1?' : '¿Reiniciar el juego desde el nivel 1?')) resetGame();
    };
  }

  try {
    var q = new URLSearchParams(window.location.search);
    if (q.get('play') === '1' || q.get('reset') === '1') resetGame();
  } catch (e) {}

  render();
})();
