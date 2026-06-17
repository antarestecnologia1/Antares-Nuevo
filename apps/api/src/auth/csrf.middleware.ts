import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_ACCESS, AUTH_COOKIE_CSRF, CSRF_HEADER } from "./auth-cookies";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Rutas públicas de autenticación que aún no tienen cookies de sesión. */
const CSRF_SKIP_PREFIXES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/register-portal",
  "/api/auth/password-recovery/request",
  "/api/auth/password-recovery/complete",
  "/api/auth/logout"
];

function requestPath(req: Request): string {
  const raw = String(req.originalUrl || req.url || "").split("?")[0];
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function shouldSkipCsrf(path: string): boolean {
  return CSRF_SKIP_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/**
 * Protección CSRF (doble envío): si hay cookie de acceso HttpOnly, las mutaciones
 * deben incluir el mismo valor en el encabezado `X-CSRF-Token` que en `antares_csrf`.
 */
export function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction): void {
  const method = String(req.method || "GET").toUpperCase();
  if (SAFE_METHODS.has(method)) {
    next();
    return;
  }

  const path = requestPath(req);
  if (shouldSkipCsrf(path)) {
    next();
    return;
  }

  const hasAccessCookie = Boolean(req.cookies?.[AUTH_COOKIE_ACCESS]);
  if (!hasAccessCookie) {
    next();
    return;
  }

  const cookieCsrf = String(req.cookies?.[AUTH_COOKIE_CSRF] || "").trim();
  const headerCsrf = String(req.headers[CSRF_HEADER] || req.headers["X-CSRF-Token"] || "").trim();
  if (!cookieCsrf || !headerCsrf || cookieCsrf !== headerCsrf) {
    res.status(403).json({ message: "Token CSRF inválido o ausente." });
    return;
  }

  next();
}
