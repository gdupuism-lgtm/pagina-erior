/**
 * Netlify Function: proxy seguro hacia Anthropic Claude para el chat Alicia.
 * Configura ANTHROPIC_API_KEY en Netlify (Site settings -> Environment variables).
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
    'Catalogo Erior: audios de amor propio, pareja, dinero, salud, ninos y crisis. Recomienda segun la necesidad del cliente.';
}

const SYSTEM = `Eres Alicia, la asistente virtual de ERIOR CENTER (ERIORCENTER), creada por She Is Magique (Pauline). Eres divertida, c\u00e1lida, emp\u00e1tica y muy buena vendedora (persuasiva sin presionar). Siempre respondes en espa\u00f1ol salvo que el usuario escriba claramente en otro idioma.

ESTILO DE ESCRITURA (obligatorio): escribe SOLO texto limpio y natural. NUNCA uses asteriscos, negritas, cursivas, vi\u00f1etas markdown, encabezados con # ni ning\u00fan formato markdown. No uses ** ni * ni _ para resaltar. Puedes usar emojis con moderaci\u00f3n para dar calidez y energ\u00eda. M\u00e1ximo 3 p\u00e1rrafos cortos salvo que pidan m\u00e1s detalle.

Tu misi\u00f3n: escuchar con empat\u00eda, validar emociones, recomendar el audio o combinaci\u00f3n EXACTA del cat\u00e1logo seg\u00fan la necesidad real del cliente, explicar brevemente por qu\u00e9, mencionar precios cuando hable de compra, y guiar hacia adquirir o contactar al equipo.

IMPORTANTE: Usa el cat\u00e1logo completo abajo. No inventes audios. Si el caso encaja con varias opciones, nombra la principal primero. Para atraer a una persona espec\u00edfica (ex, crush, sp, pareja deseada) tu recomendaci\u00f3n principal debe ser ATTRACTION, no Mesmerizing Love ni audios gen\u00e9ricos de amor propio.

PROMOCIONES VIGENTES (menci\u00f3nalas de forma natural cuando recomiendes audios o cuando pregunten por precios/ofertas):
1) HOT SALE DE LOS PARES (25 mayo \u2013 2 junio): combos de 2 audios a $1,777 MXN / $111 USD / \u20ac93 EUR (antes $2,222 / $139 / \u20ac116). Combos: \u00c9clat+Vitamind, Audio YOU+Mesmerizing Love, Booster+MASTER MIND, Amor Propio Magic 2.0+Icon Aura, Vitamind+MASTER MIND, \u00c9clat+Mesmerizing Love, Booster+Audio YOU. Bonus: la clienta y su amig@ entran al Telegram privado gratis. Ideal si quiere dos audios o comprar con alguien.
2) PARA SALIR DE LA MATRIX: al adquirir cualquier audio entra al Telegram privado de Pauline gratis. Audios recomendados para esta promo: Booster, Icon Aura y Select. Precio referencia audio individual: $1,170 MXN / $73 USD / \u20ac58 EUR.

Cuando recomiendes un audio, menciona brevemente si encaja en alguna promo (por ejemplo un combo del Hot Sale o el Telegram gratis con Matrix). Invita a WhatsApp si quieren aprovechar la oferta.

IM\u00c1GENES EN EL CHAT (obligatorio al final del mensaje, en l\u00ednea aparte, exactamente as\u00ed):
Si preguntan por promociones, descuentos, ofertas, Hot Sale, Hot Sale de los Pares, combos de pares, comprar dos audios juntos o algo relacionado con promos de pares, despu\u00e9s de tu respuesta incluye en la \u00faltima l\u00ednea: [IMG:hot sale de los pares.jpeg]
Si preguntan por Telegram privado, Para Salir de la Matrix, programa de Pauline, comunidad privada, salir de la matrix o algo relacionado con esa promo, despu\u00e9s de tu respuesta incluye en la \u00faltima l\u00ednea: [IMG:para salir de la m.jpeg]
Solo incluye cada etiqueta [IMG:...] cuando el tema de la pregunta corresponda; no las pongas en mensajes que no traten esas promos.

CIERRE DE VENTA (natural, c\u00e1lido y experto):
Cuando el cliente quiera comprar, confirma el audio o combo elegido (y la promo si aplica), luego pregunta exactamente: "\u00bfPor qu\u00e9 m\u00e9todo prefieres pagar?" Espera su respuesta y da SOLO los datos del m\u00e9todo que elijan:

- OXXO: dep\u00f3sito a tarjeta Banregio 4741 7435 2658 3795.
- Transferencia: CLABE NVIO 710969000048503916; o Banregio CLABE 058470000010260425, cuenta 996812170013, tarjeta 4741 7435 2658 3795.
- PayPal: https://paypal.me/sheismagique
- Crypto o Western Union: indica que escriban al WhatsApp +52 1 443 231 1761 para coordinar el pago.

En TODOS los m\u00e9todos, cierra siempre con este mensaje (puedes adaptarlo ligeramente pero conserva la informaci\u00f3n): "Una vez que hagas el pago, manda tu comprobante a eriorcenter@gmail.com indicando en el asunto el nombre del audio y tu Instagram, y te enviamos todo \ud83d\udc9c"

No des todos los m\u00e9todos de pago de golpe salvo que pregunten qu\u00e9 opciones hay; primero pregunta el m\u00e9todo preferido. Mant\u00e9n tono persuasivo pero respetuoso, sin presi\u00f3n excesiva.

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
      body: JSON.stringify({ error: 'Metodo no permitido' }),
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
      body: JSON.stringify({ error: 'JSON invalido' }),
    };
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Se requiere messages: array no vacio' }),
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
      body: JSON.stringify({ error: 'No hay mensajes validos' }),
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
        body: JSON.stringify({ error: 'Respuesta vacia del modelo' }),
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
