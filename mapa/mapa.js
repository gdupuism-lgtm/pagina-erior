(function () {
  'use strict';

  var LANG = (document.documentElement.lang || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';
  var WA = '5214432311761';
  var STORAGE_KEY = 'erior_mapa_v2';
  var CREDIT_MXN = 444;
  var CREDIT_USD = 26;
  var UNLOCK_FN = '/.netlify/functions/mapa-unlock';

  var SCENES = [
    '/img/catalog/wonderland-coherence.jpg',
    '/img/catalog/imagine.jpg',
    '/img/catalog/god-goddess.jpg',
    '/img/catalog/simulation-u.jpg',
    '/img/catalog/white-rabbit-code.jpg',
    '/img/catalog/limitless.jpg',
    '/img/mental-tech-cover.png'
  ];

  var I18N = {
    es: {
      brand: 'Erior',
      langOther: 'EN',
      langHref: '/en/mapa/',
      homeHref: '/',
      kickerStart: 'Capa 0 · Umbral',
      titleStart: 'El mapa del inconsciente',
      leadStart: 'No es un formulario. Es una experiencia: puertas, objetos, voces y un archivo que solo se abre cuando el pago es real.',
      startCta: 'Entrar al mapa',
      miniTag: 'Revelación parcial',
      miniTitle: 'Esto es solo el borde',
      unlockTitle: 'Archivo completo · $444 MXN',
      unlockLead: 'Patrón completo, 4 bloqueos, guión inconsciente y 2–3 frecuencias. Los $444 se descuentan si luego activas audio(s).',
      unlockCta: 'Continuar al pago ($444 MXN)',
      payTitle: 'Paga y pide tu clave',
      payLead: 'Monto: $444 MXN. Pon tu código en el concepto / asunto. Envía comprobante. Pauline te manda la clave — sin clave no se abre el archivo.',
      paidCta: 'Ya pagué — avisar y pedir clave',
      keyLabel: 'Clave de acceso (la envía Pauline)',
      keyPlaceholder: 'XXXXXXXX',
      keyCta: 'Abrir archivo con clave',
      keyWait: 'Después de pagar, Pauline verifica el comprobante y te envía una clave de 8 caracteres. Escríbela aquí. “Ya pagué” solo avisa al equipo — no desbloquea solo.',
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
        { kicker: 'Capa 1 · Tres puertas', title: '¿Cuál se abre sola cuando cierras los ojos?', lead: 'Toca la puerta. Siente cuál ya conoces.' },
        { kicker: 'Capa 2 · El ruido', title: '¿Qué voz hay que callar primero?', lead: 'Elige la que más te gobierna sin permiso.' },
        { kicker: 'Capa 3 · Objeto', title: 'En la habitación hay un objeto. ¿Cuál tomas?', lead: 'No es metáfora. Es tu estrategia.' },
        { kicker: 'Capa 4 · Clave', title: 'Una frase abre la cerradura. ¿Cuál es tuya?', lead: 'La que incomoda casi siempre es la verdadera.' },
        { kicker: 'Capa 5 · Espejo', title: 'Si tu vida fuera una serie… ¿qué escena se repite?', lead: 'Última pieza. El inconsciente ama los bucles.' }
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
      leadStart: 'Not a form. An experience: doors, objects, voices — and a file that only opens when payment is real.',
      startCta: 'Enter the map',
      miniTag: 'Partial reveal',
      miniTitle: 'This is only the edge',
      unlockTitle: 'Full file · $26 USD',
      unlockLead: 'Full pattern, 4 blocks, unconscious script and 2–3 frequencies. The $26 is credited if you activate audio(s) after.',
      unlockCta: 'Continue to payment ($26 USD)',
      payTitle: 'Pay, then get your key',
      payLead: 'Amount: $26 USD. Put your code in the memo/subject. Send the receipt. Pauline sends the key — no key, no file.',
      paidCta: 'I paid — notify & request key',
      keyLabel: 'Access key (sent by Pauline)',
      keyPlaceholder: 'XXXXXXXX',
      keyCta: 'Open file with key',
      keyWait: 'After you pay, Pauline verifies the receipt and sends an 8-character key. Enter it here. “I paid” only notifies the team — it does not unlock alone.',
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
        { kicker: 'Layer 1 · Three doors', title: 'Which one opens by itself when you close your eyes?', lead: 'Touch the door. Feel which one you already know.' },
        { kicker: 'Layer 2 · The noise', title: 'Which voice must go quiet first?', lead: 'Pick the one running you without permission.' },
        { kicker: 'Layer 3 · Object', title: 'There’s an object in the room. Which do you take?', lead: 'Not a cute metaphor. Your strategy.' },
        { kicker: 'Layer 4 · Key', title: 'One sentence opens the lock. Which is yours?', lead: 'The one that stings is almost always true.' },
        { kicker: 'Layer 5 · Mirror', title: 'If your life were a series… which scene keeps looping?', lead: 'Last piece. The unconscious loves loops.' }
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

  var CHOICES = [
    [
      { glyph: '🜔', labelEs: 'Puerta de metal', subEs: 'Fría, candado brillante', labelEn: 'Metal door', subEn: 'Cold, shiny lock', img: '/img/catalog/booster-2-0.jpg', scores: { loop: 2, ruido: 1 } },
      { glyph: '🪞', labelEs: 'Puerta de espejo', subEs: 'Te ves… a medias', labelEn: 'Mirror door', subEn: 'You see yourself… halfway', img: '/img/catalog/mesmerizing-love.jpg', scores: { espejo: 2, vacio: 1 } },
      { glyph: '🌫️', labelEs: 'Puerta de niebla', subEs: 'No sabes qué hay — y llama', labelEn: 'Fog door', subEn: 'Unknown — and it calls', img: '/img/catalog/imagine.jpg', scores: { sueno: 2, vacio: 1, carencia: 1 } }
    ],
    [
      { glyph: '⚠️', labelEs: '“¿Y si salgo mal?”', subEs: 'Control anticipado', labelEn: '“What if it goes wrong?”', subEn: 'Preemptive control', img: '/img/catalog/keep-cool.jpg', scores: { loop: 2, ruido: 1 } },
      { glyph: '💔', labelEs: '“No soy suficiente”', subEs: 'Espejo roto', labelEn: '“I’m not enough”', subEn: 'Cracked mirror', img: '/img/catalog/amor-propio-magic-4-0.jpg', scores: { espejo: 2, carencia: 1 } },
      { glyph: '⏳', labelEs: '“Después lo hago”', subEs: 'Posponer el salto', labelEn: '“I’ll do it later”', subEn: 'Postpone the leap', img: '/img/catalog/white-rabbit-code.jpg', scores: { sueno: 2, vacio: 1 } }
    ],
    [
      { glyph: '🗝️', labelEs: 'Llave oxidada', subEs: 'Pesada, de otro tiempo', labelEn: 'Rusted key', subEn: 'Heavy, from another time', img: '/img/catalog/identity.jpg', scores: { loop: 2, carencia: 1 } },
      { glyph: '🎧', labelEs: 'Un auricular solo', subEs: 'Frecuencia lejana', labelEn: 'Single earbud', subEn: 'Distant frequency', img: '/img/catalog/limitless.jpg', scores: { ruido: 2, sueno: 1 } },
      { glyph: '✉️', labelEs: 'Carta sin abrir', subEs: 'Tu nombre mal escrito', labelEn: 'Unopened letter', subEn: 'Your name misspelled', img: '/img/catalog/god-goddess.jpg', scores: { vacio: 2, espejo: 1 } }
    ],
    [
      { glyph: '🔁', labelEs: '“Esto ya lo viví”', subEs: 'Déjà vu-trampa', labelEn: '“I’ve lived this”', subEn: 'Trap déjà vu', img: '/img/catalog/simulation-u.jpg', scores: { loop: 2, ruido: 1 } },
      { glyph: '👁', labelEs: '“Me están mirando”', subEs: 'Aunque no haya nadie', labelEn: '“They’re watching”', subEn: 'Even when alone', img: '/img/catalog/seduction.jpg', scores: { espejo: 2, ruido: 1 } },
      { glyph: '🌑', labelEs: '“Aún no es mi momento”', subEs: 'La frase más cara', labelEn: '“Not my time yet”', subEn: 'Most expensive sentence', img: '/img/catalog/money-tech.jpg', scores: { sueno: 2, carencia: 1, vacio: 1 } }
    ],
    [
      { glyph: '🎬', labelEs: 'Casi lo logras… y cae', subEs: 'Cliffhanger eterno', labelEn: 'Almost… then it drops', subEn: 'Eternal cliffhanger', img: '/img/catalog/master-abundance.jpg', scores: { carencia: 2, loop: 1 } },
      { glyph: '🚪', labelEs: 'Eligen a otra persona', subEs: 'Tú en el pasillo', labelEn: 'They choose someone else', subEn: 'You in the hallway', img: '/img/catalog/erior-love.jpg', scores: { espejo: 2, vacio: 1 } },
      { glyph: '🗺️', labelEs: 'Tienes el mapa… no das el paso', subEs: 'Vestíbulo infinito', labelEn: 'You have the map… no step', subEn: 'Infinite lobby', img: '/img/catalog/wonderland-coherence.jpg', scores: { sueno: 2, ruido: 1 } }
    ]
  ];

  var state = loadState() || {
    step: 'start',
    room: 0,
    scores: {},
    archetype: null,
    unlocked: false,
    code: null,
    notified: false
  };

  // Force re-lock if someone had v1 free unlock
  if (state.unlocked && !state.keyVerified) {
    state.unlocked = false;
    state.step = state.archetype ? 'pay' : state.step;
  }

  var root = document.getElementById('app');
  var bar = document.getElementById('progressBar');
  var worldImg = document.getElementById('worldImg');
  var flash = document.getElementById('flash');

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function saveState() {
    try {
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

  function setScene(idx) {
    if (!worldImg) return;
    var url = SCENES[idx % SCENES.length];
    worldImg.classList.remove('is-zoom');
    worldImg.style.backgroundImage = 'url("' + url + '")';
    requestAnimationFrame(function () {
      worldImg.classList.add('is-zoom');
    });
  }

  function setMood(name) {
    document.body.className = document.body.className
      .split(/\s+/)
      .filter(function (c) {
        return c && c.indexOf('mood-') !== 0;
      })
      .join(' ');
    document.body.classList.add('mood-' + name);
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
      '<p class="foot-note">ERIOR · puzzle gratis · mini revelación gratis · archivo $' +
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
      saveState();
      render();
    };
  }

  function renderRoom() {
    var r = state.room;
    var meta = t.rooms[r];
    var opts = CHOICES[r];
    setProgress(12 + r * 14);
    setMood(String(r + 1));
    setScene(r + 1);
    var html =
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
      '<div class="choices' +
      (r === 0 ? ' doors' : '') +
      '">';
    opts.forEach(function (o, i) {
      html +=
        '<button type="button" class="choice" data-i="' +
        i +
        '">' +
        '<span class="choice-media" style="background-image:url(\'' +
        o.img +
        '\')"></span>' +
        '<span class="choice-shade"></span>' +
        '<span class="choice-body"><span class="choice-glyph">' +
        o.glyph +
        '</span><strong>' +
        (LANG === 'en' ? o.labelEn : o.labelEs) +
        '</strong><span>' +
        (LANG === 'en' ? o.subEn : o.subEs) +
        '</span></span></button>';
    });
    html += '</div></section>';
    root.innerHTML = html;
    root.querySelectorAll('.choice').forEach(function (btn) {
      btn.onclick = function () {
        var i = +btn.getAttribute('data-i');
        tone();
        pulseFlash();
        addScores(opts[i].scores);
        if (r >= CHOICES.length - 1) {
          state.archetype = winner();
          state.code = state.code || makeCode();
          state.step = 'mini';
        } else {
          state.room = r + 1;
        }
        saveState();
        render();
      };
    });
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
      state.code +
      '</p>' +
      '<h2>' +
      t.payTitle +
      '</h2>' +
      '<p class="lead">' +
      t.payLead +
      '</p>' +
      '<div class="pay-box"><div class="pay-tabs" id="payTabs"></div><div class="pay-panel" id="payPanel"></div></div>' +
      '<div class="cta-row" style="margin-top:1.1rem">' +
      '<button type="button" class="btn btn-solid" id="btnPaid">' +
      t.paidCta +
      '</button>' +
      '<a class="btn btn-ghost" id="waPay" target="_blank" rel="noopener">' +
      t.waPay +
      '</a></div>' +
      '<div class="waiting" id="waitNote" style="display:none">' +
      t.keyWait +
      '</div>' +
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
      document.getElementById('waitNote').style.display = 'block';
      tone();
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
        if (!data.ok) throw new Error(data.error || 'Clave incorrecta');
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

  // Particles
  (function initFx() {
    var c = document.getElementById('fx');
    if (!c) return;
    var ctx = c.getContext('2d');
    var pts = [];
    function resize() {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    }
    function spawn() {
      pts = [];
      for (var i = 0; i < 48; i++) {
        pts.push({
          x: Math.random() * c.width,
          y: Math.random() * c.height,
          r: Math.random() * 2.2 + 0.4,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -0.15 - Math.random() * 0.35,
          a: Math.random() * 0.5 + 0.15
        });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = c.height + 10;
          p.x = Math.random() * c.width;
        }
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,220,255,' + p.a + ')';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    resize();
    spawn();
    tick();
    window.addEventListener('resize', function () {
      resize();
      spawn();
    });
  })();

  document.getElementById('brandLink').textContent = t.brand;
  document.getElementById('brandLink').href = t.homeHref;
  document.getElementById('langLink').textContent = t.langOther;
  document.getElementById('langLink').href = t.langHref;

  render();
})();
