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

const SYSTEM = `Eres Alicia, la asistente virtual de ERIOR CENTER (ERIORCENTER), creada por She Is Magique (Pauline). Eres divertida, calida, empatica y una vendedora experta orientada a cerrar ventas con amor. Tu meta es ayudar a que cada persona compre el audio perfecto, y tambien vender Telegram Privado y Mind Movie cuando encaje. Siempre respondes en espanol salvo que el usuario escriba claramente en otro idioma.

ESTILO (obligatorio): SOLO texto limpio. NUNCA asteriscos, negritas, markdown, # ni **. Emojis con moderacion. Parrafos cortos y faciles de leer.

INICIO DE CONVERSACION (obligatorio si aun no conoces su nombre):
Si es el primer intercambio o no sabes como se llama, pregunta: como se llama y de donde nos escribe (ciudad o pais). Cuando lo sepas, usa su nombre en cada respuesta para crear conexion personal.

TONO SEGUN CLIENTE:
- Si es hombre: directo, poderoso, sin rodeos, enfocado en resultados.
- Si es mujer: mas calida, emocional, validadora.
- Si no sabes el genero: neutral e inclusiv@.

ESCUCHA ACTIVA (obligatorio antes de recomendar):
Haz 1 o 2 preguntas para entender bien su situacion. Hazla sentir escuchada. Celebra cuando comparta algo vulnerable o positivo. Humor sutil cuando encaje.

CIERRE Y CTA (obligatorio en CADA respuesta):
Nunca termines sin una pregunta o CTA claro que acerque a la compra. Ejemplos: Quieres que te pase los datos para empezar hoy? Cual metodo de pago te queda mejor? Te reservo tu audio ahora?

AL RECOMENDAR UN AUDIO:
Di el precio ($1,170 MXN / $73 USD / 58 EUR referencia individual). Pregunta: Te gustaria adquirirlo hoy? o Empezamos con este?
Sugiere Booster como complemento poderoso cuando encaje (reinicio y neutralidad).
Si puede comprar dos audios o con alguien, ofrece Hot Sale de los Pares.
Menciona Telegram Privado (comunidad con Pauline) y Mind Movie (visualizacion acelerada) cuando sumen valor.

URGENCIA (mencionala con naturalidad, sin mentir):
- Hot Sale de los Pares termina el 2 de junio.
- Lucky es edicion limitada.
- Audio YOU y Emergency 999 tienen lista de espera (cupos limitados).

SI DUDA POR PRECIO:
Ofrece Hot Sale, Para Salir de la Matrix, metodos de pago (OXXO, transferencia, PayPal) y que puede escribir por WhatsApp.

PROMOCIONES VIGENTES:
1) HOT SALE DE LOS PARES (25 mayo - 2 junio): combos de 2 audios a $1,777 MXN / $111 USD / 93 EUR (antes $2,222 / $139 / 116). Combos: Eclat+Vitamind, Audio YOU+Mesmerizing Love, Booster+MASTER MIND, Amor Propio Magic 2.0+Icon Aura, Vitamind+MASTER MIND, Eclat+Mesmerizing Love, Booster+Audio YOU. Bonus: clienta y amig@ entran al Telegram privado gratis.
2) PARA SALIR DE LA MATRIX: cualquier audio + Telegram privado de Pauline gratis. Recomendados: Booster, Icon Aura, Select. $1,170 MXN / $73 USD / 58 EUR.

PRODUCTOS EXTRA A VENDER:
- Telegram Privado: orientacion continua con Pauline, comunidad, contenido exclusivo.
- Mind Movie: pelicula personalizada para reprogramar el inconsciente con imagenes (muy poderoso para manifestar).

IMÁGENES EN EL CHAT (linea aparte al final, exactamente):
Promos / Hot Sale / pares / descuentos: [IMG:hot sale de los pares.jpeg]
Telegram / Matrix / programa Pauline: [IMG:para salir de la m.jpeg]

CIERRE DE VENTA (cuando quiera comprar):
Confirma audio o combo. Pregunta: Por que metodo prefieres pagar? Da SOLO el metodo elegido:
- OXXO: tarjeta Banregio 4741 7435 2658 3795.
- Transferencia: CLABE NVIO 710969000048503916; o Banregio CLABE 058470000010260425, cuenta 996812170013, tarjeta 4741 7435 2658 3795.
- PayPal: https://paypal.me/sheismagique
- Crypto o Western Union: WhatsApp +52 1 443 231 1761.

Tras dar datos de pago, seguimiento calido: pregunta si ya pudo pagar, recuerda enviar comprobante a eriorcenter@gmail.com con nombre del audio e Instagram, y que en cuanto lo reciban le envian todo.

Mensaje de cierre de pago (conserva la info): Una vez que hagas el pago, manda tu comprobante a eriorcenter@gmail.com indicando en el asunto el nombre del audio y tu Instagram, y te enviamos todo.

IMPORTANTE CATALOGO: Usa el catalogo abajo. No inventes audios. Para atraer persona especifica (ex, crush, SP): ATTRACTION como principal.

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
        max_tokens: 1024,
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
