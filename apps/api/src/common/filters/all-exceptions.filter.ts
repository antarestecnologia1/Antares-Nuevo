import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";
import type { Response } from "express";
import {
  CLIENT_SAFE_ERROR_MSG,
  isPostgresLikeError,
  looksLikeInfraOrDbLeak,
  toSafeHttpException
} from "../safe-http-errors";

function sanitizeLogText(raw: unknown, maxLength = 220): string {
  let text = String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "sin detalle";
  text = text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[jwt]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "[database-url]")
    .replace(/https?:\/\/\S+/gi, "[url]");
  if (text.length > maxLength) return `${text.slice(0, maxLength - 1)}…`;
  return text;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === "string"
          ? body
          : body && typeof body === "object" && "message" in body
            ? (body as { message: unknown }).message
            : CLIENT_SAFE_ERROR_MSG;
      const text = Array.isArray(message) ? message.join(", ") : String(message ?? "");

      if (looksLikeInfraOrDbLeak(text) || isPostgresLikeError(exception)) {
        this.logger.error(`HTTP ${status} sanitized leak: ${sanitizeLogText(text)}`);
        const safe = toSafeHttpException(exception);
        res.status(safe.getStatus()).json(safe.getResponse());
        return;
      }

      if (typeof body === "string") {
        res.status(status).json({ statusCode: status, message: body });
        return;
      }
      res.status(status).json(body);
      return;
    }

    const pgCode = String((exception as { code?: string } | null)?.code || "");
    const msg = exception instanceof Error ? exception.message : String(exception);
    this.logger.error(
      `Unhandled ${pgCode || "error"}: ${sanitizeLogText(msg)}`,
      exception instanceof Error ? exception.stack : undefined
    );

    const safe = toSafeHttpException(exception);
    res.status(safe.getStatus()).json(
      safe.getResponse() || {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: CLIENT_SAFE_ERROR_MSG
      }
    );
  }
}
