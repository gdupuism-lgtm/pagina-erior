/**
 * Diagnóstico del Mapa del Inconsciente.
 * POST { feelings, scores, lang, archetypeHint }
 * Usa ANTHROPIC_API_KEY si existe; si no, fallback local Erior.
 */
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

const ARCH_META = {
  loop: {
    nameEs: 'Loop de Control',
    nameEn: 'Control Loop',
    audios: [
      { name: 'Booster 2.0', img: '/img/catalog/booster-2-0.jpg', whyEs: 'Reinicia el campo y corta el circuito de control.', whyEn: 'Resets the field and cuts the control circuit.' },
      { name: 'LIMITLESS', img: '/img/catalog/limitless.jpg', whyEs: 'Detecta el patrón invisible que te atrapa.', whyEn: 'Detects the invisible pattern trapping you.' },
      { name: 'Wonderland Coherence', img: '/img/catalog/wonderland-coherence.jpg', whyEs: 'Coherencia al soltar el mando.', whyEn: 'Coherence when releasing the wheel.' }
    ]
  },
  espejo: {
    nameEs: 'Espejo Relacional',
    nameEn: 'Relational Mirror',
    audios: [
      { name: 'SEDUCTION', img: '/img/catalog/seduction.jpg', whyEs: 'Deja de perseguir; recupera magnetismo.', whyEn: 'Stop chasing; restore magnetism.' },
      { name: 'Amor Propio Magic 4.0', img: '/img/catalog/amor-propio-magic-4-0.jpg', whyEs: 'Merecimiento sin codependencia.', whyEn: 'Worth without codependency.' },
      { name: 'Mesmerizing Love', img: '/img/catalog/mesmerizing-love.jpg', whyEs: 'Presencia que enamora sin forzar.', whyEn: 'Presence that magnetizes without force.' }
    ]
  },
  vacio: {
    nameEs: 'Vacío de Identidad',
    nameEn: 'Identity Void',
    audios: [
      { name: 'Identity', img: '/img/catalog/identity.jpg', whyEs: 'Rediseña tu película y el rol principal.', whyEn: 'Redesign your film and lead role.' },
      { name: 'IMAGINE', img: '/img/catalog/imagine.jpg', whyEs: 'Imagina desde el resultado ya vivido.', whyEn: 'Imagine from the lived result.' },
      { name: 'GOD / GODDESS', img: '/img/catalog/god-goddess.jpg', whyEs: 'Instala el YO SOY creador.', whyEn: 'Install the creative I AM.' }
    ]
  },
  ruido: {
    nameEs: 'Ruido Mental',
    nameEn: 'Mental Noise',
    audios: [
      { name: 'LIMITLESS', img: '/img/catalog/limitless.jpg', whyEs: 'Claridad láser sobre el ruido.', whyEn: 'Laser clarity over the noise.' },
      { name: 'Keep Cool', img: '/img/catalog/keep-cool.jpg', whyEs: 'Baja el volumen del sistema.', whyEn: 'Lowers system volume.' },
      { name: 'MASTER MIND', img: '/img/catalog/master-mind.jpg', whyEs: 'Orden para visiones grandes.', whyEn: 'Order for big visions.' }
    ]
  },
  carencia: {
    nameEs: 'Código de Carencia',
    nameEn: 'Lack Code',
    audios: [
      { name: 'MONEY TECH', img: '/img/catalog/money-tech.jpg', whyEs: 'Fórmula diurna/nocturna de abundancia.', whyEn: 'Day/night abundance formula.' },
      { name: 'Master Abundance', img: '/img/catalog/master-abundance.jpg', whyEs: 'Sostener el flujo sin sabotaje.', whyEn: 'Sustain flow without sabotage.' },
      { name: 'LUCKY', img: '/img/catalog/lucky.jpg', whyEs: 'Suerte como identidad.', whyEn: 'Luck as identity.' }
    ]
  },
  sueno: {
    nameEs: 'Soñador Atrapado',
    nameEn: 'Trapped Dreamer',
    audios: [
      { name: 'IMAGINE', img: '/img/catalog/imagine.jpg', whyEs: 'Materializa desde imaginación entrenada.', whyEn: 'Materialize from trained imagination.' },
      { name: 'White Rabbit Code', img: '/img/catalog/white-rabbit-code.jpg', whyEs: 'Boost para salir del vestíbulo.', whyEn: 'Boost to leave the lobby.' },
      { name: 'Simulation U', img: '/img/catalog/simulation-u.jpg', whyEs: 'Entiende el juego y juega en serio.', whyEn: 'Understand the game; play for real.' }
    ]
  }
};

