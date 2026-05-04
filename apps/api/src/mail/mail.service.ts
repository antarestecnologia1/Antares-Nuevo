import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

function escapeHtml(text: string): string {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type PortalRegistrationWelcomeParams = {
  to: string;
  recipientName: string;
  portalUrl: string;
  accountApproved: boolean;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>("RESEND_API_KEY");
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async send(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.warn(`Resend no configurado. Email omitido para ${to}`);
      return;
    }
    await this.resend.emails.send({
      from: this.config.get<string>("MAIL_FROM") ?? "onboarding@resend.dev",
      to,
      subject,
      html
    });
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
      ? "Bienvenido a Transportes Antares — acceso activo"
      : "Bienvenido a Transportes Antares — pendiente de autorización";

    const statusBlock = accountApproved
      ? `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.55;color:#166534;">
          Tu cuenta ya está <strong>autorizada</strong>. Puedes iniciar sesión en el portal con el correo y la contraseña que registraste.
        </p>`
      : `<p style="margin:0 0 16px 0;font-size:16px;line-height:1.55;color:#92400e;">
          Tu registro fue recibido correctamente. Tu cuenta está <strong>pendiente de aprobación</strong> por un administrador.
          Te notificaremos o podrás intentar ingresar cuando tu acceso esté activo.
        </p>`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,.08);">
          <tr>
            <td style="padding:28px 32px 8px 32px;background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);">
              <p style="margin:0;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;">Transportes Antares</p>
              <h1 style="margin:8px 0 0 0;font-size:22px;font-weight:700;color:#f8fafc;line-height:1.3;">Bienvenido al portal</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <p style="margin:0 0 12px 0;font-size:16px;line-height:1.55;color:#334155;">Hola <strong>${safeName}</strong>,</p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.55;color:#334155;">
                Gracias por registrarte. Este es tu correo de confirmación vinculado a la cuenta: <strong>${safeTo}</strong>.
              </p>
              ${statusBlock}
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="border-radius:8px;background:#1e40af;">
                    <a href="${escapeHtml(baseUrl)}" target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                      Ir al portal
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#64748b;">
                Si el botón no funciona, copia y pega esta URL en tu navegador:<br/>
                <span style="word-break:break-all;color:#2563eb;">${escapeHtml(baseUrl)}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
                Mensaje automático; no responda a este correo. Si no realizaste este registro, ignora este mensaje.
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
