/**
 * Cliente API: respaldo automático por Bearer cuando el navegador bloquea las cookies cross-site
 * (incógnito, Safari, Brave, otro equipo) y re-sincronización del token CSRF.
 * Ejecutar: node qa/api-client-bearer-auto.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "modules/core/api-client.js"), "utf8");

function makeStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k)
  };
}

/** Servidor simulado: con `cookiesWork=false` ignora cookies (solo acepta Bearer). */
function makeEnv({ cookiesWork, rotateCsrf = false }) {
  const calls = [];
  let serverCsrf = "csrf-1";
  const win = {};
  const ls = makeStorage();
  const ss = makeStorage();
  ls.setItem("antares_session_v2", JSON.stringify({ userId: "u1" }));
  const fetchImpl = async (url, opts = {}) => {
    const path = String(url).replace(/^https:\/\/antares-nuevo\.onrender\.com\/api/, "");
    const h = opts.headers || {};
    calls.push({ path, method: opts.method || "GET", headers: { ...h } });
    const json = (status, body) => ({
      ok: status >= 200 && status < 300,
      status,
      statusText: "",
      text: async () => JSON.stringify(body),
      json: async () => body,
      clone() {
        return this;
      }
    });
    if (path === "/auth/login") {
      return json(200, {
        user: { userId: "u1" },
        csrfToken: serverCsrf,
        ...(h["X-Antares-Bearer-Fallback"] ? { accessToken: "AT", refreshToken: "RT" } : {})
      });
    }
    if (path === "/auth/refresh") {
      return json(200, { ok: true, user: { userId: "u1" }, csrfToken: serverCsrf });
    }
    const bearerOk = h.Authorization === "Bearer AT";
    if (!cookiesWork && !bearerOk) return json(401, { message: "Unauthorized" });
    if ((opts.method || "GET") !== "GET") {
      const sent = h["X-CSRF-Token"];
      if (sent !== serverCsrf) return json(403, { message: "Token CSRF inválido o ausente." });
    }
    return json(200, { id: "u1", path });
  };
  const ctx = {
    window: win,
    localStorage: ls,
    sessionStorage: ss,
    document: { cookie: "" },
    location: { hostname: "www.transportesantares.co" },
    navigator: { userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome", platform: "Win32", maxTouchPoints: 0 },
    fetch: fetchImpl,
    setTimeout,
    clearTimeout,
    AbortController,
    URL,
    console
  };
  win.__ANTARES_API_BASE__ = "https://antares-nuevo.onrender.com";
  ctx.window = win;
  vm.createContext(ctx);
  win.localStorage = ls;
  vm.runInContext(src, ctx);
  globalThis.__fetchForTest = async (path, headers) => {
    const r = await fetchImpl(`https://antares-nuevo.onrender.com/api${path}`, { method: "POST", headers });
    return r.json();
  };
  return { api: win.AntaresApi, calls, ss, rotate: () => (serverCsrf = "csrf-2"), win };
}

// 1) Cookies bloqueadas: login pide tokens, la primera llamada da 401 y se pasa a Bearer.
{
  const { api, calls, ss } = makeEnv({ cookiesWork: false });
  assert.equal(api.bearerAuthFallbackEnabled(), false, "escritorio arranca con cookies");
  assert.equal(api.wantsBearerTokensInResponse(), true, "API cross-site: pide tokens en login");
  const loginRes = await fetch_login(api);
  assert.ok(loginRes);
  const me = await api.getJson("/portal/me");
  assert.equal(me.id, "u1");
  assert.equal(api.bearerAuthFallbackEnabled(), true, "se activó el respaldo Bearer");
  assert.equal(ss.getItem("antares_bearer_auto"), "1");
  const meCalls = calls.filter((c) => c.path === "/portal/me");
  assert.equal(meCalls.length, 2, "reintenta una vez");
  assert.equal(meCalls[1].headers.Authorization, "Bearer AT");
  const posted = await api.postJson("/portal/accept-data-policy", { acceptTerms: true });
  assert.equal(posted.id, "u1", "la aceptación funciona sin cookies");
  api.clearBearerTokens();
  assert.equal(api.bearerAuthFallbackEnabled(), false, "cerrar sesión limpia el respaldo");
}

// 2) Cookies funcionan: no se activa Bearer.
{
  const { api, calls } = makeEnv({ cookiesWork: true });
  await fetch_login(api);
  await api.getJson("/portal/me");
  assert.equal(api.bearerAuthFallbackEnabled(), false);
  assert.equal(calls.filter((c) => c.path === "/portal/me").length, 1);
  assert.equal(calls.find((c) => c.path === "/portal/me").headers.Authorization, undefined);
}

// 3) CSRF rotado por otra sesión: 403 → refresh → reintento correcto.
{
  const { api, calls, rotate } = makeEnv({ cookiesWork: true });
  await fetch_login(api);
  rotate();
  const r = await api.postJson("/portal/accept-data-policy", { acceptDataPolicy: true });
  assert.equal(r.id, "u1");
  assert.equal(calls.filter((c) => c.path === "/auth/refresh").length, 1);
  assert.equal(calls.filter((c) => c.path === "/portal/accept-data-policy").length, 2);
}

// 4) Mismo sitio / localhost: no pide tokens.
{
  const { api, win } = makeEnv({ cookiesWork: true });
  win.__ANTARES_API_BASE__ = "https://api.transportesantares.co";
  assert.equal(api.wantsBearerTokensInResponse(), false, "mismo dominio registrable: solo cookies");
}

console.log("api-client-bearer-auto: OK");

async function fetch_login(api) {
  // Réplica del login de auth.js: cabecera según wantsBearerTokensInResponse + applyAuthTokensFromResponse.
  const headers = { "Content-Type": "application/json" };
  if (api.wantsBearerTokensInResponse()) headers["X-Antares-Bearer-Fallback"] = "1";
  const res = await globalThis.__fetchForTest("/auth/login", headers);
  api.applyAuthTokensFromResponse(res);
  return res;
}
