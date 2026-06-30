import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verificador del token Turnstile. La validación corre si `CF_TURNSTILE_REQUIRED=true` (o "1").
 * En desarrollo puede dejarse el flag apagado; en producción requerida, la falta de secreto
 * falla cerrado para no publicar formularios sin anti-bot por mala configuración.
 */
@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);

  constructor(private readonly config: ConfigService) {}

  async assertValid(token: string | undefined | null, remoteIp?: string | undefined): Promise<void> {
    const required = String(this.config.get<string>("CF_TURNSTILE_REQUIRED") ?? "")
      .trim()
      .toLowerCase();
    const secret = String(this.config.get<string>("CF_TURNSTILE_SECRET") ?? "").trim();
    const requiredFlag = required === "true" || required === "1";
    if (requiredFlag && !secret) {
      this.logger.error("CF_TURNSTILE_REQUIRED=true pero CF_TURNSTILE_SECRET no está configurado.");
      throw new BadRequestException("Verificación anti-bot no configurada en el servidor.");
    }
    const enforce = Boolean(secret) && requiredFlag;
    if (!enforce) return;

    const t = String(token ?? "").trim();
    if (!t) {
      throw new BadRequestException(
        "Verificación anti-bot requerida. Recargue la página e intente de nuevo."
      );
    }

    try {
      const params = new URLSearchParams();
      params.append("secret", secret);
      params.append("response", t);
      if (remoteIp) params.append("remoteip", remoteIp);

      const res = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      });

      const body = (await res.json().catch(() => null)) as
        | { success?: boolean; "error-codes"?: string[] }
        | null;
      if (!body?.success) {
        const codes = Array.isArray(body?.["error-codes"]) ? body!["error-codes"]!.join(", ") : "";
        this.logger.warn(`Turnstile rechazó token: ${codes || "sin detalle"}`);
        throw new BadRequestException(
          "Verificación anti-bot fallida. Recargue la página e intente de nuevo."
        );
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      const detail = String(err instanceof Error ? err.message : err || "")
        .replace(/\s+/g, " ")
        .trim();
      this.logger.error(`Error consultando Turnstile: ${detail ? detail.slice(0, 120) : "sin detalle"}`);
      throw new BadRequestException(
        "No fue posible verificar el desafío anti-bot. Reintente en unos segundos."
      );
    }
  }
}
