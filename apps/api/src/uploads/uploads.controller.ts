import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import type { Response } from "express";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { PresignAvatarDto } from "./dto/presign-avatar.dto";
import { R2Service } from "./r2.service";

type ReqUser = { userId: string; email: string; role: string };

const ALLOWED_TEMPLATE_KINDS = new Set(["oficina", "fijo", "prestacion"]);

@UseGuards(JwtAuthGuard)
@Controller("uploads")
export class UploadsController {
  constructor(private readonly r2: R2Service) {}

  @Post("avatar/presign")
  async presignAvatar(
    @Req() req: { user: ReqUser },
    @Body() dto: PresignAvatarDto
  ) {
    if (!this.r2.isEnabled()) {
      throw new BadRequestException(
        "R2 no está configurado. Define CF_R2_* en el servidor."
      );
    }
    const safeName = String(dto.fileName).replace(/[^a-zA-Z0-9._-]+/g, "_");
    const ext = safeName.includes(".") ? safeName.split(".").pop()!.toLowerCase() : "jpg";
    const allowedExt = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
    const finalExt = allowedExt.has(ext) ? ext : "jpg";
    const ownerId = String(req.user.userId || "anon").replace(/[^a-zA-Z0-9._-]+/g, "");
    const key = `empleados/${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${finalExt}`;
    const url = await this.r2.presignAvatarUpload(key, dto.contentType, 300);
    return {
      uploadUrl: url,
      publicUrl: this.r2.publicUrl(key),
      key,
      expiresInSec: 300
    };
  }

  /**
   * Devuelve el .docx de la plantilla solicitada. Solo usuarios autenticados
   * pueden descargar las plantillas (datos legales del contrato).
   */
  @Get("contract-template/:kind")
  async contractTemplate(@Param("kind") kind: string, @Res() res: Response) {
    if (!this.r2.isEnabled()) {
      throw new BadRequestException(
        "R2 no está configurado. Define CF_R2_* en el servidor."
      );
    }
    const safeKind = String(kind || "").toLowerCase();
    if (!ALLOWED_TEMPLATE_KINDS.has(safeKind)) {
      throw new BadRequestException("Plantilla no soportada.");
    }
    const { buffer, fileName } = await this.r2.getContractTemplate(safeKind);
    res
      .setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
      .setHeader("Content-Disposition", `inline; filename="${fileName}"`)
      .setHeader("Cache-Control", "private, max-age=900")
      .send(buffer);
  }
}