const KEYWORDS = {
  loop: ['control', 'ansiedad', 'ansioso', 'perfecto', 'plan', 'miedo a fallar', 'overthink', 'sobrepensar', 'caos', 'seguridad', 'anxiety', 'perfect', 'worry'],
  espejo: ['amor', 'pareja', 'ex', 'abandono', 'rechazo', 'celos', 'validación', 'soledad', 'love', 'relationship', 'lonely', 'chosen', 'ignored', 'novio', 'novia'],
  vacio: ['identidad', 'quién soy', 'vacío', 'vacío', 'no sé quién', 'personaje', 'comparar', 'propósito', 'identity', 'empty', 'who am i', 'lost'],
  ruido: ['ruido', 'mente', 'insomnio', 'pensar', 'saturad', 'estrés', 'tabs', 'claridad', 'foco', 'noise', 'overwhelm', 'stress', 'insomnia', 'focus'],
  carencia: ['dinero', 'falta', 'no alcanza', 'pobre', 'deuda', 'abundancia', 'cobrar', 'money', 'broke', 'scarce', 'lack', 'bill'],
  sueno: ['sueño', 'proyecto', 'procrastin', 'después', 'inspiración', 'miedo a mostrar', 'dream', 'later', 'project', 'manifest', 'empezar']
};

function cors(origin) {
  const allowed = [
    'https://eriorcenterguiaaudios.netlify.app',
    'http://localhost:8888',
    'http://localhost:3000',
    'http://127.0.0.1:8888'
  ];
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}

function pickArchetype(feelings, scores, hint) {
  const text = String(feelings || '').toLowerCase();
  const tally = Object.assign({}, scores || {});
  Object.keys(KEYWORDS).forEach(function (k) {
    KEYWORDS[k].forEach(function (w) {
      if (text.indexOf(w) !== -1) tally[k] = (tally[k] || 0) + 2;
    });
  });
  if (hint) tally[hint] = (tally[hint] || 0) + 1;
  let best = hint || 'loop';
  let max = -1;
  Object.keys(tally).forEach(function (k) {
    if (tally[k] > max) {
      max = tally[k];
      best = k;
    }
  });
  return best;
}

