import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  forwardRef
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express, Response } from "express";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { PortalService } from "../portal/portal.service";
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

const EMPLOYEE_DOCUMENT_BLOCKED_EXT = new Set([
  "exe",
  "bat",
  "cmd",
  "com",
  "scr",
  "msi",
  "dll",
  "vbs",
  "vbe",
  "js",
  "jse",
  "ws",
  "wsf",
  "wsc",
  "wsh",
  "ps1",
  "psm1",
  "psd1",
  "jar",
  "app",
  "deb",
  "rpm",
  "sh",
  "bash",
  "cpl",
  "inf",
  "reg",
  "hta",
  "pif"
]);

const EMPLOYEE_DOCUMENT_MAX_BYTES = 50 * 1024 * 1024;

function normalizeEmployeeDocMime(raw: string) {
  const mime = String(raw || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (mime === "image/jpg" || mime === "image/pjpeg") return "image/jpeg";
  return mime || "application/octet-stream";
}

function extFromFileName(fileName: string) {
  const safe = String(fileName || "").trim();
  const idx = safe.lastIndexOf(".");
  if (idx <= 0 || idx >= safe.length - 1) return "";
  return safe.slice(idx + 1).toLowerCase().slice(0, 16);
}

function extFromMime(mime: string) {
  switch (mime) {
    case "application/pdf":
      return "pdf";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    case "application/vnd.ms-excel":
      return "xls";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "xlsx";
    case "text/plain":
      return "txt";
    case "text/csv":
      return "csv";
    case "application/zip":
      return "zip";
    default:
      return "";
  }
}

function resolveFileExt(fileName: string, mime: string) {
  const fromName = extFromFileName(fileName);
  if (fromName && !EMPLOYEE_DOCUMENT_BLOCKED_EXT.has(fromName)) return fromName;
  const fromMime = extFromMime(mime);
  if (fromMime) return fromMime;
  return "bin";
}

function sanitizeEmployeeDocumentFolder(raw: unknown) {
  const cleaned = String(raw || "General")
    .trim()
    .replace(/[^a-zA-Z0-9._\s\u00C0-\u024F-]+/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 128);
  return cleaned || "General";
}

function folderSlugForStorage(raw: unknown) {
  return sanitizeEmployeeDocumentFolder(raw)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]+/g, "")
    .slice(0, 64)
    .toLowerCase() || "general";
}

function assertSafeEmployeeDocumentFile(fileName: string) {
  const ext = extFromFileName(fileName);
  if (ext && EMPLOYEE_DOCUMENT_BLOCKED_EXT.has(ext)) {
    throw new BadRequestException(
      `Extensión .${ext} no permitida por seguridad. Use otro formato de archivo.`
    );
  }
}

@UseGuards(JwtAuthGuard)
@Controller("uploads")
export class UploadsController {
  constructor(
    private readonly r2: R2Service,
    @Inject(forwardRef(() => PortalService)) private readonly portal: PortalService
  ) {}

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
   * Presign PUT → Cloudflare R2 para imagen de vacante (portal Carreras).
   * Prefijo: `vacantes/<userId>/...`
   */
  @Post("vacancy-image/presign")
  async presignVacancyImage(
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
    const safeName = String(dto.fileName || "vacante.jpg").replace(/[^a-zA-Z0-9._-]+/g, "_");
    const ext = safeName.includes(".") ? safeName.split(".").pop()!.toLowerCase() : "jpg";
    const allowedExt = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
    const finalExt = allowedExt.has(ext) ? ext : "jpg";
    const ownerId = String(req.user.userId || "anon").replace(/[^a-zA-Z0-9._-]+/g, "");
    const key = `vacantes/${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${finalExt}`;
    const url = await this.r2.presignAvatarUpload(key, normalizedCt, 600);
    const publicUrl = this.r2.publicUrl(key);
    if (!publicUrl) {
      throw new BadRequestException(
        "R2 está configurado pero falta CF_R2_PUBLIC_BASE. Sin dominio público la imagen de vacante no será visible en Carreras."
      );
    }
    return {
      uploadUrl: url,
      publicUrl,
      key,
      expiresInSec: 600
    };
  }

