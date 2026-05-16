import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const TEMPLATE_KEYS: Record<string, string> = {
  oficina: "CONTRATO_TRABAJO_PERSONAL_OFICINA.docx",
  fijo: "CONTRATO_PERSONAL_TERMINO_FIJO.docx",
  prestacion: "CONTRATO_PRESTACION_DE_SERVICIOS_CONDUCTORES.docx"
};

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly client: S3Client | null = null;
  /** Listo para subidas y GET prefirmados en `CF_R2_UPLOADS_BUCKET` (CV, avatares). */
  private readonly uploadsClientReady: boolean;
  /** Listo además para plantillas de contrato en `CF_R2_TEMPLATES_BUCKET`. */
  private readonly enabled: boolean;
  private readonly uploadsBucket: string;
  private readonly templatesBucket: string;
  private readonly publicBase: string;

  constructor(private readonly config: ConfigService) {
    const accountId = (config.get<string>("CF_R2_ACCOUNT_ID") || "").trim();
    const accessKeyId = (config.get<string>("CF_R2_ACCESS_KEY_ID") || "").trim();
    const secretAccessKey = (config.get<string>("CF_R2_SECRET_ACCESS_KEY") || "").trim();
    this.uploadsBucket = (config.get<string>("CF_R2_UPLOADS_BUCKET") || "").trim();
    this.templatesBucket = (config.get<string>("CF_R2_TEMPLATES_BUCKET") || "").trim();
    this.publicBase = (config.get<string>("CF_R2_PUBLIC_BASE") || "").trim().replace(/\/$/, "");

    this.uploadsClientReady = Boolean(
      accountId && accessKeyId && secretAccessKey && this.uploadsBucket
    );
    this.enabled = Boolean(this.uploadsClientReady && this.templatesBucket);

    if (this.uploadsClientReady) {
      this.client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true
      });
    } else {
      this.logger.warn(
        "R2 uploads deshabilitado: faltan CF_R2_ACCOUNT_ID/CF_R2_ACCESS_KEY_ID/CF_R2_SECRET_ACCESS_KEY o CF_R2_UPLOADS_BUCKET en .env."
      );
    }
    if (this.uploadsClientReady && !this.templatesBucket) {
      this.logger.warn(
        "R2 plantillas no configuradas (CF_R2_TEMPLATES_BUCKET): las plantillas Word de contratos no estarán disponibles; CV y avatares sí pueden usar el bucket de uploads."
      );
    }
  }

  isEnabled() {
    return this.enabled;
  }

  /** Base pública configurada (`CF_R2_PUBLIC_BASE`), sin barra final. */
  getPublicBase(): string {
    return this.publicBase;
  }

  /** URL estable del dominio público de R2 para una key ya subida (vacío si no hay PUBLIC_BASE). */
  isStablePublicObjectUrl(url: string, key: string): boolean {
    if (!this.publicBase) return false;
    const u = String(url || "").trim();
    const normalizedKey = String(key || "").replace(/^\/+/, "");
    if (!u || !normalizedKey) return false;
    return u === `${this.publicBase}/${normalizedKey}` || u.startsWith(`${this.publicBase}/`);
  }

  /** Cliente S3 listo para operar sobre el bucket de uploads (independiente del bucket de plantillas). */
  hasUploadsClient(): boolean {
    return Boolean(this.client);
  }

  /** URL prefirmada PUT para que el navegador suba el binario directo a R2. */
  async presignAvatarUpload(key: string, contentType: string, expiresInSec = 300) {
    if (!this.client) {
      throw new InternalServerErrorException(
        "R2 no está configurado en el servidor."
      );
    }
    const cmd = new PutObjectCommand({
      Bucket: this.uploadsBucket,
      Key: key,
      ContentType: contentType
    });
    return getSignedUrl(this.client, cmd, { expiresIn: expiresInSec });
  }

  /** Subida servidor → objetos binarios del bucket `CF_R2_UPLOADS_BUCKET` (avatares, documentos auxiliares). */
  async putUploadsObject(key: string, body: Buffer, contentType: string) {
    if (!this.client) {
      throw new InternalServerErrorException(
        "R2 no está configurado en el servidor."
      );
    }
    const normalizedKey = key.replace(/^\/+/, "");
    const cmd = new PutObjectCommand({
      Bucket: this.uploadsBucket,
      Key: normalizedKey,
      Body: body,
      ContentType: contentType || "application/octet-stream"
    });
    await this.client.send(cmd);
    return { key: normalizedKey };
  }

  /**
   * Hoja de vida de postulaciones públicas (mismo bucket que `putUploadsObject`).
   * Prefijo habitual de key: `job-applications/<uuid>/...`.
   */
  putJobCv(key: string, body: Buffer, contentType: string) {
    return this.putUploadsObject(key, body, contentType);
  }

  publicUrl(key: string) {
    if (!this.publicBase) return "";
    return `${this.publicBase}/${key.replace(/^\/+/, "")}`;
  }

  /** GET prefirmado para descargar un objeto ya subido a `CF_R2_UPLOADS_BUCKET` (p. ej. CV sin dominio público configurado). */
  async presignGetUploadsObject(key: string, expiresInSec = 7200) {
    if (!this.client) {
      throw new InternalServerErrorException(
        "R2 no está configurado en el servidor."
      );
    }
    const normalizedKey = key.replace(/^\/+/, "");
    const cmd = new GetObjectCommand({
      Bucket: this.uploadsBucket,
      Key: normalizedKey
    });
    return getSignedUrl(this.client, cmd, { expiresIn: expiresInSec });
  }

  /** Lee una plantilla Word del bucket privado y devuelve el buffer. */
  async getContractTemplate(kind: string): Promise<{ buffer: Buffer; fileName: string }> {
    if (!this.enabled || !this.client) {
      throw new InternalServerErrorException(
        "R2 no está configurado en el servidor."
      );
    }
    const key = TEMPLATE_KEYS[String(kind || "").toLowerCase()];
    if (!key) {
      throw new InternalServerErrorException(`Plantilla desconocida: ${kind}`);
    }
    const cmd = new GetObjectCommand({ Bucket: this.templatesBucket, Key: key });
    const out = await this.client.send(cmd);
    const body = out.Body as { transformToByteArray?: () => Promise<Uint8Array> } | undefined;
    if (!body || typeof body.transformToByteArray !== "function") {
      throw new InternalServerErrorException(
        "No se pudo leer la plantilla desde R2."
      );
    }
    const bytes = await body.transformToByteArray();
    return { buffer: Buffer.from(bytes), fileName: key };
  }
}
