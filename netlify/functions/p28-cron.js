/**
 * Cada 5 min despierta a p28-api (action=tick), que es quien manda los 4 avisos al día.
 * Las funciones programadas no siempre traen acceso a Blobs; p28-api sí.
 */
const TICK_KEY = 'p28-tick-8e2f41';

function siteUrl() {
  return (process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://eriorcenterguiaaudios.netlify.app').replace(/\/$/, '');
}

exports.config = { schedule: '*/5 * * * *' };

exports.handler = async () => {
  try {
    const res = await fetch(siteUrl() + '/.netlify/functions/p28-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tick-key': TICK_KEY },
      body: JSON.stringify({ action: 'tick', source: 'netlify-cron' }),
    });
    const text = await res.text();
    return { statusCode: 200, body: text };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message || 'cron' }) };
  }
};
