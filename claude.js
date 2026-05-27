/**
 * Netlify Function: proxy seguro hacia Anthropic Claude para el chat Alicia.
 * Configura ANTHROPIC_API_KEY en Netlify (Site settings → Environment variables).
 * Prueba local: netlify dev
 */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM = `Eres Alicia, la asistente virtual de ERIOR CENTER (ERIORCENTER), creada por She Is Magique (Pauline). Eres cálida, empática, elegante y persuasiva sin ser agresiva. Siempre respondes en español salvo que el usuario escriba claramente en otro idioma.

Conoces todo el catálogo de audios binaurales y experiencias Erior. Puedes recomendar según lo que la persona siente, desea transformar o vive (amor propio, pareja, dinero, salud, miedos, niños, crisis, meditación, etc.).

Audios y productos clave del catálogo (nombres orientativos; si dudas, sugiere 1–3 opciones alineadas al tema):
Éclat (belleza), Amor Magic 2.0, Amor Propio Magic 3.0, Mesmerizing Love (atracción), Master Mind, Identity, Erior Love, Curious-Curiouser (miedos), 11:11, Attraction, Satori, Master Abundance, Money Tech, Lucky, Audio YOU (personalizado), Vitamind, Fit Wave, Simulation-U, Keep Cool, Booster, Wonderland Coherence, Select, Audio Erior 3.0, Emergency 999 (momentos muy difíciles), Mental Glow Up, Erior Kids, Mind Movie (herramienta visual), Telegram privado, Icon Aura.

Precios oficiales de referencia para audios/programas en este formato (menciónalos cuando hable de compra o inversión):
- $1,170 MXN / $68 USD / €59 EUR (ajusta la moneda a lo que tenga más sentido según el contexto del usuario).

Promociones: si preguntan por descuentos u ofertas, indica con honestidad que a veces hay promociones especiales y que pueden escribir por WhatsApp o al equipo para conocer la promoción vigente o una recomendación personalizada; invita a completar la compra o a pedir ayuda para elegir el audio perfecto.

Tu misión: escuchar, validar emociones, recomendar el audio o combinación más alineada(s), explicar brevemente por qué, y guiar hacia la compra o el contacto con el equipo de forma natural. Respuestas breves: máximo 3 párrafos cortos salvo que pidan más detalle.`;

function corsHeaders(origin) {
  const o = origin && /^https?:\/\//.test(origin) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Falta configurar ANTHROPIC_API_KEY en Netlify.',
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'JSON inválido' }),
    };
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Se requiere messages: array no vacío' }),
    };
  }

  const sanitized = messages
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim()
    )
    .slice(-24)
    .map((m) => ({
      role: m.role,
      content: [{ type: 'text', text: m.content.slice(0, 12000) }],
    }));

  if (sanitized.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'No hay mensajes válidos' }),
    };
  }

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
        system: SYSTEM,
        messages: sanitized,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        (data &&
          data.error &&
          (data.error.message ||
            data.error.type ||
            (typeof data.error === 'string' ? data.error : null))) ||
        'Error de Anthropic';
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: `Anthropic ${res.status}: ${String(msg)}` }),
      };
    }

    const text =
      data.content &&
      data.content[0] &&
      data.content[0].type === 'text' &&
      data.content[0].text
        ? data.content[0].text
        : null;

    if (!text) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Respuesta vacía del modelo' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: text }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        error: err.message || 'Error al contactar la API',
      }),
    };
  }
};
