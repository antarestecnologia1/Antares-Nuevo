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
  ExportEmployeeDocumentsDto,
  PresignEmployeeDocumentDto
} from "./dto/presign-employee-document.dto";
import { DownloadCompanyDocumentDto } from "./dto/company-document.dto";
import { R2Service } from "./r2.service";
import { ZipStreamWriter, sanitizeZipEntryName, uniqueZipEntryName } from "./zip-stream";
import { assertSafeUploadBuffer, assertSafeUploadMeta } from "./file-security";

type ReqUser = { userId: string; email: string; role: string };

const ALLOWED_TEMPLATE_KINDS = new Set(["oficina", "fijo", "prestacion"]);
const CONTRACT_TEMPLATE_ALLOWED_ROLES = new Set([
  "admin",
  "rrhh",
  "administracion",
  "auxiliar_administrativo",
  "lider_administrativo"
]);

const EMPLOYEE_DOCUMENT_MAX_BYTES = 50 * 1024 * 1024;

/** Techos de la exportación ZIP: sin ZIP64 y con memoria acotada en el servidor. */
const EMPLOYEE_DOCUMENT_EXPORT_MAX_FILES = 500;
const EMPLOYEE_DOCUMENT_EXPORT_MAX_BYTES = 400 * 1024 * 1024;

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

/** Carpeta corporativa: admite rutas jerárquicas con " / " (p. ej. "01. Empleados / Manuales"). */
function sanitizeCompanyDocumentFolder(raw: unknown) {
  const cleaned = String(raw || "General")
    .replace(/\\/g, "/")
    .split("/")
    .map((seg) =>
      seg
        .trim()
        .replace(/[^a-zA-Z0-9._\s\u00C0-\u024F-]+/g, "")
        .replace(/\s+/g, " ")
        .slice(0, 80)
    )
    .filter(Boolean)
    .slice(0, 6)
    .join(" / ")
    .slice(0, 200);
  return cleaned || "General";
}

/** Slug de carpeta corporativa para la clave R2 (rutas anidadas). */
function companyFolderSlugForStorage(raw: unknown) {
  const slug = sanitizeCompanyDocumentFolder(raw)
    .split("/")
    .map((seg) =>
      seg
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]+/g, "")
        .slice(0, 48)
        .toLowerCase()
    )
    .filter(Boolean)
    .join("/");
  return slug || "general";
}

