/**
 * Sube las plantillas Word de documentacion/ al bucket R2 (CF_R2_TEMPLATES_BUCKET).
 *
 * Uso (desde la raíz del repo, con CF_R2_* en apps/api/.env):
 *   node apps/api/scripts/upload-contract-templates.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const LEGACY_TEMPLATE_FILES = [
  "CONTRATO_TRABAJO_PERSONAL_OFICINA.docx",
  "CONTRATO_PERSONAL_TERMINO_FIJO.docx",
  "CONTRATO_PRESTACION_DE_SERVICIOS_CONDUCTORES.docx"
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, "..", "..", "..");
const DOC_DIR = path.join(REPO_ROOT, "documentacion");
const ENV_PATH = path.join(__dirname, "..", ".env");

const TEMPLATES = {
  oficina: "CONTRATO_ADMINISTRATIVO_OFICINA.docx",
  fijo: "CONTRATO_TERMINO_FIJO.docx",
  prestacion: "CONTRATO_PRESTACION_DE_SERVICIOS.docx"
};

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === "") process.env[key] = val;
  }
}

function requireEnv(name) {
  const v = String(process.env[name] || "").trim();
  if (!v) throw new Error(`Falta ${name} en apps/api/.env`);
  return v;
}

async function main() {
  loadEnvFile(ENV_PATH);
  const accountId = requireEnv("CF_R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("CF_R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("CF_R2_SECRET_ACCESS_KEY");
  const bucket = requireEnv("CF_R2_TEMPLATES_BUCKET");

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true
  });

  for (const [kind, fileName] of Object.entries(TEMPLATES)) {
    const localPath = path.join(DOC_DIR, fileName);
    if (!existsSync(localPath)) {
      throw new Error(`No existe la plantilla local: ${localPath}`);
    }
    const body = readFileSync(localPath);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: body,
        ContentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      })
    );
    console.log(`Subido ${fileName} → s3://${bucket}/${fileName} (${kind})`);
  }
  for (const legacyKey of LEGACY_TEMPLATE_FILES) {
    try {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: legacyKey }));
      console.log(`Eliminado legacy s3://${bucket}/${legacyKey}`);
    } catch (err) {
      console.warn(`No se pudo eliminar ${legacyKey}:`, err?.message || err);
    }
  }
  console.log("Plantillas de contrato publicadas en Cloudflare R2.");
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
