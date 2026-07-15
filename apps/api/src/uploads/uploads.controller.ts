import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
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
import {
  DownloadEmployeeDocumentDto,
  PresignEmployeeDocumentDto
} from "./dto/presign-employee-document.dto";
import { R2Service } from "./r2.service";

type ReqUser = { userId: string; email: string; role: string };

const ALLOWED_TEMPLATE_KINDS = new Set(["oficina", "fijo", "prestacion"]);
const CONTRACT_TEMPLATE_ALLOWED_ROLES = new Set([
  "admin",
  "rrhh",
  "administracion",
  "auxiliar_administrativo",
  "lider_administrativo"
]);

const EMPLOYEE_DOCUMENT_ALLOWED_ROLES = new Set([
  ...CONTRACT_TEMPLATE_ALLOWED_ROLES
]);

const EMPLOYEE_DOCUMENT_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const EMPLOYEE_DOCUMENT_MAX_BYTES = 15 * 1024 * 1024;

function normalizeEmployeeDocMime(raw: string) {
  const mime = String(raw || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (mime === "image/jpg" || mime === "image/pjpeg") return "image/jpeg";
  return mime || "application/octet-stream";
}

function extFromMime(mime: string) {
  switch (mime) {
    case "application/pdf":
      return "pdf";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    default:
      return "jpg";
  }
}

function assertEmployeeDocumentRole(role: string) {
  const r = String(role || "").trim().toLowerCase();
  if (!EMPLOYEE_DOCUMENT_ALLOWED_ROLES.has(r)) {
    throw new ForbiddenException("No autorizado para gestionar documentos de colaboradores.");
  }
}

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
  async contractTemplate(@Req() req: { user: ReqUser }, @Param("kind") kind: string, @Res() res: Response) {
    if (!this.r2.isEnabled()) {
      throw new BadRequestException(
        "R2 no está configurado. Define CF_R2_* en el servidor."
      );
    }
    const role = String(req.user?.role || "").trim().toLowerCase();
    if (!CONTRACT_TEMPLATE_ALLOWED_ROLES.has(role)) {
      throw new ForbiddenException("No autorizado para descargar plantillas de contrato.");
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

  /** URL prefirmada PUT para subir documento de expediente RRHH a R2 (privado). */
  @Post("employee-document/presign")
  async presignEmployeeDocument(
    @Req() req: { user: ReqUser },
    @Body() dto: PresignEmployeeDocumentDto
  ) {
    assertEmployeeDocumentRole(req.user?.role);
    if (!this.r2.hasUploadsClient()) {
      throw new BadRequestException(
        "R2 no está configurado. Define CF_R2_* en el servidor."
      );
    }
    const normalizedCt = normalizeEmployeeDocMime(dto.contentType);
    if (!EMPLOYEE_DOCUMENT_MIME.has(normalizedCt)) {
      throw new BadRequestException(
        "Tipo de archivo no permitido. Use PDF, JPEG, PNG, WebP o Word."
      );
    }
    const employeeId = String(dto.employeeId || "").replace(/[^a-zA-Z0-9-]+/g, "");
    if (!employeeId) throw new BadRequestException("Colaborador inválido.");
    const safeName = String(dto.fileName || "documento").replace(/[^a-zA-Z0-9._-]+/g, "_");
    const ext = safeName.includes(".")
      ? safeName.split(".").pop()!.toLowerCase()
      : extFromMime(normalizedCt);
    const docType = String(dto.documentType || "otro")
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .slice(0, 48);
    const key = `documentos_rrhh/${employeeId}/${docType}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadUrl = await this.r2.presignAvatarUpload(key, normalizedCt, 600);
    return {
      uploadUrl,
      key,
      mimeType: normalizedCt,
      expiresInSec: 600
    };
  }

  /** Subida servidor → R2 para documentos de expediente (evita CORS). */
  @Post("employee-document")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: EMPLOYEE_DOCUMENT_MAX_BYTES }
    })
  )
  async uploadEmployeeDocument(
    @Req() req: { user: ReqUser },
    @UploadedFile() file: Express.Multer.File,
    @Body("employeeId") employeeIdRaw: string,
    @Body("documentType") documentTypeRaw?: string
  ) {
    assertEmployeeDocumentRole(req.user?.role);
    if (!this.r2.hasUploadsClient()) {
      throw new BadRequestException(
        "R2 no está configurado. Define CF_R2_* en el servidor."
      );
    }
    if (!file?.buffer?.length) {
      throw new BadRequestException("Adjunte un archivo.");
    }
    const normalizedCt = normalizeEmployeeDocMime(file.mimetype);
    if (!EMPLOYEE_DOCUMENT_MIME.has(normalizedCt)) {
      throw new BadRequestException("Solo se permiten PDF, imágenes JPEG/PNG/WebP o Word.");
    }
    const employeeId = String(employeeIdRaw || "").replace(/[^a-zA-Z0-9-]+/g, "");
    if (!employeeId) throw new BadRequestException("Seleccione un colaborador.");
    const docType = String(documentTypeRaw || "otro")
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .slice(0, 48);
    const origName = String(file.originalname || "documento").replace(/[^a-zA-Z0-9._-]+/g, "_");
    const ext = origName.includes(".")
      ? origName.split(".").pop()!.toLowerCase()
      : extFromMime(normalizedCt);
    const key = `documentos_rrhh/${employeeId}/${docType}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    await this.r2.putUploadsObject(key, file.buffer, normalizedCt);
    return {
      key,
      fileName: origName || `documento.${ext}`,
      mimeType: normalizedCt,
      sizeBytes: file.buffer.length
    };
  }

  /** URL prefirmada GET temporal para descargar un documento del expediente. */
  @Post("employee-document/download")
  async downloadEmployeeDocument(
    @Req() req: { user: ReqUser },
    @Body() dto: DownloadEmployeeDocumentDto
  ) {
    assertEmployeeDocumentRole(req.user?.role);
    if (!this.r2.hasUploadsClient()) {
      throw new BadRequestException("R2 no está configurado.");
    }
    const employeeId = String(dto.employeeId || "").replace(/[^a-zA-Z0-9-]+/g, "");
    const storageKey = String(dto.storageKey || "").replace(/^\/+/, "");
    if (!employeeId || !storageKey) {
      throw new BadRequestException("Referencia de documento inválida.");
    }
    const prefix = `documentos_rrhh/${employeeId}/`;
    if (!storageKey.startsWith(prefix)) {
      throw new ForbiddenException("El archivo no pertenece al expediente del colaborador.");
    }
    const downloadUrl = await this.r2.presignGetUploadsObject(storageKey, 3600);
    return { downloadUrl, expiresInSec: 3600 };
  }
}