  /**
   * Subida de imagen de vacante vía API → Cloudflare R2
   * (evita CORS del PUT directo). Prefijo `vacantes/`.
   */
  @Post("vacancy-image")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 6 * 1024 * 1024 }
    })
  )
  async uploadVacancyImage(
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
    const key = `vacantes/${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    await this.r2.putUploadsObject(key, file.buffer, normalized);
    const publicUrl = this.r2.publicUrl(key);
    if (!publicUrl) {
      throw new BadRequestException(
        "R2 está configurado pero falta CF_R2_PUBLIC_BASE. Sin dominio público la imagen de vacante no será visible en Carreras."
      );
    }
    return {
      publicUrl,
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
    await this.portal.assertCanUploadEmployeeDocument(req.user.userId, req.user.role);
    if (!this.r2.hasUploadsClient()) {
      throw new BadRequestException(
        "R2 no está configurado. Define CF_R2_* en el servidor."
      );
    }
    const normalizedCt = normalizeEmployeeDocMime(dto.contentType);
    const safeName = String(dto.fileName || "documento").replace(/[^a-zA-Z0-9._-]+/g, "_");
    assertSafeEmployeeDocumentFile(safeName);
    const employeeId = String(dto.employeeId || "").replace(/[^a-zA-Z0-9-]+/g, "");
    if (!employeeId) throw new BadRequestException("Colaborador inválido.");
    const ext = resolveFileExt(safeName, normalizedCt);
    const folderSlug = folderSlugForStorage(dto.folder);
    const key = `documentos_rrhh/${employeeId}/${folderSlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadUrl = await this.r2.presignAvatarUpload(key, normalizedCt, 600);
    return {
      uploadUrl,
      key,
      mimeType: normalizedCt,
      folder: sanitizeEmployeeDocumentFolder(dto.folder),
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
    @Body("documentType") _documentTypeRaw?: string,
    @Body("folder") folderRaw?: string
  ) {
    await this.portal.assertCanUploadEmployeeDocument(req.user.userId, req.user.role);
    if (!this.r2.hasUploadsClient()) {
      throw new BadRequestException(
        "R2 no está configurado. Define CF_R2_* en el servidor."
      );
    }
    if (!file?.buffer?.length) {
      throw new BadRequestException("Adjunte un archivo.");
    }
    const normalizedCt = normalizeEmployeeDocMime(file.mimetype);
    const employeeId = String(employeeIdRaw || "").replace(/[^a-zA-Z0-9-]+/g, "");
    if (!employeeId) throw new BadRequestException("Seleccione un colaborador.");
    const origName = String(file.originalname || "documento").replace(/[^a-zA-Z0-9._-]+/g, "_");
    assertSafeEmployeeDocumentFile(origName);
    const folderSlug = folderSlugForStorage(folderRaw);
    const ext = resolveFileExt(origName, normalizedCt);
    const key = `documentos_rrhh/${employeeId}/${folderSlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    await this.r2.putUploadsObject(key, file.buffer, normalizedCt);
    return {
      key,
      fileName: origName || `documento.${ext}`,
      mimeType: normalizedCt,
      sizeBytes: file.buffer.length,
      folder: sanitizeEmployeeDocumentFolder(folderRaw)
    };
  }

  /** URL prefirmada GET temporal para descargar un documento del expediente. */
  @Post("employee-document/download")
  async downloadEmployeeDocument(
    @Req() req: { user: ReqUser },
    @Body() dto: DownloadEmployeeDocumentDto
  ) {
    await this.portal.assertCanDownloadEmployeeDocument(req.user.userId, req.user.role);
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
