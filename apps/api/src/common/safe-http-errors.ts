import { HttpException, HttpStatus } from "@nestjs/common";

/** Mensaje genérico: no revelar SQL, hosts, variables de entorno ni stacks. */
export const CLIENT_SAFE_ERROR_MSG =
  "No fue posible completar la operación. Intente más tarde o contacte a soporte.";

const INFRA_LEAK_RE =
  /DATABASE_URL|PostgreSQL|postgres(?:ql)?:\/\/|supabase\.co|pooler|SQLSTATE|XX000|\bpg_|\bssl\/tls\b|Connection string|tenant or user|npm run db:init|relation "|column "|violates foreign key|duplicate key value|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|stack trace|at Object\.|at Module\.|node_modules/i;

export function looksLikeInfraOrDbLeak(raw: unknown): boolean {
  const text = String(raw ?? "");
  if (!text.trim()) return false;
  if (INFRA_LEAK_RE.test(text)) return true;
  if (/\b[0-9A-Z]{5}\b/.test(text) && /error|exception|fail/i.test(text)) return true;
  return false;
}

export function isPostgresLikeError(err: unknown): boolean {
  const e = err as { code?: string; severity?: string; routine?: string } | null;
  if (!e || typeof e !== "object") return false;
  const code = String(e.code || "");
  if (/^[0-9A-Z]{5}$/.test(code)) return true;
  if (
    ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "EAI_AGAIN", "ECONNRESET", "ENETUNREACH", "EHOSTUNREACH"].includes(
      code
    )
  ) {
    return true;
  }
  return Boolean(e.severity || e.routine);
}

/** Convierte errores desconocidos / de BD en HttpException segura para el cliente. */
export function toSafeHttpException(err: unknown, fallbackMessage = CLIENT_SAFE_ERROR_MSG): HttpException {
  if (err instanceof HttpException) {
    const status = err.getStatus();
    const res = err.getResponse();
    const message =
      typeof res === "string"
        ? res
        : res && typeof res === "object" && "message" in res
          ? (res as { message: unknown }).message
          : null;
    const text = Array.isArray(message) ? message.join(", ") : String(message ?? "");
    if (looksLikeInfraOrDbLeak(text)) {
      const safeStatus =
        status >= 500 ? HttpStatus.SERVICE_UNAVAILABLE : status === 400 ? HttpStatus.BAD_REQUEST : HttpStatus.BAD_REQUEST;
      return new HttpException(
        {
          statusCode: safeStatus,
          message: status >= 500 ? CLIENT_SAFE_ERROR_MSG : fallbackMessage,
          error: status >= 500 ? "Service Unavailable" : "Bad Request"
        },
        safeStatus
      );
    }
    return err;
  }
  if (isPostgresLikeError(err) || looksLikeInfraOrDbLeak((err as Error)?.message)) {
    return new HttpException(
      { statusCode: HttpStatus.SERVICE_UNAVAILABLE, message: CLIENT_SAFE_ERROR_MSG, error: "Service Unavailable" },
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }
  return new HttpException(
    { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: CLIENT_SAFE_ERROR_MSG, error: "Internal Server Error" },
    HttpStatus.INTERNAL_SERVER_ERROR
  );
}
