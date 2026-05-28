import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

function escapeHtml(text: string): string {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function redactEmailForLog(raw: string | undefined | null): string {
  const email = String(raw || "").trim().toLowerCase();
  const at = email.indexOf("@");
  if (at <= 0) return email ? "[redacted]" : "";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const [host, ...rest] = domain.split(".");
  const safeLocal = local.length <= 2 ? `${local.charAt(0)}***` : `${local.slice(0, 2)}***`;
  const safeHost = host ? `${host.charAt(0)}***` : "***";
  return `${safeLocal}@${safeHost}${rest.length ? "." + rest.join(".") : ""}`;
}

/** Quita saltos de línea/espacios extra al pegar MAIL_FROM en Render u otros paneles. */
function normalizeMailFrom(raw: string): string {
  return String(raw || "")
    .replace(/[\r\n]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractEmailAddress(from: string): string {
  const trimmed = normalizeMailFrom(from);
  const angle = trimmed.match(/<([^>]+)>/);
  return (angle ? angle[1] : trimmed).trim().toLowerCase();
}

function isPlausibleEmailAddress(addr: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr);
}

const RESEND_BLOCKED_FROM_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "yahoo.com",
  "icloud.com"
]);

function sanitizeLogText(raw: unknown, maxLength = 160): string {
  const text = String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "sin detalle";
  const clean = text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, (match) => redactEmailForLog(match))
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[jwt]");
  if (clean.length > maxLength) return `${clean.slice(0, maxLength - 1)}…`;
  return clean;
}

