/**
 * Cliente API: token de acceso vencido (401) → renovación única + reintento, y cierre ordenado cuando la
 * sesión ya no se puede renovar (evita la vista vacía "sin datos").
 * Ejecutar: node qa/api-client-refresh-401.test.mjs
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

/**
 * Servidor simulado. `accessValid` empieza en false (token vencido); un refresh correcto lo vuelve true.
 * refreshMode: "ok" | "invalid" (401) | "network" (lanza) | "ok-but-still-401" (refresca pero el acceso sigue fallando)
 */
function makeEnv({ refreshMode = "ok", withLocks = false, refreshDelayMs = 0 } = {}) {
  const calls = [];
  const events = [];
  let accessValid = false;
  const win = {
    dispatchEvent(ev) {
      events.push({ type: ev.type, detail: ev.detail });
      return true;
    }
  };
  const ls = makeStorage();
  ls.setItem("antares_session_v2", JSON.stringify({ userId: "u1" }));
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
  const fetchImpl = async (url, opts = {}) => {
    const path = String(url).replace(/^https:\/\/antares-nuevo\.onrender\.com\/api/, "");
    calls.push({ path, method: opts.method || "GET" });
    if (path === "/auth/refresh") {
      if (refreshDelayMs) await new Promise((r) => setTimeout(r, refreshDelayMs));
      if (refreshMode === "network") throw new TypeError("Failed to fetch");
      if (refreshMode === "invalid") return json(401, { message: "Refresh token inválido" });
      if (refreshMode === "ok") accessValid = true;
      return json(200, { ok: true, user: { userId: "u1" }, csrfToken: "csrf-1" });
    }
    if (!accessValid) return json(401, { statusCode: 401, message: "Unauthorized" });
    return json(200, { ok: true, path });
  };
  const ctx = {
    window: win,
    localStorage: ls,
    sessionStorage: makeStorage(),
    document: { cookie: "antares_csrf=csrf-1" },
    location: { hostname: "www.transportesantares.co" },
    navigator: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome",
      platform: "Win32",
      maxTouchPoints: 0,
      ...(withLocks
        ? {
            locks: {
              _q: Promise.resolve(),
              request(_name, cb) {
                const run = this._q.then(() => cb());
                this._q = run.catch(() => {});
                return run;
              }
            }
          }
        : {})
    },
    fetch: fetchImpl,
    setTimeout,
    clearTimeout,
    AbortController,
    CustomEvent: class CustomEvent {
      constructor(type, init) {
        this.type = type;
        this.detail = init && init.detail;
      }
    },
    URL,
    console
  };
  win.__ANTARES_API_BASE__ = "https://antares-nuevo.onrender.com";
  win.localStorage = ls;
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return { api: win.AntaresApi, calls, events };
}

const count = (calls, path) => calls.filter((c) => c.path === path).length;

// A) Token vencido: un solo refresh y la petición se repite con éxito (crear empleado = sync-key).
{
  const { api, calls, events } = makeEnv();
  const r = await api.postJson("/portal/sync-key", { key: "payrollEmployees", data: [] });
  assert.equal(r.ok, true);
  assert.equal(count(calls, "/auth/refresh"), 1, "un refresh");
  assert.equal(count(calls, "/portal/sync-key"), 2, "primer intento 401 + reintento");
  assert.equal(events.length, 0, "no se cierra la sesión");
}

// B) Varias peticiones simultáneas con el token vencido: exactamente un refresh.
{
  const { api, calls, events } = makeEnv({ refreshDelayMs: 20 });
  const out = await Promise.all([
    api.getJson("/portal/me"),
    api.getJson("/portal/bootstrap"),
    api.getJson("/portal/notifications"),
    api.postJson("/portal/sync-key", { key: "payrollEmployees", data: [] }),
    api.getJson("/portal/positions")
  ]);
  assert.ok(out.every((x) => x.ok === true));
  assert.equal(count(calls, "/auth/refresh"), 1, "refresh único con 5 peticiones en paralelo");
  assert.equal(events.length, 0);
}

// B2) Igual, con Web Locks disponibles (varias pestañas).
{
  const { api, calls } = makeEnv({ withLocks: true, refreshDelayMs: 10 });
  await Promise.all([api.getJson("/portal/me"), api.getJson("/portal/bootstrap")]);
  assert.equal(count(calls, "/auth/refresh"), 1);
}

// C) Refresh rechazado (401): mensaje legible y evento de sesión vencida una sola vez.
{
  const { api, events } = makeEnv({ refreshMode: "invalid" });
  const results = await Promise.allSettled([
    api.postJson("/portal/sync-key", { key: "payrollEmployees", data: [] }),
    api.getJson("/portal/bootstrap")
  ]);
  for (const r of results) {
    assert.equal(r.status, "rejected");
    assert.equal(r.reason.status, 401);
    assert.match(r.reason.message, /sesión venció/i, "ya no se muestra 'Unauthorized' en inglés");
  }
  assert.equal(events.filter((e) => e.type === "antares-session-expired").length, 1, "evento único");
  assert.equal(events[0].detail.reason, "refresh-invalid");
}

// D) Refresh correcto pero el acceso sigue dando 401: sesión inutilizable → evento.
{
  const { api, events } = makeEnv({ refreshMode: "ok-but-still-401" });
  await assert.rejects(() => api.getJson("/portal/me"), /sesión venció/i);
  assert.equal(events.length, 1);
  assert.equal(events[0].detail.reason, "unauthorized-after-refresh");
}

// E) Error de red al renovar: NO se cierra la sesión (puede ser corte temporal).
{
  const { api, events } = makeEnv({ refreshMode: "network" });
  await assert.rejects(() => api.getJson("/portal/me"), (e) => e.status === 401);
  assert.equal(events.length, 0, "sin cierre de sesión por fallo de red");
}

// F) refreshSession: reutiliza un refresh reciente; `force` sí vuelve a llamar.
{
  const { api, calls } = makeEnv();
  const a = await api.refreshSession({ force: true });
  assert.equal(a.status, "ok");
  const b = await api.refreshSession();
  assert.equal(b.reused, true);
  assert.equal(count(calls, "/auth/refresh"), 1);
  await api.refreshSession({ force: true });
  assert.equal(count(calls, "/auth/refresh"), 2);
  assert.ok(api.getLastRefreshOkAt() > 0);
}

// G) refreshSession con refresh inválido devuelve "invalid" (lo usa el mantenimiento programado).
{
  const { api } = makeEnv({ refreshMode: "invalid" });
  const r = await api.refreshSession({ force: true });
  assert.equal(r.status, "invalid");
}

console.log("api-client-refresh-401: OK");