function snippet(feelings, lang) {
  const clean = String(feelings || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
  if (!clean) {
    return lang === 'en'
      ? 'what you didn’t quite name out loud'
      : 'lo que aún no nombrabas del todo';
  }
  return clean;
}

function localDiagnose(feelings, scores, lang, hint) {
  const id = pickArchetype(feelings, scores, hint);
  const meta = ARCH_META[id];
  const name = lang === 'en' ? meta.nameEn : meta.nameEs;
  const quote = snippet(feelings, lang);
  const en = lang === 'en';
  const reading = en
    ? 'You want expansion — and at the same time your system names the cost. When you wrote “' +
      quote +
      '”, it wasn’t a complaint: it was the map of what you’d have to leave behind. Your answers converge on **' +
      name +
      '**. The familiar self is persuasive; this report names the code so you can recalibrate what feels normal.'
    : 'Quieres expansión — y a la vez tu sistema nombra el costo. Cuando escribiste “' +
      quote +
      '”, no era queja: era el mapa de lo que tendrías que dejar atrás. Tus respuestas convergen en **' +
      name +
      '**. Lo familiar es persuasivo; este reporte nombra el código para recalibrar lo que se siente normal.';
  const script = en
    ? '“If I don’t stay inside this pattern, I disappear.”'
    : '“Si salgo de este patrón, dejo de existir como me conozco.”';
  const blocks =
    en
      ? [
          { t: 'Primary neural signal', d: 'Your system treats this pattern as survival, not preference.' },
          { t: 'Hidden contract', d: 'You trade expansion for the familiar safety of the known self.' },
          { t: 'Text evidence', d: 'Your own words already marked the code: “' + quote + '”.' },
          { t: 'Recalibration', d: 'A neural frequency that installs a new identity while you listen — not more willpower.' }
        ]
      : [
          { t: 'Señal neuronal primaria', d: 'Tu sistema trata este patrón como supervivencia, no como preferencia.' },
          { t: 'Contrato oculto', d: 'Cambias expansión por la seguridad familiar del yo conocido.' },
          { t: 'Evidencia en el texto', d: 'Tus propias palabras ya marcaron el código: “' + quote + '”.' },
          { t: 'Recalibración', d: 'Una frecuencia neuronal que instala identidad nueva mientras escuchas — no más fuerza de voluntad.' }
        ];
  const protocol = en
    ? '7-day Recalibration Protocol: each morning reread one line you wrote, then take one imperfect action your pattern usually blocks. Track the signal; do not debate it.'
    : 'Protocolo de recalibración 7 días: cada mañana releé una línea de lo que escribiste y ejecuta un paso imperfecto que tu patrón suele bloquear. Registra la señal; no la debates.';
  return {
    ok: true,
    source: 'local',
    archetype: id,
    name: name,
    reading: reading,
    script: script,
    blocks: blocks,
    protocol: protocol,
    ritual: protocol,
    audios: meta.audios,
    mini: en
      ? 'Partial reveal: ' + name + ' is already speaking through what you feel.'
      : 'Revelación parcial: ' + name + ' ya habla a través de lo que sientes.'
  };
}

async function aiDiagnose(feelings, scores, lang, hint) {
  const key = String(process.env.ANTHROPIC_API_KEY || '').trim();
  if (!key) return null;

  const system = `Eres Alicia de ERIOR CENTER. Escribes un REPORTE DEL INCONSCIENTE con la voz editorial de Erior: profunda, psicológica, precisa, premium. Como un ensayo íntimo — no tarot, no juego, no autoayuda blanda.
Tesis central: a veces la resistencia no es hacia el deseo, sino hacia lo que el deseo representa — identidad distinta, expectativas, relaciones, responsabilidades, otra definición de lo normal.
La pregunta reveladora no es “¿por qué no lo he manifestado?” sino “¿qué problemas crearía realmente conseguirlo?”.
PROHIBIDO: tarot, “universo te obedece”, vibración mística, espejo roto, permiso faltante, micro-ritual, monedas imaginarias, tono infantil o de minijuego.
OBLIGATORIO: deseo vs incomodidad, identidad familiar vs expansión, patrón inconsciente, recalibración, frecuencia neuronal, protocolo accionable.
Patrones válidos (elige UNO): loop, espejo, vacio, ruido, carencia, sueno.
El input viene en bloques DESEO / INCOMODIDAD SI LLEGA / EN QUIÉN CONVERTIRME / CÓMO ME SIENTO. Cita fragmentos reales.
Responde SOLO JSON válido (sin markdown):
{
  "archetype": "loop|espejo|vacio|ruido|carencia|sueno",
  "name": "nombre del patrón",
  "mini": "2 frases de revelación parcial al estilo del post Erior",
  "reading": "párrafo 5-8 frases: conecta deseo + incomodidad + identidad; nombra el patrón; empuja a instalar frecuencia",
  "script": "frase entre comillas del guión operativo del inconsciente",
  "blocks": [{"t":"título preciso","d":"1 frase"}, exactamente 4],
  "protocol": "protocolo de recalibración 7 días concreto",
  "audios": [{"name":"NOMBRE CATÁLOGO","why":"por qué esta frecuencia para ESTA persona","img":"/img/catalog/...jpg"}, exactamente 3]
}
Audios: LIMITLESS, Booster 2.0, Wonderland Coherence, SEDUCTION, Amor Propio Magic 4.0, Mesmerizing Love, Identity, IMAGINE, GOD / GODDESS, Keep Cool, MASTER MIND, MONEY TECH, Master Abundance, LUCKY, White Rabbit Code, Simulation U, Mind Movie, ICON AURA, SELECT, VITAMIND, Audio YOU, Éclat.
Imágenes /img/catalog/slug.jpg.
Idioma: ${lang === 'en' ? 'English' : 'Español'}.
Nunca digas que eres una IA. Nunca consejo médico. Cierra empujando a instalar la frecuencia (audio Erior).`;

  const user =
    'Respuestas del reporte:\n"""' +
    String(feelings || '').slice(0, 2500) +
    '"""\nScores: ' +
    JSON.stringify(scores || {}) +
    '\nHint: ' +
    (hint || 'none');

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      temperature: 0.55,
      system: system,
      messages: [{ role: 'user', content: user }]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('mapa-diagnose anthropic', res.status, errText.slice(0, 300));
    return null;
  }
  const data = await res.json();
  const text = (data.content || [])
    .map(function (c) {
      return c.text || '';
    })
    .join('')
    .trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    return null;
  }
  const id = ARCH_META[parsed.archetype] ? parsed.archetype : pickArchetype(feelings, scores, hint);
  const meta = ARCH_META[id];
  const audios =
    Array.isArray(parsed.audios) && parsed.audios.length
      ? parsed.audios.slice(0, 3).map(function (a, i) {
          const fallback = meta.audios[i] || meta.audios[0];
          return {
            name: a.name || fallback.name,
            whyEs: a.why || fallback.whyEs,
            whyEn: a.why || fallback.whyEn,
            img: a.img || fallback.img
          };
        })
      : meta.audios;

  return {
    ok: true,
    source: 'ai',
    archetype: id,
    name: parsed.name || (lang === 'en' ? meta.nameEn : meta.nameEs),
    reading: parsed.reading || '',
    script: parsed.script || '',
    blocks: Array.isArray(parsed.blocks) ? parsed.blocks.slice(0, 4) : [],
    protocol: parsed.protocol || parsed.ritual || '',
    ritual: parsed.protocol || parsed.ritual || '',
    audios: audios,
    mini: parsed.mini || ''
  };
}

exports.handler = async function (event) {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = cors(origin);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'POST only' }) };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'JSON inválido' }) };
  }

  const feelings = String(body.feelings || '').trim();
  if (feelings.length < 20) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        ok: false,
        error:
          body.lang === 'en'
            ? 'Write at least a few honest sentences about how you feel.'
            : 'Escribe al menos unas frases honestas sobre cómo te sientes.'
      })
    };
  }

  const lang = body.lang === 'en' ? 'en' : 'es';
  const scores = body.scores || {};
  const hint = body.archetypeHint || null;

  try {
    const ai = await aiDiagnose(feelings, scores, lang, hint);
    const result = ai || localDiagnose(feelings, scores, lang, hint);
    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (e) {
    console.error(e);
    const result = localDiagnose(feelings, scores, lang, hint);
    return { statusCode: 200, headers, body: JSON.stringify(result) };
  }
};
