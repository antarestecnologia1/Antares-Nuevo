"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

type AuthState = {
  userId: string;
  email: string;
  role: string;
  lastActivityAt?: number;
};

type AuthContextValue = {
  session: AuthState | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  message: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: (reason?: string) => void;
  clearMessage: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "antares_web_auth";
const CSRF_COOKIE = "antares_csrf";
const INACTIVITY_MS = 30 * 60 * 1000;
const REFRESH_INTERVAL_MS = 12 * 60 * 1000;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function readCsrfFromDocumentCookie(): string {
  if (typeof document === "undefined") return "";
  const parts = String(document.cookie || "").split(";");
  for (const chunk of parts) {
    const trimmed = chunk.trim();
    if (!trimmed.startsWith(`${CSRF_COOKIE}=`)) continue;
    return decodeURIComponent(trimmed.slice(CSRF_COOKIE.length + 1));
  }
  return "";
}

function buildMutationHeaders(csrfToken: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };
  const csrf = String(csrfToken || readCsrfFromDocumentCookie() || "").trim();
  if (csrf) headers["X-CSRF-Token"] = csrf;
  return headers;
}

function normalizeStoredSession(raw: unknown): AuthState | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const userId = String(o.userId || "").trim();
  if (!userId) return null;
  const lastActivityAt =
    typeof o.lastActivityAt === "number" && Number.isFinite(o.lastActivityAt)
      ? o.lastActivityAt
      : Date.now();
  return {
    userId,
    email: String(o.email || "").trim(),
    role: String(o.role || "").trim(),
    lastActivityAt
  };
}

function isStoredSessionWithinIdleWindow(stored: AuthState | null): boolean {
  if (!stored) return false;
  const last = typeof stored.lastActivityAt === "number" ? stored.lastActivityAt : 0;
  if (!last) return true;
  return Date.now() - last <= INACTIVITY_MS;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const csrfRef = useRef("");
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inactivityCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const sessionRef = useRef<AuthState | null>(null);

  const persistSession = useCallback((next: AuthState | null) => {
    if (typeof window === "undefined") return;
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const clearRefreshTimer = useCallback(() => {
    if (!refreshTimerRef.current) return;
    clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = null;
  }, []);

  const clearInactivityTimer = useCallback(() => {
    if (!inactivityCheckRef.current) return;
    clearInterval(inactivityCheckRef.current);
    inactivityCheckRef.current = null;
  }, []);

  const logout = useCallback(
    (reason?: string) => {
      clearRefreshTimer();
      clearInactivityTimer();
      const headers = buildMutationHeaders(csrfRef.current);
      void fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers,
        credentials: "include"
      }).catch(() => {});
      void fetch(`${API_BASE}/portal/logout`, {
        method: "POST",
        headers,
        credentials: "include"
      }).catch(() => {});
      csrfRef.current = "";
      setSession(null);
      persistSession(null);
      if (reason) setMessage(reason);
    },
    [clearInactivityTimer, clearRefreshTimer, persistSession]
  );

  const refreshSession = useCallback(async () => {
    const current = sessionRef.current;
    if (!current) return false;

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: buildMutationHeaders(csrfRef.current),
      credentials: "include",
      body: "{}"
    });

    if (!res.ok) {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_MS) {
        logout("Tu sesión expiró. Inicia sesión nuevamente.");
      }
      return false;
    }

    const data = (await res.json()) as {
      ok?: boolean;
      csrfToken?: string;
      user?: { userId?: string; email?: string; role?: string };
    };

    if (data?.csrfToken) csrfRef.current = data.csrfToken;

    const user = data?.user;
    if (!user?.userId) return false;

    const now = Date.now();
    const nextSession: AuthState = {
      userId: String(user.userId),
      email: String(user.email ?? current.email),
      role: String(user.role ?? current.role),
      lastActivityAt: now
    };
    setSession(nextSession);
    persistSession(nextSession);
    lastActivityRef.current = now;
    return true;
  }, [logout, persistSession]);

  const scheduleRefresh = useCallback(() => {
    clearRefreshTimer();
    if (!session) return;
    refreshTimerRef.current = setInterval(() => {
      void refreshSession();
    }, REFRESH_INTERVAL_MS);
  }, [clearRefreshTimer, refreshSession, session]);

  const markActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let stored: AuthState | null = null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        stored = normalizeStoredSession(JSON.parse(raw));
        if (stored) {
          setSession(stored);
          lastActivityRef.current =
            typeof stored.lastActivityAt === "number" ? stored.lastActivityAt : Date.now();
        } else localStorage.removeItem(STORAGE_KEY);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    void (async () => {
      try {
        if (stored) sessionRef.current = stored;
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: buildMutationHeaders(csrfRef.current),
          credentials: "include",
          body: "{}"
        });
        if (res.ok) {
          const data = (await res.json()) as {
            csrfToken?: string;
            user?: { userId?: string; email?: string; role?: string };
          };
          if (data?.csrfToken) csrfRef.current = data.csrfToken;
          if (data?.user?.userId) {
            const now = Date.now();
            const next: AuthState = {
              userId: String(data.user.userId),
              email: String(data.user.email ?? stored?.email ?? ""),
              role: String(data.user.role ?? stored?.role ?? ""),
              lastActivityAt: now
            };
            setSession(next);
            persistSession(next);
            lastActivityRef.current = now;
          }
        } else if (stored && !isStoredSessionWithinIdleWindow(stored)) {
          setSession(null);
          persistSession(null);
        }
      } catch {
        if (stored && !isStoredSessionWithinIdleWindow(stored)) {
          setSession(null);
          persistSession(null);
        }
      } finally {
        setIsLoading(false);
      }
    })();
    // Solo al montar: validar cookies HttpOnly contra la API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!session) {
      clearInactivityTimer();
      return;
    }

    markActivity();
    const activityEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart"
    ];

    const handler = () => markActivity();
    activityEvents.forEach((event) => window.addEventListener(event, handler));

    inactivityCheckRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_MS) {
        logout("Sesión cerrada por 30 minutos de inactividad.");
      }
    }, 30_000);

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handler)
      );
      clearInactivityTimer();
    };
  }, [clearInactivityTimer, logout, markActivity, session]);

  useEffect(() => {
    if (!session) {
      clearRefreshTimer();
      return;
    }
    scheduleRefresh();
    return () => clearRefreshTimer();
  }, [clearRefreshTimer, scheduleRefresh, session]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const raw = await res.text();
      let data: {
        user?: { userId?: string; email?: string; role?: string };
        csrfToken?: string;
        message?: string | string[];
      };
      try {
        data = JSON.parse(raw) as typeof data;
      } catch {
        data = {};
      }

      if (!res.ok) {
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : String(data?.message || raw || "Credenciales inválidas.");
        throw new Error(msg);
      }

      const user = data.user;
      if (!user?.userId || !user?.role) {
        throw new Error("Respuesta de login incompleta.");
      }

      if (data.csrfToken) csrfRef.current = data.csrfToken;

      const nextSession: AuthState = {
        userId: String(user.userId),
        email: String(user.email ?? email),
        role: String(user.role),
        lastActivityAt: Date.now()
      };

      setSession(nextSession);
      persistSession(nextSession);
      setMessage(null);
      markActivity();
    },
    [markActivity, persistSession]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      isLoading,
      message,
      login,
      logout,
      clearMessage: () => setMessage(null)
    }),
    [session, isLoading, message, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
