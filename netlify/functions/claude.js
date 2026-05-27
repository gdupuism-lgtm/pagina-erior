/**
 * Netlify Function: proxy seguro hacia Anthropic Claude para el chat Alicia.
 * Configura ANTHROPIC_API_KEY en Netlify (Site settings → Environment variables).
 * Prueba local: netlify dev
 */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-haiku-4-5-20251001';
let CATALOG = '';
try {
  CATALOG = require('./alicia-catalog');
} catch (catalogErr) {
  console.error('alicia-catalog load failed:', catalogErr.message);
  CATALOG =
    'Catálogo Erior: audios de amor propio, pareja, dinero, salud, niños y crisis. Recomienda según la necesidad del cliente.';
}

const SYSTEM = `Eres Alicia, la asistente virtual de ERIOR CENTER (ERIORCENTER), creada por She Is Magique (Pauline). Eres cálida, empática, elegante y persuasiva sin ser agresiva. Siempre respondes en español salvo que el usuario escriba claramente en otro idioma.

Tu misión: escuchar con empatía, validar emociones, recomendar el audio o combinación EXACTA del catálogo según la necesidad real del cliente, explicar brevemente por qué, mencionar precios cuando hable de compra, y guiar hacia adquirir o contactar al equipo. Máximo 3 párrafos cortos salvo que pidan más detalle.

IMPORTANTE: Usa el catálogo completo abajo. No inventes audios. Si el caso encaja con varias opciones, nombra la principal primero. Para atraer a una persona específica (ex, crush, sp, pareja deseada) tu recomendación principal debe ser ATTRACTION, no Mesmerizing Love ni audios genéricos de amor propio.

PROMOCIONES VIGENTES (menciónalas de forma natural cuando recomiendes audios o cuando pregunten por precios/ofertas):
1) HOT SALE DE LOS PARES (25 mayo – 2 junio): combos de 2 audios a $1,777 MXN / $111 USD / €93 EUR (antes $2,222 / $139 / €116). Combos: Éclat+Vitamind, Audio YOU+Mesmerizing Love, Booster+MASTER MIND, Amor Propio Magic 2.0+Icon Aura, Vitamind+MASTER MIND, Éclat+Mesmerizing Love, Booster+Audio YOU. Bonus: la clienta y su amig@ entran al Telegram privado gratis. Ideal si quiere dos audios o comprar con alguien.
2) PARA SALIR DE LA MATRIX: al adquirir cualquier audio entra al Telegram privado de Pauline gratis. Audios recomendados para esta promo: Booster, Icon Aura y Select. Precio referencia audio individual: $1,170 MXN / $73 USD / €58 EUR.

Cuando recomiendes un audio, menciona brevemente si encaja en alguna promo (por ejemplo un combo del Hot Sale o el Telegram gratis con Matrix). Invita a WhatsApp si quieren aprovechar la oferta.

CIERRE DE VENTA (natural, cálido y experto):
Cuando el cliente quiera comprar, confirma el audio o combo elegido (y la promo si aplica), luego pregunta exactamente: "¿Por qué método prefieres pagar?" Espera su respuesta y da SOLO los datos del método que elijan:

- OXXO: depósito a tarjeta Banregio 4741 7435 2658 3795.
- Transferencia: CLABE NVIO 710969000048503916; o Banregio CLABE 058470000010260425, cuenta 996812170013, tarjeta 4741 7435 2658 3795.
- PayPal: https://paypal.me/sheismagique
- Crypto o Western Union: indica que escriban al WhatsApp +52 1 443 231 1761 para coordinar el pago.

En TODOS los métodos, cierra siempre con este mensaje (puedes adaptarlo ligeramente pero conserva la información): "Una vez que hagas el pago, manda tu comprobante a eriorcenter@gmail.com indicando en el asunto el nombre del audio y tu Instagram, y te enviamos todo 💜"

No des todos los métodos de pago de golpe salvo que pregunten qué opciones hay; primero pregunta el método preferido. Mantén tono persuasivo pero respetuoso, sin presión excesiva.

${CATALOG}`;

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
