import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(actorId: string, action: string, entity: string, payload: unknown) {
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action,
        entity,
        payload: JSON.stringify(payload)
      }
    });
  }
}
