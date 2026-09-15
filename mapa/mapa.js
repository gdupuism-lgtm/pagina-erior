(function () {
  'use strict';

  var LANG = (document.documentElement.lang || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';
  var WA = '5214432311761';
  var STORAGE_KEY = 'erior_mapa_v1';
  var CREDIT_MXN = 444;
  var CREDIT_USD = 26;

  var I18N = {
    es: {
      brand: 'Erior',
      langOther: 'EN',
      langHref: '/en/mapa/',
      homeHref: '/',
      kickerStart: 'Capa 0 · Umbral',
      titleStart: 'El mapa del inconsciente',
      leadStart: 'No es un test. Es un puzzle de tu realidad. Cinco puertas. Una clave. Un patrón que ya está operando en ti — aunque digas que no lo ves.',
      startCta: 'Cruzar el umbral',
      miniTag: 'Revelación parcial',
      miniTitle: 'Esto es solo el borde',
      unlockTitle: 'Archivo completo · $444 MXN',
      unlockLead: 'El reporte completo nombra tu patrón, 4 bloqueos activos, el guión que repite tu mente y 2–3 frecuencias para reescribirlo. Si luego tomas audio(s), los $444 se descuentan.',
      unlockCta: 'Desbloquear archivo ($444 MXN)',
      payTitle: 'Paga y abre tu archivo',
      payLead: 'Monto: $444 MXN. Envía comprobante a eriorcenter@gmail.com con asunto “Mapa Inconsciente” + tu Instagram. Luego toca “Ya pagué”.',
      paidCta: 'Ya pagué — abrir reporte',
      waPay: 'Prefiero pagar por WhatsApp',
      fullTag: 'Archivo completo',
      creditNote: 'Crédito activo: $444 MXN. Si activas frecuencia(s) ahora, solo pagas la diferencia.',
      upsellTitle: 'Activa la frecuencia',
      upsellLead: 'Estas son las 3 señales que mejor cortan tu patrón. Elige 1, 2 o 3 — el diagnóstico ya está pagado.',
      buy1: '1 audio · pagar diferencia',
      buy2: '2 audios + libro · pagar diferencia',
      buy3: '3 audios + Alicia Premium · pagar diferencia',
      waReport: 'Enviar mi mapa a Pauline',
      backHome: 'Volver al centro',
      copy: 'Copiar',
      copied: '¡Copiado!',
      rooms: [
        { kicker: 'Capa 1 · Tres puertas', title: '¿Cuál se abre sola cuando cierras los ojos?', lead: 'No elijas la “correcta”. Elige la que ya conoces.' },
        { kicker: 'Capa 2 · El ruido', title: '¿Qué voz hay que callar primero?', lead: 'Una sola. La que más te gobierna sin permiso.' },
        { kicker: 'Capa 3 · Objeto', title: 'En la habitación hay un objeto. ¿Cuál tomas?', lead: 'El objeto no es metáfora bonita. Es tu estrategia.' },
        { kicker: 'Capa 4 · Clave', title: 'Una frase abre la cerradura. ¿Cuál es tuya?', lead: 'La que te incomoda un poco es casi siempre la verdadera.' },
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
      leadStart: 'This is not a quiz. It’s a puzzle of your reality. Five doors. One key. A pattern already running you — even if you swear you can’t see it.',
      startCta: 'Cross the threshold',
      miniTag: 'Partial reveal',
      miniTitle: 'This is only the edge',
      unlockTitle: 'Full file · $26 USD',
      unlockLead: 'The full report names your pattern, 4 active blocks, the script your mind repeats, and 2–3 frequencies to rewrite it. If you take audio(s) after, the $26 is credited.',
      unlockCta: 'Unlock full file ($26 USD)',
      payTitle: 'Pay & open your file',
      payLead: 'Amount: $26 USD. Send receipt to eriorcenter@gmail.com with subject “Unconscious Map” + your Instagram. Then tap “I paid”.',
      paidCta: 'I paid — open report',
      waPay: 'I’d rather pay on WhatsApp',
      fullTag: 'Full file',
      creditNote: 'Active credit: $26 USD. If you activate frequenc(ies) now, you only pay the difference.',
      upsellTitle: 'Activate the frequency',
      upsellLead: 'These 3 signals cut your pattern best. Choose 1, 2 or 3 — the diagnosis is already paid.',
      buy1: '1 audio · pay the difference',
      buy2: '2 audios + book · pay the difference',
      buy3: '3 audios + Alicia Premium · pay the difference',
      waReport: 'Send my map to Pauline',
      backHome: 'Back to center',
      copy: 'Copy',
      copied: 'Copied!',
      rooms: [
        { kicker: 'Layer 1 · Three doors', title: 'Which one opens by itself when you close your eyes?', lead: 'Don’t pick the “right” one. Pick the one you already know.' },
        { kicker: 'Layer 2 · The noise', title: 'Which voice must go quiet first?', lead: 'Only one. The one running you without permission.' },
        { kicker: 'Layer 3 · Object', title: 'There’s an object in the room. Which do you take?', lead: 'It isn’t a cute metaphor. It’s your strategy.' },
        { kicker: 'Layer 4 · Key', title: 'One sentence opens the lock. Which is yours?', lead: 'The one that stings a little is almost always true.' },
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
        mini: 'Tu inconsciente no busca castigarte: busca previsibilidad. Repite el mismo circuito para no perder el mando.',
        script: '“Si yo no controlo, alguien más decide por mí — y eso es peligroso.”',
        blocks: [
          { t: 'Control como seguridad', d: 'Relajas solo cuando todo está “bajo control”.' },
          { t: 'Miedo al caos', d: 'La incertidumbre se siente como amenaza, no como espacio.' },
          { t: 'Sobrepensar', d: 'Piensas para no sentir; analizas para no soltar.' },
          { t: 'Loop de posponer', d: 'Esperas el momento perfecto… y el momento nunca llega.' }
        ],
        ritual: 'Durante 7 días, elige una micro-decisión al azar (café, ruta, mensaje) y no la optimices. Observa la ansiedad sin obedecerla.'
      },
      en: {
        name: 'Control Loop',
        mini: 'Your unconscious isn’t punishing you — it wants predictability. It repeats the same circuit so you never lose the wheel.',
        script: '“If I don’t control it, someone else decides for me — and that’s dangerous.”',
        blocks: [
          { t: 'Control as safety', d: 'You only relax when everything feels “handled”.' },
          { t: 'Fear of chaos', d: 'Uncertainty feels like threat, not space.' },
          { t: 'Overthinking', d: 'You think to avoid feeling; analyze to avoid releasing.' },
          { t: 'Postpone loop', d: 'You wait for the perfect moment… that never arrives.' }
        ],
        ritual: 'For 7 days, make one micro-decision at random (coffee, route, text) and don’t optimize it. Watch the anxiety without obeying it.'
      },
      audios: [
        { id: 'booster', name: 'Booster 2.0', whyEs: 'Rompe el loop y vuelve al punto cero.', whyEn: 'Breaks the loop and returns you to zero point.', img: '/img/catalog/booster-2-0.jpg' },
        { id: 'limitless', name: 'LIMITLESS', whyEs: 'Detecta el patrón invisible que te frena.', whyEn: 'Detects the invisible pattern holding you.', img: '/img/catalog/limitless.jpg' },
        { id: 'wonderland', name: 'Wonderland Coherence', whyEs: 'Coherencia cuando sueltas el control.', whyEn: 'Coherence when you release control.', img: '/img/catalog/wonderland-coherence.jpg' }
      ]
    },
    espejo: {
      es: {
        name: 'Espejo Relacional',
        mini: 'Tu realidad amorosa no es “mala suerte”: es un espejo. Atraes para confirmar una historia vieja de valor.',
        script: '“Si me eligen, valgo. Si me ignoran, desaparezco.”',
        blocks: [
          { t: 'Validación externa', d: 'Tu estado depende de cómo te miran.' },
          { t: 'Perseguir / retirar', d: 'Oscilas entre acercarte demasiado y desaparecer.' },
          { t: 'Miedo al abandono', d: 'Aceptas migajas para no quedarte sola/o.' },
          { t: 'Identidad en el otro', d: 'Te defines por la relación, no por ti.' }
        ],
        ritual: 'Escribe 10 veces: “Mi valor no negocia.” Luego no envíes el mensaje que suele salvar la escena.'
      },
      en: {
        name: 'Relational Mirror',
        mini: 'Your love life isn’t “bad luck” — it’s a mirror. You attract to confirm an old worth story.',
        script: '“If they choose me, I matter. If they ignore me, I vanish.”',
        blocks: [
          { t: 'External validation', d: 'Your state depends on how you’re seen.' },
          { t: 'Chase / withdraw', d: 'You swing between getting too close and disappearing.' },
          { t: 'Abandonment fear', d: 'You accept crumbs so you won’t be alone.' },
          { t: 'Identity in the other', d: 'You define yourself by the relationship, not by you.' }
        ],
        ritual: 'Write 10 times: “My worth doesn’t negotiate.” Then don’t send the message that usually saves the scene.'
      },
      audios: [
        { id: 'seduction', name: 'SEDUCTION', whyEs: 'Deja de perseguir; vuelve el magnetismo.', whyEn: 'Stop chasing; restore magnetism.', img: '/img/catalog/seduction.jpg' },
        { id: 'amor', name: 'Amor Propio Magic 4.0', whyEs: 'Merecimiento sin codependencia.', whyEn: 'Worth without codependency.', img: '/img/catalog/amor-propio-magic-4-0.jpg' },
        { id: 'mesmer', name: 'Mesmerizing Love', whyEs: 'Presencia que enamora sin forzar.', whyEn: 'Presence that magnetizes without forcing.', img: '/img/catalog/mesmerizing-love.jpg' }
      ]
    },
    vacio: {
      es: {
        name: 'Vacío de Identidad',
        mini: 'No es que “no sepas qué quieres”. Es que el personaje actual ya no cabe — y el inconsciente aún no instaló el nuevo.',
        script: '“Si elijo mal quién soy, pierdo todo lo que construí.”',
        blocks: [
          { t: 'Disociación suave', d: 'Vives en piloto automático.' },
          { t: 'Miedo a definirte', d: 'Elegir una versión se siente como traición.' },
          { t: 'Comparación', d: 'Mides tu vida con películas ajenas.' },
          { t: 'Falta de guión', d: 'Sabes lo que no quieres; no el rol que sí.' }
        ],
        ritual: 'Durante 3 mañanas escribe: “Hoy soy la persona que ___.” Completa en presente y actúa 1 gesto mínimo acorde.'
      },
      en: {
        name: 'Identity Void',
        mini: 'It isn’t that you “don’t know what you want.” The current character no longer fits — and the unconscious hasn’t installed the new one.',
        script: '“If I choose the wrong who-I-am, I lose everything I built.”',
        blocks: [
          { t: 'Soft dissociation', d: 'You live on autopilot.' },
          { t: 'Fear of defining', d: 'Choosing a version feels like betrayal.' },
          { t: 'Comparison', d: 'You measure your life against other people’s films.' },
          { t: 'No script', d: 'You know what you don’t want — not the role you do.' }
        ],
        ritual: 'For 3 mornings write: “Today I am the person who ___.” Fill it in present tense and do one tiny matching act.'
      },
      audios: [
        { id: 'identity', name: 'Identity', whyEs: 'Rediseña tu película y el rol principal.', whyEn: 'Redesign your film and lead role.', img: '/img/catalog/identity.jpg' },
        { id: 'imagine', name: 'IMAGINE', whyEs: 'Imagina desde el resultado, no desde el miedo.', whyEn: 'Imagine from the result, not from fear.', img: '/img/catalog/imagine.jpg' },
        { id: 'god', name: 'GOD / GODDESS', whyEs: 'Instala el “YO SOY” creador.', whyEn: 'Install the creative I AM.', img: '/img/catalog/god-goddess.jpg' }
      ]
    },
    ruido: {
      es: {
        name: 'Ruido Mental',
        mini: 'Tu mente no está “rota”: está saturada. Demasiadas pestañas abiertas. El inconsciente grita porque nadie baja el volumen.',
        script: '“Si dejo de pensar, se me escapa algo importante.”',
        blocks: [
          { t: 'Hiper Vigilancia', d: 'Escaneas amenazas aunque no haya incendio.' },
          { t: 'Multitarea emocional', d: 'Sientes 5 escenarios a la vez.' },
          { t: 'Insomnio creativo', d: 'Las mejores ideas llegan… cuando deberías dormir.' },
          { t: 'Duda crónica', d: 'Revisas cada decisión hasta vaciarla.' }
        ],
        ritual: '10 minutos al día: auriculares, una sola pregunta, cero pantallas. Anota solo 1 insight. Nada más.'
      },
      en: {
        name: 'Mental Noise',
        mini: 'Your mind isn’t “broken” — it’s saturated. Too many tabs open. The unconscious shouts because nobody turns the volume down.',
        script: '“If I stop thinking, something important will slip away.”',
        blocks: [
          { t: 'Hypervigilance', d: 'You scan for threats even when there’s no fire.' },
          { t: 'Emotional multitasking', d: 'You feel five scenarios at once.' },
          { t: 'Creative insomnia', d: 'Best ideas arrive… when you should sleep.' },
          { t: 'Chronic doubt', d: 'You revise every decision until it’s empty.' }
        ],
        ritual: '10 minutes a day: headphones, one question, zero screens. Write only 1 insight. Nothing else.'
      },
      audios: [
        { id: 'limitless', name: 'LIMITLESS', whyEs: 'Claridad láser y metacognición.', whyEn: 'Laser clarity and metacognition.', img: '/img/catalog/limitless.jpg' },
        { id: 'cool', name: 'Keep Cool', whyEs: 'Baja el ruido y regula el sistema.', whyEn: 'Lowers noise and regulates the system.', img: '/img/catalog/keep-cool.jpg' },
        { id: 'master', name: 'MASTER MIND', whyEs: 'Orden mental para sostener visiones grandes.', whyEn: 'Mental order to hold big visions.', img: '/img/catalog/master-mind.jpg' }
      ]
    },
    carencia: {
      es: {
        name: 'Código de Carencia',
        mini: 'El dinero no es el problema: es el termómetro. Tu inconsciente aún corre el programa “nunca alcanza”.',
        script: '“Si me llega de más, algo malo viene después.”',
        blocks: [
          { t: 'Culpa al recibir', d: 'Ganar se siente inseguro o inmerecido.' },
          { t: 'Fugas invisibles', d: 'Entra y se va sin que sepas por qué.' },
          { t: 'Techo de merecimiento', d: 'Saboteas justo cuando sube el nivel.' },
          { t: 'Identidad pobre', d: '“La gente como yo no tiene eso.”' }
        ],
        ritual: 'Cada vez que pagues algo hoy, di en voz baja: “Circula a través de mí.” Sin drama. Solo señal nueva.'
      },
      en: {
        name: 'Lack Code',
        mini: 'Money isn’t the problem — it’s the thermometer. Your unconscious still runs “never enough.”',
        script: '“If too much arrives, something bad comes after.”',
        blocks: [
          { t: 'Guilt receiving', d: 'Earning feels unsafe or undeserved.' },
          { t: 'Invisible leaks', d: 'It comes in and leaves without a clear why.' },
          { t: 'Worth ceiling', d: 'You sabotage right as the level rises.' },
          { t: 'Poor identity', d: '“People like me don’t get that.”' }
        ],
        ritual: 'Every time you pay for something today, whisper: “It circulates through me.” No drama. Just a new signal.'
      },
      audios: [
        { id: 'money', name: 'MONEY TECH', whyEs: 'Nueva fórmula diurna/nocturna de abundancia.', whyEn: 'Day/night abundance formula.', img: '/img/catalog/money-tech.jpg' },
        { id: 'mastera', name: 'Master Abundance', whyEs: 'Curso + audio para sostener flujo.', whyEn: 'Course + audio to sustain flow.', img: '/img/catalog/master-abundance.jpg' },
        { id: 'lucky', name: 'LUCKY', whyEs: 'Suerte como identidad, no como azar.', whyEn: 'Luck as identity, not chance.', img: '/img/catalog/lucky.jpg' }
      ]
    },
    sueno: {
      es: {
        name: 'Soñador Atrapado',
        mini: 'Imaginas mundos enormes… y te quedas en el vestíbulo. El inconsciente protege el sueño para que no se rompa al materializarse.',
        script: '“Mientras sea posible en mi mente, no puede fallar afuera.”',
        blocks: [
          { t: 'Fantasía como refugio', d: 'Sueñas para no arriesgar.' },
          { t: 'Perfeccionismo creativo', d: 'Nunca está “listo” para salir.' },
          { t: 'Miedo al juicio', d: 'Si lo muestro, me pueden reducir.' },
          { t: 'Procrastinación sagrada', d: 'Esperas inspiración en vez de ritual.' }
        ],
        ritual: 'Publica o envía HOY una versión imperfecta (story, audio, borrador). El acto > la obra maestra.'
      },
      en: {
        name: 'Trapped Dreamer',
        mini: 'You imagine huge worlds… and stay in the lobby. The unconscious protects the dream so it can’t break when it becomes real.',
        script: '“As long as it’s possible in my mind, it can’t fail outside.”',
        blocks: [
          { t: 'Fantasy as shelter', d: 'You dream to avoid risk.' },
          { t: 'Creative perfectionism', d: 'It’s never “ready” to leave.' },
          { t: 'Fear of judgment', d: 'If I show it, they can shrink me.' },
          { t: 'Sacred procrastination', d: 'You wait for inspiration instead of ritual.' }
        ],
        ritual: 'Publish or send TODAY an imperfect version (story, audio, draft). The act > the masterpiece.'
      },
      audios: [
        { id: 'imagine', name: 'IMAGINE', whyEs: 'Materializa desde la imaginación entrenada.', whyEn: 'Materialize from trained imagination.', img: '/img/catalog/imagine.jpg' },
        { id: 'rabbit', name: 'White Rabbit Code', whyEs: 'Boost personalizado para salir del vestíbulo.', whyEn: 'Personalized boost to leave the lobby.', img: '/img/catalog/white-rabbit-code.jpg' },
        { id: 'sim', name: 'Simulation U', whyEs: 'Entiende el juego y juega en serio.', whyEn: 'Understand the game and play for real.', img: '/img/catalog/simulation-u.jpg' }
      ]
    }
  };

  var CHOICES = [
    [
      { labelEs: 'La puerta de metal', subEs: 'Fría, cerrada, con candado brillante', labelEn: 'The metal door', subEn: 'Cold, sealed, shiny lock', scores: { loop: 2, ruido: 1 } },
      { labelEs: 'La puerta de espejo', subEs: 'Te ves… pero no del todo', labelEn: 'The mirror door', subEn: 'You see yourself… not fully', scores: { espejo: 2, vacio: 1 } },
      { labelEs: 'La puerta de niebla', subEs: 'No sabes qué hay detrás y eso te llama', labelEn: 'The fog door', subEn: 'You don’t know what’s behind — and it calls you', scores: { sueno: 2, vacio: 1, carencia: 1 } }
    ],
    [
      { labelEs: '“¿Y si salgo mal?”', subEs: 'La voz del control anticipado', labelEn: '“What if it goes wrong?”', subEn: 'The voice of preemptive control', scores: { loop: 2, ruido: 1 } },
      { labelEs: '“No soy suficiente”', subEs: 'La voz del espejo roto', labelEn: '“I’m not enough”', subEn: 'The cracked-mirror voice', scores: { espejo: 2, carencia: 1 } },
      { labelEs: '“Después lo hago”', subEs: 'La voz que pospone el salto', labelEn: '“I’ll do it later”', subEn: 'The voice that postpones the leap', scores: { sueno: 2, vacio: 1 } }
    ],
    [
      { labelEs: 'Una llave oxidada', subEs: 'Pesada, familiar, de otro tiempo', labelEn: 'A rusted key', subEn: 'Heavy, familiar, from another time', scores: { loop: 2, carencia: 1 } },
      { labelEs: 'Un auricular solo', subEs: 'Escuchas una frecuencia lejana', labelEn: 'A single earbud', subEn: 'You hear a distant frequency', scores: { ruido: 2, sueno: 1 } },
      { labelEs: 'Una carta sin abrir', subEs: 'Tu nombre está mal escrito a propósito', labelEn: 'An unopened letter', subEn: 'Your name is misspelled on purpose', scores: { vacio: 2, espejo: 1 } }
    ],
    [
      { labelEs: '“Esto ya lo viví”', subEs: 'Déjà vu con sabor a trampa', labelEn: '“I’ve lived this before”', subEn: 'Déjà vu that tastes like a trap', scores: { loop: 2, ruido: 1 } },
      { labelEs: '“Me están mirando”', subEs: 'Aunque no haya nadie', labelEn: '“They’re watching me”', subEn: 'Even when no one is there', scores: { espejo: 2, ruido: 1 } },
      { labelEs: '“Todavía no es mi momento”', subEs: 'La frase más cara del inconsciente', labelEn: '“It’s not my time yet”', subEn: 'The unconscious’s most expensive sentence', scores: { sueno: 2, carencia: 1, vacio: 1 } }
    ],
    [
      { labelEs: 'Casi lo logras… y algo se cae', subEs: 'El cliffhanger eterno', labelEn: 'Almost there… then something drops', subEn: 'The eternal cliffhanger', scores: { carencia: 2, loop: 1 } },
      { labelEs: 'Alguien elige a otra persona', subEs: 'Tú miras desde el pasillo', labelEn: 'Someone chooses another person', subEn: 'You watch from the hallway', scores: { espejo: 2, vacio: 1 } },
      { labelEs: 'Tienes el mapa… y no das el paso', subEs: 'El vestíbulo infinito', labelEn: 'You have the map… and don’t step', subEn: 'The infinite lobby', scores: { sueno: 2, ruido: 1 } }
    ]
  ];

  var state = loadState() || {
    step: 'start',
    room: 0,
    scores: {},
    archetype: null,
    unlocked: false,
    code: null
  };

  var root = document.getElementById('app');
  var bar = document.getElementById('progressBar');

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (state.unlocked) {
        localStorage.setItem('erior_mapa_credit', JSON.stringify({
          mxn: CREDIT_MXN,
          usd: CREDIT_USD,
          archetype: state.archetype,
          code: state.code,
          at: Date.now()
        }));
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
    if (LANG === 'en') {
      var base = { 1: 46, 2: 85, 3: 135 }[pack];
      return Math.max(0, base - CREDIT_USD);
    }
    var baseMx = { 1: 777, 2: 1444, 3: 2299 }[pack];
    return Math.max(0, baseMx - CREDIT_MXN);
  }

  function formatDiff(pack) {
    var d = priceDiff(pack);
    return LANG === 'en' ? '$' + d + ' USD' : '$' + d.toLocaleString('es-MX') + ' MXN';
  }

  function archCopy(id) {
    return ARCH[id][LANG];
  }

  function renderStart() {
    setProgress(4);
    root.innerHTML =
      '<section class="stage">' +
      '<p class="kicker">' +
      t.kickerStart +
      '</p>' +
      '<h1 class="glitch">' +
      t.titleStart +
      '</h1>' +
      '<p class="lead">' +
      t.leadStart +
      '</p>' +
      '<div class="cta-row"><button type="button" class="btn btn-solid" id="btnStart">' +
      t.startCta +
      '</button></div>' +
      '<p class="foot-note">ERIOR CENTER · puzzle gratuito · mini revelación gratis · archivo completo $' +
      (LANG === 'en' ? '26 USD' : '444 MXN') +
      '</p>' +
      '</section>';
    document.getElementById('btnStart').onclick = function () {
      state.step = 'room';
      state.room = 0;
      state.scores = {};
      state.unlocked = false;
      state.archetype = null;
      saveState();
      render();
    };
  }

  function renderRoom() {
    var r = state.room;
    var meta = t.rooms[r];
    var opts = CHOICES[r];
    setProgress(12 + r * 14);
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
      '<div class="choices">';
    opts.forEach(function (o, i) {
      html +=
        '<button type="button" class="choice" data-i="' +
        i +
        '"><strong>' +
        (LANG === 'en' ? o.labelEn : o.labelEs) +
        '</strong><span>' +
        (LANG === 'en' ? o.subEn : o.subEs) +
        '</span></button>';
    });
    html += '</div></section>';
    root.innerHTML = html;
    root.querySelectorAll('.choice').forEach(function (btn) {
      btn.onclick = function () {
        var i = +btn.getAttribute('data-i');
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
    var a = archCopy(state.archetype);
    root.innerHTML =
      '<section class="stage">' +
      '<p class="kicker">' +
      t.miniTag +
      '</p>' +
      '<h2>' +
      t.miniTitle +
      '</h2>' +
      '<div class="card">' +
      '<span class="tag">' +
      (LANG === 'en' ? 'Dominant pattern' : 'Patrón dominante') +
      '</span>' +
      '<h3>' +
      a.name +
      '</h3>' +
      '<p>' +
      a.mini +
      '</p>' +
      '</div>' +
      '<div class="card" style="margin-top:1rem">' +
      '<h3 style="font-size:1.2rem">' +
      t.unlockTitle +
      '</h3>' +
      '<p style="margin-top:.4rem">' +
      t.unlockLead +
      '</p>' +
      '<div class="cta-row">' +
      '<button type="button" class="btn btn-solid" id="btnUnlock">' +
      t.unlockCta +
      '</button>' +
      '</div></div></section>';
    document.getElementById('btnUnlock').onclick = function () {
      state.step = 'pay';
      saveState();
      render();
    };
  }

  function payPanelHtml(method) {
    if (LANG === 'en') {
      if (method === 'paypal') {
        return (
          '<p>Pay <b>$26 USD</b> via PayPal.</p>' +
          '<div class="pay-row"><span>Link</span><b>paypal.me/sheismagique</b><button type="button" class="copy-btn" data-c="https://www.paypal.me/sheismagique">' +
          t.copy +
          '</button></div>' +
          '<p class="hint"><a href="https://www.paypal.me/sheismagique" target="_blank" rel="noopener">Open PayPal →</a></p>'
        );
      }
      if (method === 'alt') {
        return '<p>Crypto or Western Union — message Pauline on WhatsApp with code <b>' + state.code + '</b> and she will send instructions.</p>';
      }
      return (
        '<p>ACH / Wire · <b>$26 USD</b></p>' +
        row('Beneficiary', 'Paulina Lopez') +
        row('Bank', 'Lead Bank') +
        row('Routing (ABA)', '101019644') +
        row('Account', '219021482598') +
        row('Type', 'Checking') +
        '<p class="hint">Address: 1801 Main St., Kansas City, MO 64108</p>'
      );
    }
    if (method === 'oxxo') {
      return (
        '<p>OXXO · <b>$444 MXN</b></p>' +
        row('Tarjeta', '4741 7435 2658 3795') +
        row('Banco', 'Banregio')
      );
    }
    if (method === 'paypal') {
      return (
        '<p>PayPal · <b>$444 MXN</b> (o $26 USD)</p>' +
        row('Link', 'paypal.me/sheismagique') +
        '<p class="hint"><a href="https://www.paypal.me/sheismagique" target="_blank" rel="noopener">Ir a PayPal →</a></p>'
      );
    }
    if (method === 'alt') {
      return '<p>Crypto / Western Union / USD — escribe por WhatsApp con tu código <b>' + state.code + '</b> y te pasamos datos.</p>';
    }
    return (
      '<p>Transferencia · <b>$444 MXN</b></p>' +
      row('Nombre', 'Paulina López Gutiérrez') +
      row('CLABE NVIO', '710969000048503916') +
      row('CLABE Banregio', '058470000010260425') +
      row('Cuenta', '996812170013')
    );
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

  function renderPay() {
    setProgress(88);
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
      '<div class="pay-box">' +
      '<div class="pay-tabs" id="payTabs"></div>' +
      '<div class="pay-panel" id="payPanel"></div>' +
      '</div>' +
      '<div class="cta-row" style="margin-top:1.2rem">' +
      '<button type="button" class="btn btn-solid" id="btnPaid">' +
      t.paidCta +
      '</button>' +
      '<a class="btn btn-ghost" id="waPay" target="_blank" rel="noopener">' +
      t.waPay +
      '</a>' +
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
        ? 'Hi! I want to pay the Unconscious Map full report ($26 USD). Pattern: ' + a.name + '. Code: ' + state.code
        : 'Hola! Quiero pagar el Reporte Completo del Mapa del Inconsciente ($444 MXN). Patrón: ' + a.name + '. Código: ' + state.code;
    document.getElementById('waPay').href = waUrl(waMsg);

    document.getElementById('btnPaid').onclick = function () {
      state.unlocked = true;
      state.step = 'full';
      if (!state.code) state.code = makeCode();
      saveState();
      render();
    };
  }

  function renderFull() {
    setProgress(100);
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
    var waFull =
      LANG === 'en'
        ? 'Hi Pauline! I unlocked my Unconscious Map. Code: ' +
          state.code +
          '. Pattern: ' +
          a.name +
          '. Recommended: ' +
          names.join(', ') +
          '. I want to activate frequencies — diagnosis credit $26 applied.'
        : 'Hola Pauline! Desbloqueé mi Mapa del Inconsciente. Código: ' +
          state.code +
          '. Patrón: ' +
          a.name +
          '. Recomendados: ' +
          names.join(', ') +
          '. Quiero activar frecuencias — crédito del diagnóstico $444 aplicado.';

    function waBuy(pack) {
      var list = names.slice(0, pack).join(' + ');
      if (LANG === 'en') {
        return waUrl(
          'Hi! I paid the Unconscious Map (' +
            state.code +
            '). I want pack ' +
            pack +
            ': ' +
            list +
            '. Pay only the difference: ' +
            formatDiff(pack) +
            ' (credit $26 already applied).'
        );
      }
      return waUrl(
        'Hola! Ya pagué el Mapa del Inconsciente (' +
          state.code +
          '). Quiero pack ' +
          pack +
          ': ' +
          list +
          '. Solo pago la diferencia: ' +
          formatDiff(pack) +
          ' (crédito $444 ya aplicado).'
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
      '</span><p style="font-family:var(--serif);font-size:1.25rem;color:var(--ink)">' +
      a.script +
      '</p></div>' +
      '<div class="bloks">' +
      blocks +
      '</div>' +
      '<div class="card"><h3 style="font-size:1.15rem">' +
      (LANG === 'en' ? '7-day micro-ritual' : 'Micro-ritual 7 días') +
      '</h3><p style="margin-top:.4rem">' +
      a.ritual +
      '</p></div>' +
      '<div class="price-line">' +
      t.creditNote +
      '</div>' +
      '<h2 style="margin-top:1.75rem;font-size:1.5rem">' +
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
      '<a class="btn btn-ghost" target="_blank" rel="noopener" href="' +
      waUrl(waFull) +
      '">' +
      t.waReport +
      '</a>' +
      '<a class="btn btn-ghost" href="' +
      t.homeHref +
      '">' +
      t.backHome +
      '</a>' +
      '</div>' +
      '<p class="hint">' +
      (LANG === 'en'
        ? 'Diff calculator: $46 / $85 / $135 minus $26 credit. Send your receipt + code so we apply it.'
        : 'Diferencias: $777 / $1,444 / $2,299 menos $444 de crédito. Manda comprobante + código para aplicarlo.') +
      '</p></section>';
  }

  function render() {
    root.classList.remove('stage');
    void root.offsetWidth;
    if (state.step === 'start') renderStart();
    else if (state.step === 'room') renderRoom();
    else if (state.step === 'mini') renderMini();
    else if (state.step === 'pay') renderPay();
    else if (state.step === 'full') {
      if (!state.unlocked) {
        state.step = 'pay';
        renderPay();
      } else renderFull();
    } else renderStart();
  }

  document.getElementById('brandLink').textContent = t.brand;
  document.getElementById('brandLink').href = t.homeHref;
  document.getElementById('langLink').textContent = t.langOther;
  document.getElementById('langLink').href = t.langHref;

  render();
})();
