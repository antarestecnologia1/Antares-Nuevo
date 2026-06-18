import { randomBytes } from "node:crypto";
import type { CookieOptions, Response } from "express";
import type { ConfigService } from "@nestjs/config";

export const AUTH_COOKIE_ACCESS = "antares_at";
export const AUTH_COOKIE_REFRESH = "antares_rt";
export const AUTH_COOKIE_CSRF = "antares_csrf";
export const CSRF_HEADER = "x-csrf-token";

/** Convierte expresiones JWT (`15m`, `7d`, `12h`) a milisegundos para `maxAge` de cookies. */
export function jwtExpiresInToMs(raw: string | undefined, fallbackMs: number): number {
  const s = String(raw || "").trim().toLowerCase();
  const m = /^(\d+)\s*([smhd])$/.exec(s);
  if (!m) return fallbackMs;
  const n = Number(m[1]);
  const unit = m[2];
  const mult = unit === "s" ? 1000 : unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
  return n * mult;
}

/** Dominio registrable aproximado (suficiente para comparar portal vs API en .co / .com). */
function siteRegistrableDomain(hostname: string): string {
  const h = String(hostname || "")
    .toLowerCase()
    .replace(/:\d+$/, "");
  const parts = h.split(".").filter(Boolean);
  if (parts.length <= 2) return h;
  return parts.slice(-2).join(".");
}

export function resolveAuthCookieSameSite(config: ConfigService): "lax" | "none" | "strict" {
  const env = String(config.get<string>("AUTH_COOKIE_SAME_SITE") || "").trim().toLowerCase();
  if (env === "none" || env === "strict" || env === "lax") return env;

  const portalUrl = String(config.get<string>("PORTAL_PUBLIC_URL") || "").trim();
  const apiUrl = String(
    config.get<string>("API_PUBLIC_URL") || config.get<string>("RENDER_EXTERNAL_URL") || ""
  ).trim();
  if (portalUrl && apiUrl) {
    try {
      const portalHost = new URL(portalUrl).hostname;
      const apiHost = new URL(apiUrl).hostname;
      if (siteRegistrableDomain(portalHost) === siteRegistrableDomain(apiHost)) {
        return "lax";
      }
    } catch {
      /* comparación no disponible */
    }
  }

  return config.get<string>("NODE_ENV") === "production" ? "none" : "lax";
}

export function resolveAuthCookieSecure(config: ConfigService, sameSite: "lax" | "none" | "strict"): boolean {
  if (sameSite === "none") return true;
  const env = String(config.get<string>("AUTH_COOKIE_SECURE") || "").trim().toLowerCase();
  if (env === "true") return true;
  if (env === "false") return false;
  return config.get<string>("NODE_ENV") === "production";
}

export function buildHttpOnlyCookieOptions(
  config: ConfigService,
  maxAgeMs: number
): CookieOptions {
  const sameSite = resolveAuthCookieSameSite(config);
  const secure = resolveAuthCookieSecure(config, sameSite);
  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: Math.max(0, maxAgeMs)
  };
}

export function buildCsrfCookieOptions(config: ConfigService, maxAgeMs: number): CookieOptions {
  const base = buildHttpOnlyCookieOptions(config, maxAgeMs);
  return { ...base, httpOnly: false };
}

export function newCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export function setAuthCookies(
  res: Response,
  config: ConfigService,
  tokens: { accessToken: string; refreshToken: string },
  csrfToken: string
): void {
  const accessMs = jwtExpiresInToMs(config.get<string>("JWT_ACCESS_EXPIRES_IN"), 15 * 60_000);
  const refreshMs = jwtExpiresInToMs(config.get<string>("JWT_REFRESH_EXPIRES_IN"), 7 * 86_400_000);
  res.cookie(AUTH_COOKIE_ACCESS, tokens.accessToken, buildHttpOnlyCookieOptions(config, accessMs));
  res.cookie(AUTH_COOKIE_REFRESH, tokens.refreshToken, buildHttpOnlyCookieOptions(config, refreshMs));
  res.cookie(AUTH_COOKIE_CSRF, csrfToken, buildCsrfCookieOptions(config, refreshMs));
}

export function clearAuthCookies(res: Response, config: ConfigService): void {
  const accessMs = jwtExpiresInToMs(config.get<string>("JWT_ACCESS_EXPIRES_IN"), 15 * 60_000);
  const refreshMs = jwtExpiresInToMs(config.get<string>("JWT_REFRESH_EXPIRES_IN"), 7 * 86_400_000);
  const httpOpts = { ...buildHttpOnlyCookieOptions(config, accessMs), maxAge: 0 };
  const csrfOpts = { ...buildCsrfCookieOptions(config, refreshMs), maxAge: 0 };
  res.clearCookie(AUTH_COOKIE_ACCESS, httpOpts);
  res.clearCookie(AUTH_COOKIE_REFRESH, httpOpts);
  res.clearCookie(AUTH_COOKIE_CSRF, csrfOpts);
}