/** Nombre ASCII para `Content-Disposition` (evita cabeceras inválidas con tildes). */
function downloadSlug(raw: string, fallback: string) {
  return (
    String(raw || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .toLowerCase() || fallback
  );
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
    const safeName = String(dto.fileName || "avatar.jpg").replace(/[^a-zA-Z0-9._-]+/g, "_");
    const meta = assertSafeUploadMeta({
      fileName: safeName,
      contentType: dto.contentType || "image/jpeg",
      purpose: "image"
    });
    const ownerId = String(req.user.userId || "anon").replace(/[^a-zA-Z0-9._-]+/g, "");
    const key = `empleados/${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${meta.ext}`;
    const url = await this.r2.presignAvatarUpload(key, meta.mime, 300);
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
    const meta = assertSafeUploadBuffer({
      buffer: file.buffer,
      fileName: file.originalname || "upload.jpg",
      mimeType: file.mimetype,
      purpose: "image"
    });
    const ownerId = String(req.user.userId || "anon").replace(/[^a-zA-Z0-9._-]+/g, "");
    const key = `portal-uploads/${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${meta.ext}`;
    await this.r2.putUploadsObject(key, file.buffer, meta.mime);
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
    const safeName = String(dto.fileName || "vacante.jpg").replace(/[^a-zA-Z0-9._-]+/g, "_");
    const meta = assertSafeUploadMeta({
      fileName: safeName,
      contentType: dto.contentType || "image/jpeg",
      purpose: "image"
    });
    const ownerId = String(req.user.userId || "anon").replace(/[^a-zA-Z0-9._-]+/g, "");
    const key = `vacantes/${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${meta.ext}`;
    const url = await this.r2.presignAvatarUpload(key, meta.mime, 600);
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
    const meta = assertSafeUploadBuffer({
      buffer: file.buffer,
      fileName: file.originalname || "vacante.jpg",
      mimeType: file.mimetype,
      purpose: "image"
    });
    const ownerId = String(req.user.userId || "anon").replace(/[^a-zA-Z0-9._-]+/g, "");
    const key = `vacantes/${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${meta.ext}`;
    await this.r2.putUploadsObject(key, file.buffer, meta.mime);
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
   * Hoja de vida de candidato (Contratación / RRHH) → R2 privado.
   * Prefijo `candidate-cvs/`. Sin R2: responde cv_blob inline (máx. 1,5 MB).
   */
  @Post("candidate-cv")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 6 * 1024 * 1024 }
    })
  )
  async uploadCandidateCv(
    @Req() req: { user: ReqUser },
    @UploadedFile() file: Express.Multer.File
  ) {
    await this.portal.assertCanUploadCandidateCv(req.user.userId, req.user.role);
    if (!file?.buffer?.length) {
      throw new BadRequestException("Adjunte la hoja de vida (PDF, Word o imagen).");
    }
    const meta = assertSafeUploadBuffer({
      buffer: file.buffer,
      fileName: file.originalname || "hoja-de-vida",
      mimeType: file.mimetype,
      purpose: "cv"
    });
    const origRaw = String(file.originalname || "hoja-de-vida").trim().slice(0, 240);
    const safeTail = origRaw.replace(/[^\w.\-\sÁÉÍÓÚáéíóúñÑ]+/g, "_").replace(/\s+/g, "_");
    const fileLabel = safeTail.length ? safeTail : "hoja-de-vida";

    if (this.r2.hasUploadsClient()) {
      const ownerId = String(req.user.userId || "anon").replace(/[^a-zA-Z0-9._-]+/g, "");
      const key = `candidate-cvs/${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${fileLabel}`;
      await this.r2.putUploadsObject(key, file.buffer, meta.mime);
      const publicUrl = this.r2.publicUrl(key);
      const out: Record<string, unknown> = {
        kind: "cv_file",
        name: origRaw || fileLabel,
        mime: meta.mime,
        storageKey: key
      };
      if (publicUrl) out.url = publicUrl;
      return out;
    }

    const maxInline = 1_500_000;
    if (file.buffer.length > maxInline) {
      throw new BadRequestException(
        `Sin almacenamiento R2 configurado solo se pueden adjuntar archivos hasta ${Math.round(maxInline / 1024 / 1024)} MB.`
      );
    }
    return {
      kind: "cv_blob",
      name: origRaw || fileLabel,
      mime: meta.mime,
      data: file.buffer.toString("base64")
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
    const safeName = String(dto.fileName || "documento").replace(/[^a-zA-Z0-9._-]+/g, "_");
    const meta = assertSafeUploadMeta({
      fileName: safeName,
      contentType: dto.contentType || "application/octet-stream",
      purpose: "document"
    });
    const employeeId = String(dto.employeeId || "").replace(/[^a-zA-Z0-9-]+/g, "");
    if (!employeeId) throw new BadRequestException("Colaborador inválido.");
    const folderSlug = folderSlugForStorage(dto.folder);
    const key = `documentos_rrhh/${employeeId}/${folderSlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${meta.ext}`;
    const uploadUrl = await this.r2.presignAvatarUpload(key, meta.mime, 600);
    return {
      uploadUrl,
      key,
      mimeType: meta.mime,
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
    const employeeId = String(employeeIdRaw || "").replace(/[^a-zA-Z0-9-]+/g, "");
    if (!employeeId) throw new BadRequestException("Seleccione un colaborador.");
    const origName = String(file.originalname || "documento").replace(/[^a-zA-Z0-9._-]+/g, "_");
    const meta = assertSafeUploadBuffer({
      buffer: file.buffer,
      fileName: origName,
      mimeType: file.mimetype,
      purpose: "document"
    });
    const folderSlug = folderSlugForStorage(folderRaw);
    const key = `documentos_rrhh/${employeeId}/${folderSlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${meta.ext}`;
    await this.r2.putUploadsObject(key, file.buffer, meta.mime);
    return {
      key,
      fileName: origName || `documento.${meta.ext}`,
      mimeType: meta.mime,
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

  /** Subida servidor → R2 para el gestor documental corporativo (evita CORS). */
  @Post("company-document")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: EMPLOYEE_DOCUMENT_MAX_BYTES }
    })
  )
  async uploadCompanyDocument(
    @Req() req: { user: ReqUser },
    @UploadedFile() file: Express.Multer.File,
    @Body("folder") folderRaw?: string
  ) {
    await this.portal.assertCanUploadToCompanyFolder(
      req.user.userId,
      req.user.role,
      sanitizeCompanyDocumentFolder(folderRaw)
    );
    if (!this.r2.hasUploadsClient()) {
      throw new BadRequestException("R2 no está configurado. Define CF_R2_* en el servidor.");
    }
    if (!file?.buffer?.length) {
      throw new BadRequestException("Adjunte un archivo.");
    }
    const scope = await this.portal.resolveCompanyDocumentWriteScope(
      req.user.userId,
      req.user.role
    );
    const scopeKey = String(scope || "global").replace(/[^a-zA-Z0-9-]+/g, "") || "global";
    const origName = String(file.originalname || "documento")
      .replace(/[^a-zA-Z0-9._\-\s\u00C0-\u024F]+/g, "_")
      .trim();
    const meta = assertSafeUploadBuffer({
      buffer: file.buffer,
      fileName: origName,
      mimeType: file.mimetype,
      purpose: "document"
    });
    const folderSlug = companyFolderSlugForStorage(folderRaw);
    const key = `documentos_empresa/${scopeKey}/${folderSlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${meta.ext}`;
    await this.r2.putUploadsObject(key, file.buffer, meta.mime);
    return {
      key,
      fileName: origName || `documento.${meta.ext}`,
      mimeType: meta.mime,
      sizeBytes: file.buffer.length,
      folder: sanitizeCompanyDocumentFolder(folderRaw)
    };
  }

  /** URL prefirmada GET temporal para descargar un documento corporativo. */
  @Post("company-document/download")
  async downloadCompanyDocument(
    @Req() req: { user: ReqUser },
    @Body() dto: DownloadCompanyDocumentDto
  ) {
    if (!this.r2.hasUploadsClient()) {
      throw new BadRequestException("R2 no está configurado.");
    }
    const storageKey = String(dto.storageKey || "").replace(/^\/+/, "");
    if (!storageKey || !storageKey.startsWith("documentos_empresa/")) {
      throw new ForbiddenException("El archivo no pertenece al gestor documental corporativo.");
    }
    await this.portal.assertCanDownloadCompanyDocumentByKey(
      req.user.userId,
      req.user.role,
      storageKey
    );
    const disposition = dto.disposition === "inline" ? "inline" : "attachment";
    const downloadUrl = await this.r2.presignGetUploadsObject(storageKey, 3600, {
      disposition,
      fileName: dto.fileName
    });
    return { downloadUrl, expiresInSec: 3600 };
  }

  /**
   * Descarga en un solo ZIP una o varias carpetas del expediente de un colaborador.
   * El archivo se arma sobre la respuesta: cada documento se trae de R2, se escribe
   * y se descarta, de modo que una carpeta grande no se acumule en memoria.
   */
  @Post("employee-documents/export-zip")
  async exportEmployeeDocumentsZip(
    @Req() req: { user: ReqUser },
    @Body() dto: ExportEmployeeDocumentsDto,
    @Res() res: Response
  ) {
    if (!this.r2.hasUploadsClient()) {
      throw new BadRequestException("R2 no está configurado.");
    }
    const { employeeName, files } = await this.portal.listEmployeeDocumentsForExport(
      req.user.userId,
      req.user.role,
      dto.employeeId,
      dto.folders
    );
    if (!files.length) {
      throw new BadRequestException(
        "Las carpetas seleccionadas no tienen archivos para exportar."
      );
    }
    if (files.length > EMPLOYEE_DOCUMENT_EXPORT_MAX_FILES) {
      throw new BadRequestException(
        `La selección tiene ${files.length} archivos y el máximo por exportación es ${EMPLOYEE_DOCUMENT_EXPORT_MAX_FILES}. Exporte menos carpetas a la vez.`
      );
    }
    const totalBytes = files.reduce((sum, file) => sum + file.sizeBytes, 0);
    if (totalBytes > EMPLOYEE_DOCUMENT_EXPORT_MAX_BYTES) {
      const totalMb = Math.ceil(totalBytes / (1024 * 1024));
      const maxMb = Math.floor(EMPLOYEE_DOCUMENT_EXPORT_MAX_BYTES / (1024 * 1024));
      throw new BadRequestException(
        `La selección pesa ${totalMb} MB y el máximo por exportación es ${maxMb} MB. Exporte menos carpetas a la vez.`
      );
    }

    const stamp = new Date().toISOString().slice(0, 10);
    const downloadName = `expediente-${downloadSlug(employeeName, "colaborador")}-${stamp}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
    res.setHeader("Cache-Control", "no-store");

    const prefix = `documentos_rrhh/${dto.employeeId}/`;
    const zip = new ZipStreamWriter(res);
    const usedNames = new Set<string>();
    const failures: string[] = [];
    try {
      for (const file of files) {
        const entryName = uniqueZipEntryName(
          `${sanitizeZipEntryName(file.folder, "General")}/${sanitizeZipEntryName(
            file.fileName.replace(/\//g, "-"),
            "documento"
          )}`,
          usedNames
        );
        if (!file.storageKey.startsWith(prefix)) {
          failures.push(`${entryName}: la referencia no pertenece al expediente.`);
          continue;
        }
        try {
          const { buffer } = await this.r2.getUploadsObject(file.storageKey);
          await zip.addFile(entryName, buffer, file.createdAt ?? undefined);
        } catch (err) {
          failures.push(
            `${entryName}: ${err instanceof Error ? err.message : "no se pudo leer del almacenamiento."}`
          );
        }
      }
      if (failures.length) {
        const report = [
          `Expediente: ${employeeName || dto.employeeId}`,
          `Fecha de exportación: ${stamp}`,
          "",
          `No fue posible incluir ${failures.length} de ${files.length} archivo(s):`,
          ...failures.map((line) => `- ${line}`)
        ].join("\r\n");
        await zip.addFile("ARCHIVOS_NO_EXPORTADOS.txt", Buffer.from(report, "utf8"));
      }
      await zip.finalize();
      res.end();
    } catch (err) {
      /* El ZIP ya viaja por el socket: cortar es la única señal de error posible. */
      res.destroy(err instanceof Error ? err : new Error("Error al generar el ZIP."));
    }
  }
}
