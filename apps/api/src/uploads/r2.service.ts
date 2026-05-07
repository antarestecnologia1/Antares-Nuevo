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

    this.enabled = Boolean(
      accountId && accessKeyId && secretAccessKey && this.uploadsBucket && this.templatesBucket
    );

    if (this.enabled) {
      this.client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true
      });
    } else {
      this.logger.warn(
        "R2 deshabilitado: faltan CF_R2_ACCOUNT_ID/CF_R2_ACCESS_KEY_ID/CF_R2_SECRET_ACCESS_KEY/CF_R2_UPLOADS_BUCKET/CF_R2_TEMPLATES_BUCKET en .env."
      );
    }
  }

  isEnabled() {
    return this.enabled;
  }

  /** URL prefirmada PUT para que el navegador suba el binario directo a R2. */
  async presignAvatarUpload(key: string, contentType: string, expiresInSec = 300) {
    if (!this.enabled || !this.client) {
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

  publicUrl(key: string) {
    if (!this.publicBase) return "";
    return `${this.publicBase}/${key.replace(/^\/+/, "")}`;
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
