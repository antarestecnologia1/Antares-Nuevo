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
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  role: string;
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
const INACTIVITY_MS = 30 * 60 * 1000;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getTokenExpiryMs(token: string): number {
  const payload = parseJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp === "number") {
    return exp * 1000;
  }
  return Date.now() + 15 * 60 * 1000;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    clearTimeout(refreshTimerRef.current);
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
      setSession(null);
      persistSession(null);
      if (reason) setMessage(reason);
    },
    [clearInactivityTimer, clearRefreshTimer, persistSession]
  );

  const refreshTokens = useCallback(async () => {
    const current = sessionRef.current;
    if (!current) return;

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: current.userId,
        refreshToken: current.refreshToken
      })
    });

    if (!res.ok) {
      logout("Tu sesión expiró. Inicia sesión nuevamente.");
      return;
    }

    const data = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
    };

    const payload = parseJwtPayload(data.accessToken);
    const nextSession: AuthState = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      userId: String(payload?.sub ?? current.userId),
      email: String(payload?.email ?? current.email),
      role: String(payload?.role ?? current.role)
    };
    setSession(nextSession);
    persistSession(nextSession);
  }, [logout, persistSession]);

  const scheduleRefresh = useCallback(() => {
    clearRefreshTimer();
    if (!session) return;
    const expiresAt = getTokenExpiryMs(session.accessToken);
    const refreshAt = Math.max(5_000, expiresAt - Date.now() - 60_000);
    refreshTimerRef.current = setTimeout(() => {
      void refreshTokens();
    }, refreshAt);
  }, [clearRefreshTimer, refreshTokens, session]);

  const markActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthState;
        setSession(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
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
  }, [clearRefreshTimer, scheduleRefresh, session]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        throw new Error("Credenciales inválidas.");
      }

      const data = (await res.json()) as {
        accessToken: string;
        refreshToken: string;
      };
      const payload = parseJwtPayload(data.accessToken);
      const nextSession: AuthState = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId: String(payload?.sub ?? ""),
        email: String(payload?.email ?? email),
        role: String(payload?.role ?? "")
      };

      if (!nextSession.userId || !nextSession.role) {
        throw new Error("No se pudo construir la sesión.");
      }

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
