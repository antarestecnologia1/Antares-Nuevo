import { InjectQueue } from "@nestjs/bull";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Queue } from "bull";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRequestDto } from "./dto/create-request.dto";
import { MailService } from "../mail/mail.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly audit: AuditService,
    @InjectQueue("auto-approval") private readonly autoApprovalQueue: Queue
  ) {}

  async create(userId: string, dto: CreateRequestDto) {
    const approvalDeadline = new Date(Date.now() + 10 * 60 * 1000);
    const request = await this.prisma.tripRequest.create({
      data: {
        userId,
        origin: dto.origin,
        destination: dto.destination,
        vehicleType: dto.vehicleType,
        weightKg: dto.weightKg,
        pickupAt: new Date(dto.pickupAt),
        approvalDeadline,
        status: "PENDIENTE"
      }
    });

    await this.autoApprovalQueue.add(
      "auto-approve-request",
      { requestId: request.id },
      { delay: 10 * 60 * 1000, removeOnComplete: true }
    );

    await this.audit.log(userId, "CREATE_REQUEST", "TripRequest", { requestId: request.id });
    return request;
  }

  async listByUser(userId: string, role: string) {
    if (role === "ADMIN") {
      return this.prisma.tripRequest.findMany({ orderBy: { createdAt: "desc" } });
    }
    return this.prisma.tripRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  async approve(requestId: string, adminId: string) {
    const request = await this.prisma.tripRequest.findUnique({ where: { id: requestId }, include: { user: true } });
    if (!request) throw new NotFoundException("Solicitud no encontrada");

    const updated = await this.prisma.tripRequest.update({
      where: { id: requestId },
      data: { status: "APROBADA" }
    });

    await this.mail.send(
      request.user.email,
      "Solicitud aprobada",
      `<p>Tu solicitud ${request.id} fue aprobada.</p>`
    );
    await this.audit.log(adminId, "APPROVE_REQUEST", "TripRequest", { requestId });
    return updated;
  }
}
