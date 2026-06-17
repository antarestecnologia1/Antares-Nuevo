/**
 * Cliente HTTP mínimo para apps/api (prefijo global /api).
 * URL: localStorage.antares_api_base o window.__ANTARES_API_BASE__
 * Autenticación: cookies HttpOnly (antares_at / antares_rt) + CSRF en mutaciones.
 */
(function registerApiClient() {
  const CSRF_COOKIE = "antares_csrf";
  const CSRF_HEADER = "X-CSRF-Token";
  const SESSION_KEY = "antares_session_v2";

  let csrfTokenMemory = "";

  function normalizeBase(url) {
    if (!url || typeof url !== "string") return "";
    let s = url.trim().replace(/\/+$/, "");
    while (/\/api$/i.test(s)) {
      s = s.slice(0, -4).replace(/\/+$/, "");
    }
    return s;
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

  /** @deprecated Los JWT ya no viven en localStorage; se conserva por compatibilidad con código legado. */
  function getAccessToken() {
    return "";
  }

  /** @deprecated Los JWT ya no se guardan en el cliente. */
  function setAccessToken(_token) {
    try {
      localStorage.removeItem("antares_api_access_token");
    } catch (_e) {
      /* noop */
    }
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
    if (isMutatingMethod(method)) {
      const csrf = getCsrfToken();
      if (csrf) headers[CSRF_HEADER] = csrf;
    }
    return headers;
  }

  function applyCsrfFromResponse(data) {
    if (data && typeof data === "object" && data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }
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
      const err = new Error(msg || `HTTP ${res.status}`);
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
      const err = new Error(res.statusText || `HTTP ${res.status}`);
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
      const err = new Error(msg || `HTTP ${res.status}`);
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
      const err = new Error(msg || `HTTP ${res.status}`);
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
      const err = new Error(msg || `HTTP ${res.status}`);
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
      const err = new Error(msg || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  /** Elimina tokens JWT legados del almacenamiento del navegador. */
  function purgeLegacyAuthTokens() {
    setAccessToken("");
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
    getAccessToken,
    getCsrfToken,
    hasBase,
    isConfigured,
    setAccessToken,
    setCsrfToken,
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
