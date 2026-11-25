// Admin API for /admin. Reads the site's Netlify Forms submissions server-side.
// Needs two environment variables set in Netlify (never in this repo):
//   ADMIN_PASSWORD   the password Lulu types on /admin
//   NETLIFY_API_TOKEN a Netlify personal access token that can read this site's forms
import crypto from "node:crypto";

const SITE_ID_FALLBACK = "070ebd7c-ee52-4610-8a09-1d9d8671a14c";
const COOKIE = "lulu_admin";
const SESSION_HOURS = 12;

export const config = { path: "/api/admin/*" };

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers }
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function secrets() {
  const pw = process.env.ADMIN_PASSWORD, token = process.env.NETLIFY_API_TOKEN;
  if (!pw || !token) return null;
  // Signing key changes whenever the password or token changes, which signs everyone out.
  const key = crypto.createHash("sha256").update(`lulu-admin|${pw}|${token}`).digest();
  return { pw, token, key };
}

const sign = (key, payload) => crypto.createHmac("sha256", key).update(payload).digest("base64url");

function makeSession(key) {
  const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
  const payload = String(exp);
  return `${payload}.${sign(key, payload)}`;
}

function validSession(req, key) {
  const raw = (req.headers.get("cookie") || "").split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  if (!raw) return false;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split(".");
  if (!payload || !sig) return false;
  const good = Buffer.from(sign(key, payload)), given = Buffer.from(sig);
  if (good.length !== given.length || !crypto.timingSafeEqual(good, given)) return false;
  return Number(payload) > Date.now();
}

function samePassword(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

const cookie = (value, maxAge) =>
  `${COOKIE}=${value}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

async function api(token, path) {
  const r = await fetch(`https://api.netlify.com/api/v1${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`Netlify API ${r.status}`);
  return r.json();
}

async function allSubmissions(token, formId) {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const batch = await api(token, `/forms/${formId}/submissions?per_page=100&page=${page}`);
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out.map((s) => ({ date: s.created_at, ...s.data }));
}

export default async (req, context) => {
  const s = secrets();
  if (!s) return json({ error: "not_configured" }, 503);
  const action = new URL(req.url).pathname.replace(/^\/api\/admin\/?/, "");

  if (action === "login" && req.method === "POST") {
    let pw = "";
    try { pw = (await req.json()).password || ""; } catch (e) {}
    if (!samePassword(pw, s.pw)) {
      await sleep(2000); // slows down guessing
      return json({ error: "wrong_password" }, 401);
    }
    return json({ ok: true }, 200, { "Set-Cookie": cookie(makeSession(s.key), SESSION_HOURS * 3600) });
  }

  if (action === "logout" && req.method === "POST") {
    return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
  }

  if (action === "data" && req.method === "GET") {
    if (!validSession(req, s.key)) return json({ error: "signed_out" }, 401);
    const siteId = context?.site?.id || process.env.SITE_ID || SITE_ID_FALLBACK;
    const forms = await api(s.token, `/sites/${siteId}/forms`);
    const byName = Object.fromEntries(forms.map((f) => [f.name, f]));
    const [orders, updates] = await Promise.all([
      byName.order ? allSubmissions(s.token, byName.order.id) : [],
      byName.updates ? allSubmissions(s.token, byName.updates.id) : []
    ]);
    const strip = ({ ip, user_agent, referrer, "bot-field": _bot, ...rest }) => rest;
    return json({ orders: orders.map(strip), updates: updates.map(strip) });
  }

  return json({ error: "not_found" }, 404);
};
