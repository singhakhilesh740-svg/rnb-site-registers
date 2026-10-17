// R&B Site Registers – Chatbot Worker (Cloudflare)
// Settings (Worker → Settings → Variables and Secrets):
//   ANTHROPIC_API_KEY   (Secret)  Anthropic console ki API key
//   FIREBASE_PROJECT_ID (Text)    Firebase project ID
//   ADMIN_EMAIL         (Text)    112ce0489@gmail.com
//   ALLOWED_ORIGINS     (Text)    https://singhakhilesh740-svg.github.io
export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || 'https://singhakhilesh740-svg.github.io').split(',').map(s => s.trim());
    const cors = {
      'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
      'Access-Control-Allow-Headers': 'authorization,content-type',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Vary': 'Origin'
    };
    const j = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'content-type': 'application/json' } });
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return j({ error: 'Sirf POST' }, 405);
    if (!allowed.includes(origin)) return j({ error: 'Ye website allowed nahi hai' }, 403);

    const tok = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/, '');
    let claims;
    try { claims = await verifyFirebase(tok, env.FIREBASE_PROJECT_ID); }
    catch (e) { return j({ error: 'Login sahi nahi: ' + e.message }, 401); }

    const admin = claims.email === env.ADMIN_EMAIL && claims.email_verified === true;
    if (!admin && !(await approved(tok, env.FIREBASE_PROJECT_ID, claims.sub)))
      return j({ error: 'Admin ne abhi aapko chatbot ki permission nahi di' }, 403);

    let body;
    try { body = await req.json(); } catch { return j({ error: 'Galat request' }, 400); }
    const models = ['claude-sonnet-5-5', 'claude-opus-5-5', 'claude-haiku-5-5'];
    const payload = {
      model: models.includes(body.model) ? body.model : models[0],
      max_tokens: Math.min(+body.max_tokens || 4000, 16000),
      system: body.system,
      messages: body.messages
    };
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return new Response(await r.text(), { status: r.status, headers: { ...cors, 'content-type': 'application/json' } });
  }
};

let certs = null, certsAt = 0;
async function verifyFirebase(tok, pid) {
  const [h, p, s] = (tok || '').split('.');
  if (!s) throw new Error('token nahi mila');
  const dec = x => JSON.parse(new TextDecoder().decode(b64u(x)));
  const head = dec(h), pl = dec(p), now = Date.now() / 1000;
  if (pl.aud !== pid || pl.iss !== 'https://securetoken.google.com/' + pid || pl.exp < now || !pl.sub) throw new Error('token galat ya expire');
  if (!certs || Date.now() - certsAt > 3600e3) {
    certs = (await (await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')).json()).keys;
    certsAt = Date.now();
  }
  const jwk = certs.find(k => k.kid === head.kid);
  if (!jwk) throw new Error('key nahi mili');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(s), new TextEncoder().encode(h + '.' + p));
  if (!ok) throw new Error('signature galat');
  return pl;
}
function b64u(x) { x = x.replace(/-/g, '+').replace(/_/g, '/'); while (x.length % 4) x += '='; const b = atob(x); return Uint8Array.from(b, c => c.charCodeAt(0)); }
async function approved(tok, pid, uid) {
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/users/${uid}`, { headers: { authorization: 'Bearer ' + tok } });
  if (!r.ok) return false;
  const d = await r.json();
  return d.fields?.approved?.booleanValue === true && d.fields?.blocked?.booleanValue !== true;
}
