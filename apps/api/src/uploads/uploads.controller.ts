import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express, Response } from "express";
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
    if (!this.r2.hasUploadsClient()) {
      throw new BadRequestException(
        "R2 no está configurado. Define CF_R2_ACCOUNT_ID, CF_R2_ACCESS_KEY_ID, CF_R2_SECRET_ACCESS_KEY y CF_R2_UPLOADS_BUCKET en el servidor."
      );
    }
    const rawCt = String(dto.contentType || "image/jpeg")
      .split(";")[0]
      .trim()
      .toLowerCase();
    const normalizedCt =
      rawCt === "image/jpg" || rawCt === "image/pjpeg" ? "image/jpeg" : rawCt || "image/jpeg";
    if (!/^image\/(jpeg|png|webp|gif)$/.test(normalizedCt)) {
      throw new BadRequestException(
        "Tipo de imagen no permitido. Use JPEG, PNG, WebP o GIF."
      );
    }
    const safeName = String(dto.fileName).replace(/[^a-zA-Z0-9._-]+/g, "_");
    const ext = safeName.includes(".") ? safeName.split(".").pop()!.toLowerCase() : "jpg";
    const allowedExt = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
    const finalExt = allowedExt.has(ext) ? ext : "jpg";
    const ownerId = String(req.user.userId || "anon").replace(/[^a-zA-Z0-9._-]+/g, "");
    const key = `empleados/${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${finalExt}`;
    const url = await this.r2.presignAvatarUpload(key, normalizedCt, 300);
    return {
      uploadUrl: url,
      publicUrl: this.r2.publicUrl(key),
      key,
      expiresInSec: 300
    };
  }

  /**
   * Subida de imagen vía API → R2 (evita CORS del PUT directo al bucket y
   * content-types raros del navegador). Mismo bucket que avatares/logos.
   */
  @Post("image")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 4 * 1024 * 1024 }
    })
  )
  async uploadImage(
    @Req() req: { user: ReqUser },
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!this.r2.hasUploadsClient()) {
      throw new BadRequestException(
        "R2 no está configurado. Define CF_R2_ACCOUNT_ID, CF_R2_ACCESS_KEY_ID, CF_R2_SECRET_ACCESS_KEY y CF_R2_UPLOADS_BUCKET en el servidor."
      );
    }
    if (!file?.buffer?.length) {
      throw new BadRequestException("Adjunte un archivo de imagen.");
    }
    const mime = String(file.mimetype || "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    const normalized =
      mime === "image/jpg" || mime === "image/pjpeg" ? "image/jpeg" : mime || "image/jpeg";
    if (!/^image\/(jpeg|png|webp|gif)$/.test(normalized)) {
      throw new BadRequestException("Solo se permiten imágenes JPEG, PNG, WebP o GIF.");
    }
    const ext =
      normalized === "image/png"
        ? "png"
        : normalized === "image/webp"
          ? "webp"
          : normalized === "image/gif"
            ? "gif"
            : "jpg";
    const ownerId = String(req.user.userId || "anon").replace(/[^a-zA-Z0-9._-]+/g, "");
    const key = `portal-uploads/${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    await this.r2.putUploadsObject(key, file.buffer, normalized);
    return {
      publicUrl: this.r2.publicUrl(key),
      key
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