export type PortalRegistrationWelcomeParams = {
  to: string;
  recipientName: string;
  portalUrl: string;
  accountApproved: boolean;
};

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;

  constructor(private readonly config: ConfigService) {
    const raw =
      this.config.get<string>("RESEND_API_KEY") ??
      this.config.get<string>("RESEND_KEY") ??
      process.env.RESEND_API_KEY ??
      process.env.RESEND_KEY ??
      "";
    const apiKey = typeof raw === "string" ? raw.trim() : "";
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  onModuleInit() {
    const fromConfigured = Boolean(this.resolveMailFrom());
    if (this.resend && fromConfigured) {
      const outbound = this.resolveOutboundFrom();
      const configuredAddr = extractEmailAddress(this.resolveMailFrom());
      if (outbound.replyTo && configuredAddr !== extractEmailAddress(outbound.from)) {
        this.logger.warn(
          `Correo (Resend): MAIL_FROM=${redactEmailForLog(configuredAddr)} no puede usarse como remitente en Resend; envíos con From=${redactEmailForLog(extractEmailAddress(outbound.from))} y Reply-To=${redactEmailForLog(outbound.replyTo)}. Para mostrar su dominio corporativo, verifique el dominio en Resend y defina RESEND_VERIFIED_FROM.`
        );
      }
    }
    if (this.resend) {
      this.logger.log(
        `Correo (Resend): cliente activo. MAIL_FROM ${fromConfigured ? "definido" : "no definido — usando remitente de prueba Resend (solo envíos de prueba)"}.`
      );
    } else {
      this.logger.warn(
        "Correo (Resend): sin API key — las bienvenidas usarán el correo SMTP de Supabase (magic link) si la API tiene SUPABASE_URL y clave; defina RESEND_API_KEY para plantilla HTML propia."
      );
    }
  }

  /** Resend configurado (scripts de despliegue / Render). */
  hasResend(): boolean {
    return Boolean(this.resend);
  }

  private resolveMailFrom(): string {
    const explicit =
      this.config.get<string>("MAIL_FROM") ||
      this.config.get<string>("MAIL_FROM_ADDRESS") ||
      process.env.MAIL_FROM ||
      process.env.MAIL_FROM_ADDRESS ||
      "";
    const normalized = normalizeMailFrom(explicit);
    if (!normalized) return "";
    const addr = extractEmailAddress(normalized);
    if (!isPlausibleEmailAddress(addr)) {
      this.logger.error(
        `MAIL_FROM inválido o incompleto (${sanitizeLogText(normalized)}). Use una sola línea, p. ej. Transportes Antares <antarestecnologia1@gmail.com>.`
      );
      return "";
    }
    return normalized;
  }

  private resolveResendVerifiedFrom(): string {
    const explicit =
      this.config.get<string>("RESEND_VERIFIED_FROM") ||
      process.env.RESEND_VERIFIED_FROM ||
      "";
    const normalized = normalizeMailFrom(explicit);
    if (!normalized) return "";
    const addr = extractEmailAddress(normalized);
    if (!isPlausibleEmailAddress(addr)) {
      this.logger.error(
        `RESEND_VERIFIED_FROM inválido (${sanitizeLogText(normalized)}); se usará onboarding@resend.dev si hace falta.`
      );
      return "";
    }
    return normalized;
  }

  /**
   * Remitente real para Resend. MAIL_FROM en Gmail/Hotmail/etc. se usa como Reply-To;
   * el From debe ser un dominio verificado en Resend (RESEND_VERIFIED_FROM).
   */
  private resolveOutboundFrom(): { from: string; replyTo?: string } {
    const configuredFrom = this.resolveMailFrom();
    const fallback = this.resolveResendVerifiedFrom() || "onboarding@resend.dev";
    if (!configuredFrom) {
      return { from: fallback };
    }
    const domain = extractEmailAddress(configuredFrom).split("@")[1] || "";
    if (RESEND_BLOCKED_FROM_DOMAINS.has(domain)) {
      return { from: fallback, replyTo: extractEmailAddress(configuredFrom) };
    }
    return { from: configuredFrom };
  }

  async send(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.warn(
        `Correo no enviado a ${redactEmailForLog(to)}: defina RESEND_API_KEY en la API (y MAIL_FROM verificado en Resend).`
      );
      return;
    }
    const { from, replyTo } = this.resolveOutboundFrom();
    if (!this.resolveMailFrom()) {
      this.logger.warn(
        `MAIL_FROM no definido o inválido; usando ${redactEmailForLog(extractEmailAddress(from))} (modo prueba Resend si es onboarding@resend.dev).`
      );
    }
    const result = await this.resend.emails.send({
      from,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {})
    });
    if (result && typeof result === "object" && "error" in result && result.error) {
      const msg =
        typeof result.error === "object" && result.error !== null && "message" in result.error
          ? String((result.error as { message: string }).message)
          : JSON.stringify(result.error);
      this.logger.error(`Resend rechazó el envío a ${redactEmailForLog(to)}: ${sanitizeLogText(msg)}`);
      throw new Error(msg);
    }
    const id =
      result &&
      typeof result === "object" &&
      "data" in result &&
      result.data &&
      typeof result.data === "object" &&
      result.data !== null &&
      "id" in result.data
        ? String((result.data as { id?: string }).id || "")
        : "";
    if (id) {
      this.logger.log(`Resend: correo aceptado id=${id} to=${redactEmailForLog(to)}`);
    } else {
      this.logger.log(
        `Resend: envío completado to=${redactEmailForLog(to)} (sin id en respuesta; revise el panel de Resend si no llega).`
      );
    }
  }

  /**
   * Correo tras registro en el portal: enlace al sitio y texto según cuenta pendiente o ya aprobada.
   */
  async sendPortalRegistrationWelcome(params: PortalRegistrationWelcomeParams): Promise<void> {
    const { to, recipientName, portalUrl, accountApproved } = params;
    const baseUrl = portalUrl.replace(/\/+$/, "");
    const safeName = escapeHtml(recipientName.trim() || "Usuario");
    const safeTo = escapeHtml(to);

    const subject = accountApproved
      ? "Transportes Antares — Portal empresarial: acceso habilitado"
      : "Transportes Antares — Registro recibido; validación administrativa en curso";

    const statusBlock = accountApproved
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;border-radius:10px;background:#E8F6F0;border-left:4px solid #1B8E5F;overflow:hidden;">
          <tr>
            <td style="padding:16px 18px;">
              <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#0B1D33;">Estado de su cuenta</p>
              <p style="margin:0;font-size:15px;line-height:1.55;color:#0B1D33;">
                Su cuenta se encuentra <strong style="color:#1B8E5F;">autorizada</strong>. Ya puede acceder al <strong>portal empresarial</strong> con el correo registrado y la contraseña que definió en el alta.
              </p>
            </td>
          </tr>
        </table>`
      : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;border-radius:10px;background:#e8f4fc;border-left:4px solid #377cc0;overflow:hidden;">
          <tr>
            <td style="padding:16px 18px;">
              <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#134067;">Estado de su cuenta</p>
              <p style="margin:0;font-size:15px;line-height:1.55;color:#344F69;">
                Hemos registrado sus datos correctamente. Su cuenta está <strong style="color:#134067;">pendiente de aprobación</strong> por parte de un <strong>usuario administrador</strong> de Transportes Antares.
                Una vez autorizado el acceso, podrá iniciar sesión en el portal. Le invitamos a conservar este correo como comprobante de solicitud.
              </p>
            </td>
          </tr>
        </table>`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Transportes Antares</title>
</head>
<body style="margin:0;padding:0;background:#eef6fc;font-family:'Montserrat','Poppins','Roboto','Lato','Segoe UI',Helvetica,Arial,sans-serif;">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">
    ${accountApproved ? "Acceso al portal empresarial habilitado." : "Registro corporativo recibido; pendiente de validación administrativa."}
  </span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef6fc;padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #cce5f8;box-shadow:0 8px 32px rgba(15,52,82,0.12);">
          <tr>
            <td style="padding:32px 36px 28px 36px;background:linear-gradient(135deg,#134067 0%,#377cc0 48%,#83bee9 100%);">
              <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#cce5f8;">Transportes Antares</p>
              <p style="margin:10px 0 0 0;font-size:13px;line-height:1.4;color:#cce5f8;opacity:0.95;">Operador logístico B2B · Trazabilidad y cumplimiento</p>
              <h1 style="margin:18px 0 0 0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.25;letter-spacing:-0.02em;">
                Portal empresarial Antares
              </h1>
              <p style="margin:10px 0 0 0;font-size:15px;line-height:1.5;color:#cce5f8;max-width:480px;">
                Le damos la bienvenida. Este mensaje confirma su registro en nuestra plataforma de relación con clientes y equipos operativos.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 36px 8px 36px;">
              <p style="margin:0 0 14px 0;font-size:16px;line-height:1.55;color:#0B1D33;">
                Estimado(a) <strong>${safeName}</strong>,
              </p>
              <p style="margin:0 0 18px 0;font-size:15px;line-height:1.6;color:#344F69;">
                Por políticas de seguridad y trazabilidad, la cuenta queda asociada al siguiente correo corporativo:
                <strong style="color:#0B1D33;">${safeTo}</strong>. Este será su identificador para futuros ingresos al portal.
              </p>
              ${statusBlock}
              <p style="margin:0 0 22px 0;font-size:14px;line-height:1.55;color:#344F69;">
                Para continuar, utilice el acceso seguro al sitio. Recomendamos no compartir sus credenciales y operar desde equipos de confianza.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px 0;">
                <tr>
                  <td style="border-radius:10px;background:#377cc0;box-shadow:0 6px 20px rgba(55,124,192,0.35);">
                    <a href="${escapeHtml(baseUrl)}" target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                      Acceder al portal empresarial
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;line-height:1.55;color:#64748b;">
                Si el botón no responde, copie y pegue esta dirección en su navegador:<br/>
                <span style="word-break:break-all;color:#377cc0;font-weight:600;">${escapeHtml(baseUrl)}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 36px 28px 36px;background:linear-gradient(180deg,#eef6fc 0%,#FFFFFF 100%);border-top:1px solid #cce5f8;">
              <p style="margin:0 0 10px 0;font-size:12px;line-height:1.55;color:#344F69;">
                <strong style="color:#134067;">Confidencialidad.</strong> La información contenida es para uso del destinatario. Si recibió este mensaje por error, elimínelo y notifíquelo a su contacto en Transportes Antares.
              </p>
              <p style="margin:0;font-size:11px;line-height:1.5;color:#64748b;">
                Mensaje generado automáticamente — no responda a esta cuenta. Antares · Logística refrigerada y transporte especializado.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await this.send(to, subject, html);
  }
}
