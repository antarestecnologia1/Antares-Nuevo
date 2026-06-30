/**
 * Cliente HTTP mínimo para apps/api (prefijo global /api).
 * URL: localStorage.antares_api_base o window.__ANTARES_API_BASE__
 * Autenticación: cookies HttpOnly (antares_at / antares_rt) + CSRF en mutaciones.
 */
(function registerApiClient() {
  const CSRF_COOKIE = "antares_csrf";
  const CSRF_HEADER = "X-CSRF-Token";
  const SESSION_KEY = "antares_session_v2";
  const ACCESS_TOKEN_SS_KEY = "antares_api_at";
  const REFRESH_TOKEN_SS_KEY = "antares_api_rt";

  let csrfTokenMemory = "";
  let accessTokenMemory = "";

  function normalizeBase(url) {
    if (!url || typeof url !== "string") return "";
    let s = url.trim().replace(/\/+$/, "");
    while (/\/api$/i.test(s)) {
      s = s.slice(0, -4).replace(/\/+$/, "");
    }
    return s;
  }

  function isLocalDevHost() {
    try {
      const host = String(location.hostname || "").toLowerCase();
      return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".localhost");
    } catch (_e) {
      return false;
    }
  }

  function getBase() {
    try {
      const fromWin = typeof window.__ANTARES_API_BASE__ === "string" ? window.__ANTARES_API_BASE__ : "";
      const fromLs = isLocalDevHost() ? localStorage.getItem("antares_api_base") || "" : "";
      return normalizeBase(fromWin || fromLs);
    } catch {
      return "";
    }
  }

  function readCsrfFromDocumentCookie() {
    try {
      const parts = String(document.cookie || "").split(";");
      for (let i = 0; i < parts.length; i++) {
        const chunk = parts[i].trim();
        if (!chunk.startsWith(`${CSRF_COOKIE}=`)) continue;
        return decodeURIComponent(chunk.slice(CSRF_COOKIE.length + 1));
      }
    } catch (_e) {
      /* noop */
    }
    return "";
  }

  function getCsrfToken() {
    const mem = String(csrfTokenMemory || "").trim();
    if (mem) return mem;
    return String(readCsrfFromDocumentCookie() || "").trim();
  }

  function setCsrfToken(token) {
    csrfTokenMemory = String(token || "").trim();
  }

  function hasPortalSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const session = JSON.parse(raw);
      return Boolean(session && session.userId);
    } catch {
      return false;
    }
  }

  function isIosWebKitClient() {
    try {
      const ua = String(navigator.userAgent || "");
      if (/iPad|iPhone|iPod/i.test(ua)) return true;
      return navigator.platform === "MacIntel" && Number(navigator.maxTouchPoints || 0) > 1;
    } catch (_e) {
      return false;
    }
  }

  /** Solo iPhone/iPad (WebKit). Escritorio sigue con cookies HttpOnly sin cambios. */
  function bearerAuthFallbackEnabled() {
    if (typeof window.__ANTARES_FORCE_BEARER_AUTH__ === "boolean") {
      return window.__ANTARES_FORCE_BEARER_AUTH__;
    }
    return isIosWebKitClient();
  }

  function readStoredAccessToken() {
    const mem = String(accessTokenMemory || "").trim();
    if (mem) return mem;
    try {
      return String(sessionStorage.getItem(ACCESS_TOKEN_SS_KEY) || "").trim();
    } catch (_e) {
      return "";
    }
  }

  function readStoredRefreshToken() {
    try {
      return String(sessionStorage.getItem(REFRESH_TOKEN_SS_KEY) || "").trim();
    } catch (_e) {
      return "";
    }
  }

  /**
   * JWT de acceso en sessionStorage (solo iOS): respaldo cuando WebKit bloquea cookies cross-site.
   * En escritorio devuelve vacío; la autenticación sigue siendo solo por cookies HttpOnly.
   */
  function getAccessToken() {
    if (!bearerAuthFallbackEnabled()) return "";
    return readStoredAccessToken();
  }

  function setAccessToken(token) {
    if (!bearerAuthFallbackEnabled()) {
      accessTokenMemory = "";
      return;
    }
    const next = String(token || "").trim();
    accessTokenMemory = next;
    try {
      if (next) sessionStorage.setItem(ACCESS_TOKEN_SS_KEY, next);
      else sessionStorage.removeItem(ACCESS_TOKEN_SS_KEY);
      localStorage.removeItem("antares_api_access_token");
    } catch (_e) {
      /* noop */
    }
  }

  function getRefreshToken() {
    if (!bearerAuthFallbackEnabled()) return "";
    return readStoredRefreshToken();
  }

  function setRefreshToken(token) {
    if (!bearerAuthFallbackEnabled()) return;
    const next = String(token || "").trim();
    try {
      if (next) sessionStorage.setItem(REFRESH_TOKEN_SS_KEY, next);
      else sessionStorage.removeItem(REFRESH_TOKEN_SS_KEY);
    } catch (_e) {
      /* noop */
    }
  }

  function clearBearerTokens() {
    accessTokenMemory = "";
    try {
      sessionStorage.removeItem(ACCESS_TOKEN_SS_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_SS_KEY);
      localStorage.removeItem("antares_api_access_token");
    } catch (_e) {
      /* noop */
    }
  }

  function applyAuthTokensFromResponse(data) {
    if (!data || typeof data !== "object") return;
    if (data.csrfToken) setCsrfToken(data.csrfToken);
    if (!bearerAuthFallbackEnabled()) return;
    if (data.accessToken) setAccessToken(data.accessToken);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
  }

  function hasBase() {
    return Boolean(getBase());
  }

  function isConfigured() {
    return Boolean(getBase() && hasPortalSession());
  }

  function isMutatingMethod(method) {
    const m = String(method || "GET").toUpperCase();
    return m === "POST" || m === "PUT" || m === "PATCH" || m === "DELETE";
  }

  function buildFetchHeaders(method, extra) {
    /** @type {Record<string, string>} */
    const headers = { ...(extra || {}) };
    if (bearerAuthFallbackEnabled()) headers["X-Antares-Bearer-Fallback"] = "1";
    const bearer = getAccessToken();
    if (bearer) headers.Authorization = `Bearer ${bearer}`;
    if (isMutatingMethod(method)) {
      const csrf = getCsrfToken();
      if (csrf) headers[CSRF_HEADER] = csrf;
    }
    return headers;
  }

  function applyCsrfFromResponse(data) {
    applyAuthTokensFromResponse(data);
  }

  /** Convierte fallos de `fetch` (red, CORS, certificado, URL incorrecta) en mensaje legible. */
  function throwIfFetchNetworkError(err) {
    const raw = String(err?.message || err || "");
    if (/failed to fetch|networkerror|load failed|network request failed/i.test(raw)) {
      throw new Error(
        "No fue posible conectar con el servidor. Compruebe su conexion a internet, que la API este activa, la URL en antares_api_base (raiz del API, sin repetir /api) y que CORS permita este sitio."
      );
    }
    throw err instanceof Error ? err : new Error(raw || "Error de red");
  }

  /** Evita mostrar "Internal Server Error" crudo en formularios del portal. */
  function sanitizeApiErrorMessage(msg, status) {
    const s = String(msg || "").trim();
    if (!s || /^internal server error$/i.test(s)) {
      if (Number(status) >= 500) {
        return "El servidor no pudo procesar la solicitud. Revise los datos del formulario, la sesión y la conexión e intente de nuevo.";
      }
      return s || "Error en la solicitud al servidor.";
    }
    return s;
  }

  async function request(method, path, body, reqOpts) {
    reqOpts = reqOpts && typeof reqOpts === "object" ? reqOpts : {};
    const base = getBase();
    if (!base) throw new Error("API: falta URL base (antares_api_base o __ANTARES_API_BASE__)");
    if (!hasPortalSession()) throw new Error("API: sesión no iniciada");
    const rel = path.startsWith("/") ? path : `/${path}`;
    const url = `${base}/api${rel}`;
    const headers = buildFetchHeaders(method, { Accept: "application/json" });
    const opts = /** @type {RequestInit} */ ({ method, headers, credentials: "include" });
    if (body !== undefined && body !== null) {
      headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    const timeoutMs = typeof reqOpts.timeoutMs === "number" && reqOpts.timeoutMs > 0 ? reqOpts.timeoutMs : 0;
    let timeoutId = null;
    let controller = null;
    if (timeoutMs > 0 && typeof AbortController !== "undefined") {
      controller = new AbortController();
      opts.signal = controller.signal;
      timeoutId = setTimeout(function () {
        try {
          controller.abort();
        } catch (_abort) {
          /* noop */
        }
      }, timeoutMs);
    }
    let res;
    try {
      res = await fetch(url, opts);
    } catch (err) {
      if (controller && err && err.name === "AbortError") {
        const timeoutErr = new Error("La solicitud al servidor tardó demasiado. Intente de nuevo.");
        timeoutErr.status = 408;
        throw timeoutErr;
      }
      throwIfFetchNetworkError(err);
    } finally {
      if (timeoutId != null) clearTimeout(timeoutId);
    }
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
      if (res.status === 404 && /cannot post\b/i.test(String(msg))) {
        msg = `${msg} Revise antares_api_base (o __ANTARES_API_BASE__): debe ser la URL raíz del servidor Nest sin sufijo /api; no use la URL del sitio estático ni Live Server.`;
      }
      const err = new Error(sanitizeApiErrorMessage(msg, res.status) || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    applyCsrfFromResponse(data);
    return data;
  }

  function getJson(path, reqOpts) {
    return request("GET", path, undefined, reqOpts);
  }

  /** GET binario autenticado (plantillas DOCX, etc.). */
  async function getArrayBuffer(path) {
    const base = getBase();
    if (!base) throw new Error("API: falta URL base (antares_api_base o __ANTARES_API_BASE__)");
    if (!hasPortalSession()) throw new Error("API: sesión no iniciada");
    const rel = path.startsWith("/") ? path : `/${path}`;
    const url = `${base}/api${rel}`;
    const headers = buildFetchHeaders("GET", { Accept: "application/octet-stream" });
    let res;
    try {
      res = await fetch(url, { method: "GET", headers, credentials: "include" });
    } catch (err) {
      throwIfFetchNetworkError(err);
    }
    if (!res.ok) {
      const err = new Error(sanitizeApiErrorMessage(res.statusText, res.status) || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res.arrayBuffer();
  }

  function postJson(path, body) {
    return request("POST", path, body);
  }

  /** POST sin sesión (rutas públicas de la API). */
  async function postJsonPublic(path, body) {
    const base = getBase();
    if (!base) throw new Error("API: falta URL base (antares_api_base o __ANTARES_API_BASE__)");
    const rel = path.startsWith("/") ? path : `/${path}`;
    const url = `${base}/api${rel}`;
    const headers = buildFetchHeaders("POST", {
      Accept: "application/json",
      "Content-Type": "application/json"
    });
    let res;
    try {
      res = await fetch(url, { method: "POST", headers, credentials: "include", body: JSON.stringify(body) });
    } catch (err) {
      throwIfFetchNetworkError(err);
    }
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
      const err = new Error(sanitizeApiErrorMessage(msg, res.status) || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    applyCsrfFromResponse(data);
    return data;
  }

  /** POST multipart/form-data sin sesión (no fijar Content-Type: el navegador añade boundary). */
  async function postFormDataPublic(path, formData) {
    const base = getBase();
    if (!base) throw new Error("API: falta URL base (antares_api_base o __ANTARES_API_BASE__)");
    const rel = path.startsWith("/") ? path : `/${path}`;
    const url = `${base}/api${rel}`;
    const headers = buildFetchHeaders("POST", { Accept: "application/json" });
    let res;
    try {
      res = await fetch(url, { method: "POST", headers, credentials: "include", body: formData });
    } catch (err) {
      throwIfFetchNetworkError(err);
    }
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
      const err = new Error(sanitizeApiErrorMessage(msg, res.status) || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    applyCsrfFromResponse(data);
    return data;
  }

  /** POST multipart con sesión por cookie (p. ej. subida de imagen vía API). */
  async function postFormData(path, formData) {
    const base = getBase();
    if (!base) throw new Error("API: falta URL base (antares_api_base o __ANTARES_API_BASE__)");
    if (!hasPortalSession()) throw new Error("API: sesión no iniciada");
    const rel = path.startsWith("/") ? path : `/${path}`;
    const url = `${base}/api${rel}`;
    const headers = buildFetchHeaders("POST", { Accept: "application/json" });
    let res;
    try {
      res = await fetch(url, { method: "POST", headers, credentials: "include", body: formData });
    } catch (err) {
      throwIfFetchNetworkError(err);
    }
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
      const err = new Error(sanitizeApiErrorMessage(msg, res.status) || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    applyCsrfFromResponse(data);
    return data;
  }

  /** GET sin sesión (rutas públicas de la API). */
  async function getJsonPublic(path) {
    const base = getBase();
    if (!base) throw new Error("API: falta URL base (antares_api_base o __ANTARES_API_BASE__)");
    const rel = path.startsWith("/") ? path : `/${path}`;
    const url = `${base}/api${rel}`;
    const headers = { Accept: "application/json" };
    let res;
    try {
      res = await fetch(url, { method: "GET", headers, credentials: "include" });
    } catch (err) {
      throwIfFetchNetworkError(err);
    }
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
      const err = new Error(sanitizeApiErrorMessage(msg, res.status) || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  /** Elimina JWT embebidos en localStorage (legado). No borra sessionStorage (respaldo iOS). */
  function purgeLegacyAuthTokens() {
    try {
      localStorage.removeItem("antares_api_access_token");
    } catch (_rm) {
      /* noop */
    }
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const session = JSON.parse(raw);
      if (!session || typeof session !== "object") return;
      if (!("accessToken" in session) && !("refreshToken" in session)) return;
      const next = { ...session };
      delete next.accessToken;
      delete next.refreshToken;
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } catch (_e) {
      /* noop */
    }
    try {
      const webKey = "antares_web_auth";
      const webRaw = localStorage.getItem(webKey);
      if (!webRaw) return;
      const web = JSON.parse(webRaw);
      if (!web || typeof web !== "object") return;
      if (!("accessToken" in web) && !("refreshToken" in web)) return;
      const nextWeb = { ...web };
      delete nextWeb.accessToken;
      delete nextWeb.refreshToken;
      localStorage.setItem(webKey, JSON.stringify(nextWeb));
    } catch (_e2) {
      /* noop */
    }
  }

  purgeLegacyAuthTokens();

  window.AntaresApi = {
    getBase,
    bearerAuthFallbackEnabled,
    getAccessToken,
    getRefreshToken,
    getCsrfToken,
    hasBase,
    isConfigured,
    setAccessToken,
    setRefreshToken,
    setCsrfToken,
    clearBearerTokens,
    applyAuthTokensFromResponse,
    purgeLegacyAuthTokens,
    request,
    getJson,
    getArrayBuffer,
    postJson,
    postJsonPublic,
    postFormData,
    postFormDataPublic,
    getJsonPublic
  };
})();
