/**
 * Acceso al libro MENTAL TECH con códigos únicos (Supabase + Storage signed URL).
 */
const {
  corsHeaders,
  getSupabaseConfig,
  checkAdminKey,
  normalizeCode,
  sbFetch,
} = require('./premium-lib');

const BUCKET = process.env.ERIOR_LIBRO_BUCKET || 'erior-libro';
const OBJECT_PATH = process.env.ERIOR_LIBRO_PATH || 'mental-tech-es.pdf';
const SIGN_SECONDS = parseInt(process.env.ERIOR_LIBRO_SIGN_SECONDS || '7200', 10) || 7200;

function randPart(n) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < n; i += 1) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function generateLibroCode() {
  return `LIBRO-${randPart(4)}-${randPart(4)}`;
}

async function createSignedLibroUrl() {
  const cfg = getSupabaseConfig();
  if (!cfg) throw new Error('Falta SUPABASE');
  const expiresIn = Math.min(Math.max(SIGN_SECONDS, 600), 86400);
  const res = await fetch(
    `${cfg.url}/storage/v1/object/sign/${encodeURIComponent(BUCKET)}/${OBJECT_PATH.split('/').map(encodeURIComponent).join('/')}`,
    {
      method: 'POST',
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn }),
    }
  );
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg =
      (data && (data.error || data.message || data.msg)) ||
      `No se pudo firmar el PDF (${res.status}). ¿Subiste mental-tech-es.pdf al bucket erior-libro?`;
    const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    err.status = res.status;
    throw err;
  }
  const signedPath = data && (data.signedURL || data.signedUrl);
  if (!signedPath) {
    const err = new Error('Respuesta de Storage sin signedURL');
    err.status = 502;
    throw err;
  }
  const url = signedPath.startsWith('http')
    ? signedPath
    : `${cfg.url}/storage/v1${signedPath.startsWith('/') ? '' : '/'}${signedPath}`;
  return { url, expiresIn };
}

async function validateAndActivateLibroCode(rawCode, visitanteId) {
  const code = normalizeCode(rawCode);
  const vid = String(visitanteId || '').trim().slice(0, 80);
  if (!code || code.length < 6) {
    return { ok: false, status: 400, error: 'Escribe un código válido' };
  }
  if (!vid) {
    return { ok: false, status: 400, error: 'Falta visitante_id' };
  }

  const codeRes = await sbFetch(
    `erior_libro_codes?code=eq.${encodeURIComponent(code)}&select=id,code,active,max_activations,activation_count,client_name&limit=1`,
    { method: 'GET' }
  );
  if (!codeRes.ok) {
    return {
      ok: false,
      status: 502,
      error: 'Error al leer códigos. ¿Ejecutaste supabase/erior-libro.sql?',
    };
  }
  const row = Array.isArray(codeRes.data) && codeRes.data[0] ? codeRes.data[0] : null;
  if (!row) return { ok: false, status: 404, error: 'Código no encontrado' };
  if (!row.active) return { ok: false, status: 403, error: 'Este código fue desactivado' };

  const existing = await sbFetch(
    `erior_libro_activations?code_id=eq.${encodeURIComponent(row.id)}&visitante_id=eq.${encodeURIComponent(vid)}&select=id&limit=1`,
    { method: 'GET' }
  );
  const hasActivation =
    existing.ok && Array.isArray(existing.data) && existing.data[0];

  if (!hasActivation) {
    if (row.activation_count >= row.max_activations) {
      return {
        ok: false,
        status: 403,
        error:
          'Este código ya fue usado en otro dispositivo. Escribe PAULINE en WhatsApp para liberarlo.',
      };
    }
    const ins = await sbFetch('erior_libro_activations', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        code_id: row.id,
        visitante_id: vid,
      }),
    });
    if (!ins.ok) {
      // carrera: otro dispositivo pudo activar
      const again = await sbFetch(
        `erior_libro_codes?id=eq.${encodeURIComponent(row.id)}&select=activation_count,max_activations&limit=1`,
        { method: 'GET' }
      );
      const latest = again.ok && Array.isArray(again.data) && again.data[0];
      if (latest && latest.activation_count >= latest.max_activations) {
        return {
          ok: false,
          status: 403,
          error: 'Este código ya fue usado. Pide un código nuevo al equipo Erior.',
        };
      }
      return { ok: false, status: 502, error: 'No se pudo activar el código. Intenta de nuevo.' };
    }
    await sbFetch(`erior_libro_codes?id=eq.${encodeURIComponent(row.id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        activation_count: (row.activation_count || 0) + 1,
        last_activated_at: new Date().toISOString(),
        last_visitante_id: vid,
      }),
    });
  } else {
    await sbFetch(`erior_libro_activations?id=eq.${encodeURIComponent(existing.data[0].id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ last_seen_at: new Date().toISOString() }),
    });
  }

  let signed;
  try {
    signed = await createSignedLibroUrl();
  } catch (e) {
    return {
      ok: false,
      status: e.status || 502,
      error: e.message || 'No se pudo abrir el libro',
    };
  }

  return {
    ok: true,
    status: 200,
    code: row.code,
    client_name: row.client_name || '',
    pdf_url: signed.url,
    expires_in: signed.expiresIn,
  };
}

module.exports = {
  corsHeaders,
  getSupabaseConfig,
  checkAdminKey,
  normalizeCode,
  sbFetch,
  generateLibroCode,
  createSignedLibroUrl,
  validateAndActivateLibroCode,
  BUCKET,
  OBJECT_PATH,
};
