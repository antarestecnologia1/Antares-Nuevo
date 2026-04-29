/**
 * Cliente HTTP mínimo para apps/api (prefijo global /api).
 * URL: localStorage.antares_api_base o window.__ANTARES_API_BASE__
 * Token: localStorage.antares_api_access_token o sesión antares_session_v2.accessToken
 */
(function registerApiClient() {
  function normalizeBase(url) {
    if (!url || typeof url !== "string") return "";
    return url.trim().replace(/\/+$/, "");
  }

  function getBase() {
    try {
      const fromWin = typeof window.__ANTARES_API_BASE__ === "string" ? window.__ANTARES_API_BASE__ : "";
      const fromLs = localStorage.getItem("antares_api_base") || "";
      return normalizeBase(fromWin || fromLs);
    } catch {
      return "";
    }
  }

  function getAccessToken() {
    try {
      const direct = (localStorage.getItem("antares_api_access_token") || "").trim();
      if (direct) return direct;
      const sessionRaw = localStorage.getItem("antares_session_v2");
      if (!sessionRaw) return "";
      const session = JSON.parse(sessionRaw);
      return String(session?.accessToken || "").trim();
    } catch {
      return "";
    }
  }

  function hasBase() {
    return Boolean(getBase());
  }

  function isConfigured() {
    return Boolean(getBase() && getAccessToken());
  }

  function setAccessToken(token) {
    try {
      if (token) localStorage.setItem("antares_api_access_token", String(token).trim());
      else localStorage.removeItem("antares_api_access_token");
    } catch (_) {}
  }

  async function request(method, path, body) {
    const base = getBase();
    const auth = getAccessToken();
    if (!base) throw new Error("API: falta URL base (antares_api_base o __ANTARES_API_BASE__)");
    if (!auth) throw new Error("API: falta token de acceso");
    const rel = path.startsWith("/") ? path : `/${path}`;
    const url = `${base}/api${rel}`;
    /** @type {Record<string, string>} */
    const headers = { Accept: "application/json", Authorization: `Bearer ${auth}` };
    const opts = /** @type {RequestInit} */ ({ method, headers });
    if (body !== undefined && body !== null) {
      headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    if (!res.ok) {
      let msg = res.statusText;
      if (typeof data === "object" && data && data.message) {
        msg = Array.isArray(data.message) ? data.message.join(", ") : String(data.message);
      }
      const err = new Error(msg || `HTTP ${res.status}`);
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  }

  function getJson(path) {
    return request("GET", path);
  }

  function postJson(path, body) {
    return request("POST", path, body);
  }

  window.AntaresApi = {
    getBase,
    getAccessToken,
    hasBase,
    isConfigured,
    setAccessToken,
    request,
    getJson,
    postJson
  };
})();
