/**
 * Panel admin: crear, listar y desactivar códigos Alicia Premium.
 * Header requerido: X-Admin-Key = ALICIA_ADMIN_PASSWORD (Netlify env)
 */

const {
  corsHeaders,
  getSupabaseConfig,
  checkAdminKey,
  generatePremiumCode,
  generateReferralCode,
  createReferralForPremiumCode,
  revokeActivationsForCode,
  sbFetch,
} = require('./premium-lib');

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (!checkAdminKey(event)) {
    return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: 'No autorizado' }) };
  }

  if (!getSupabaseConfig()) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ ok: false, error: 'Falta SUPABASE_SERVICE_ROLE_KEY en Netlify' }),
    };
  }

  if (event.httpMethod === 'GET') {
    try {
      const qs = event.queryStringParameters || {};
      const lookupCode = (qs.conversations_by_code || qs.code_lookup || '').trim().toUpperCase();
      if (lookupCode) {
        const codeRes = await sbFetch(
          `alicia_premium_codes?code=eq.${encodeURIComponent(lookupCode)}&select=id,code,client_name,client_email,client_whatsapp,notes,active,activation_count,max_activations,created_at,last_activated_at,last_visitante_id&limit=1`,
          { method: 'GET' }
        );
        if (!codeRes.ok) {
          return {
            statusCode: 502,
            headers,
            body: JSON.stringify({ ok: false, error: 'Error al leer código Premium' }),
          };
        }
        const code = Array.isArray(codeRes.data) && codeRes.data[0] ? codeRes.data[0] : null;
        if (!code) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ ok: false, error: 'Código no encontrado' }),
          };
        }

        const actRes = await sbFetch(
          `alicia_premium_activations?code_id=eq.${encodeURIComponent(code.id)}&select=id,visitante_id,activated_at,expires_at,revoked_at&order=activated_at.desc&limit=50`,
          { method: 'GET' }
        );
        const activations = actRes.ok && Array.isArray(actRes.data) ? actRes.data : [];
        const visitanteSet = new Set(activations.map((a) => a.visitante_id).filter(Boolean));
        if (code.last_visitante_id) visitanteSet.add(code.last_visitante_id);

        const sessions = [];
        for (const vid of visitanteSet) {
          let lead = null;
          const leadRes = await sbFetch(
            `alicia_leads?visitante_id=eq.${encodeURIComponent(vid)}&select=nombre,telefono,email,audio_interes,tier,mensajes_count,updated_at&limit=1`,
            { method: 'GET' }
          );
          if (leadRes.ok && Array.isArray(leadRes.data) && leadRes.data[0]) lead = leadRes.data[0];

          const convRes = await sbFetch(
            `alicia_conversaciones?visitante_id=eq.${encodeURIComponent(vid)}&select=id,tier,audio_mencionado,mensajes_count,created_at,updated_at&order=created_at.desc&limit=50`,
            { method: 'GET' }
          );
          const convs = convRes.ok && Array.isArray(convRes.data) ? convRes.data : [];

          if (!convs.length) {
            sessions.push({ visitante_id: vid, lead, conversation: null, messages: [] });
            continue;
          }

          for (const conv of convs) {
            const msgRes = await sbFetch(
              `alicia_mensajes?conversacion_id=eq.${encodeURIComponent(conv.id)}&select=id,rol,contenido,created_at&order=created_at.asc&limit=500`,
              { method: 'GET' }
            );
            sessions.push({
              visitante_id: vid,
              lead,
              conversation: conv,
              messages: msgRes.ok && Array.isArray(msgRes.data) ? msgRes.data : [],
            });
          }
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            ok: true,
            code,
            activations,
            visitantes: Array.from(visitanteSet),
            sessions,
            message_count: sessions.reduce((n, s) => n + (s.messages ? s.messages.length : 0), 0),
          }),
        };
      }

      const listReferrals = qs.referrals === '1';
      if (listReferrals) {
        const refRes = await sbFetch(
          'erior_referidos?select=id,ref_code,owner_name,owner_contact,hit_count,lead_count,conversion_count,active,created_at,premium_code_id,notes&order=created_at.desc&limit=200',
          { method: 'GET' }
        );
        if (!refRes.ok) {
          return {
            statusCode: 502,
            headers,
            body: JSON.stringify({
              ok: false,
              error: 'Error al leer referidos. ¿Ejecutaste supabase/referidos.sql?',
            }),
          };
        }
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, referrals: refRes.data || [] }) };
      }

      const res = await sbFetch(
        'alicia_premium_codes?select=id,code,client_name,client_email,client_whatsapp,notes,active,max_activations,activation_count,expires_at,created_at,last_activated_at&order=created_at.desc&limit=200',
        { method: 'GET' }
      );
      if (!res.ok) {
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({ ok: false, error: 'Error al leer códigos. ¿Ejecutaste supabase/alicia-premium.sql?' }),
        };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, codes: res.data || [] }) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'Método no permitido' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'JSON inválido' }) };
  }

  const action = body.action || 'create';

  try {
    if (action === 'create') {
      const code = (body.code || generatePremiumCode()).trim().toUpperCase();
      const row = {
        code,
        client_name: (body.client_name || '').trim() || null,
        client_email: (body.client_email || '').trim() || null,
        client_whatsapp: (body.client_whatsapp || '').trim() || null,
        notes: (body.notes || '').trim() || null,
        max_activations: Math.max(1, parseInt(body.max_activations, 10) || 1),
        active: true,
        created_by: 'admin',
      };
      if (body.expires_at) row.expires_at = body.expires_at;

      const res = await sbFetch('alicia_premium_codes', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify([row]),
      });
      if (!res.ok) {
        const msg =
          res.data && res.data.message ? res.data.message : 'No se pudo crear el código';
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: msg }) };
      }
      const created = Array.isArray(res.data) ? res.data[0] : res.data;
      let referral = null;
      try {
        referral = await createReferralForPremiumCode(created);
      } catch (refErr) {
        console.error('referral auto-create:', refErr.message);
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, code: created, referral }),
      };
    }

    if (action === 'create_referral') {
      const refCode = (body.ref_code || generateReferralCode(body.owner_name)).trim().toUpperCase();
      const row = {
        ref_code: refCode,
        owner_name: (body.owner_name || '').trim() || null,
        owner_contact: (body.owner_contact || '').trim() || null,
        owner_visitante_id: (body.owner_visitante_id || '').trim() || null,
        premium_code_id: body.premium_code_id || null,
        notes: (body.notes || '').trim() || null,
        active: true,
      };
      const res = await sbFetch('erior_referidos', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify([row]),
      });
      if (!res.ok) {
        const msg = res.data && res.data.message ? res.data.message : 'No se pudo crear el referido';
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: msg }) };
      }
      const created = Array.isArray(res.data) ? res.data[0] : res.data;
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, referral: created }) };
    }

    if (action === 'toggle_referral') {
      const id = body.id;
      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Falta id' }) };
      }
      const active = body.active !== false;
      const res = await sbFetch(`erior_referidos?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) {
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'No se pudo actualizar' }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'toggle') {
      const id = body.id;
      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Falta id' }) };
      }
      const active = body.active !== false;
      const res = await sbFetch(`alicia_premium_codes?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) {
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'No se pudo actualizar' }) };
      }
      if (!active) {
        try {
          await revokeActivationsForCode(id);
        } catch (revErr) {
          console.error('revoke activations:', revErr.message);
        }
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, revoked: !active }) };
    }

    if (action === 'delete') {
      const id = body.id;
      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Falta id' }) };
      }
      const res = await sbFetch(`alicia_premium_codes?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' },
      });
      if (!res.ok) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ ok: false, error: 'No se pudo borrar el código' }),
        };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, deleted: true }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Acción desconocida' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
