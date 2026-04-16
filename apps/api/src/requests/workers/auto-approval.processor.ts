import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { PrismaService } from "../../prisma/prisma.service";
import { MailService } from "../../mail/mail.service";

@Processor("auto-approval")
export class AutoApprovalProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService
  ) {}

  @Process("auto-approve-request")
  async handle(job: Job<{ requestId: string }>) {
    const request = await this.prisma.tripRequest.findUnique({
      where: { id: job.data.requestId },
      include: { user: true }
    });
    if (!request || request.status !== "PENDIENTE") return;

    await this.prisma.tripRequest.update({
      where: { id: request.id },
      data: { status: "APROBADA" }
    });

    await this.mail.send(
      request.user.email,
      "Auto-aprobación ejecutada",
      `<p>Tu solicitud ${request.id} fue auto-aprobada por timeout de 10 minutos.</p>`
    );
  }
}
