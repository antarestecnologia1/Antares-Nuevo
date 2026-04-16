import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

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
}
