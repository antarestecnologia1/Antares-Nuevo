/**
 * Valida conectividad y buckets Cloudflare R2 (CF_R2_* en apps/api/.env).
 * Uso: node apps/api/scripts/validate-r2.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  HeadBucketCommand,
  ListObjectsV2Command,
  S3Client
} from "@aws-sdk/client-s3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, "..", ".env");

const TEMPLATE_KEYS = [
  "CONTRATO_ADMINISTRATIVO_OFICINA.docx",
  "CONTRATO_TERMINO_FIJO.docx",
  "CONTRATO_PRESTACION_DE_SERVICIOS.docx"
];

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

function mask(v) {
  const s = String(v || "").trim();
  if (!s) return "(vacío)";
  if (s.length <= 6) return "***";
  return `${s.slice(0, 4)}…${s.slice(-2)} (${s.length} chars)`;
}

async function probeBucket(client, bucket, label) {
  const out = { label, bucket, ok: false, objectCount: 0, sampleKeys: [], error: null };
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    const listed = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 10 })
    );
    out.objectCount = Number(listed.KeyCount || listed.Contents?.length || 0);
    out.sampleKeys = (listed.Contents || []).map((o) => o.Key).filter(Boolean).slice(0, 5);
    out.truncated = Boolean(listed.IsTruncated);
    out.ok = true;
  } catch (err) {
    out.error = String(err?.name || err?.Code || "Error") + ": " + String(err?.message || err);
  }
  return out;
}

async function probePublicBase(publicBase) {
  const base = String(publicBase || "").trim().replace(/\/$/, "");
  if (!base) return { configured: false, reachable: false, status: null };
  try {
    const res = await fetch(base, { method: "HEAD", redirect: "follow" });
    return { configured: true, reachable: res.ok || res.status === 403 || res.status === 404, status: res.status };
  } catch (err) {
    return { configured: true, reachable: false, status: null, error: String(err?.message || err) };
  }
}

async function main() {
  loadEnvFile(ENV_PATH);
  const accountId = String(process.env.CF_R2_ACCOUNT_ID || "").trim();
  const accessKeyId = String(process.env.CF_R2_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = String(process.env.CF_R2_SECRET_ACCESS_KEY || "").trim();
  const uploadsBucket = String(process.env.CF_R2_UPLOADS_BUCKET || "").trim();
  const templatesBucket = String(process.env.CF_R2_TEMPLATES_BUCKET || "").trim();
  const publicBase = String(process.env.CF_R2_PUBLIC_BASE || "").trim();

  console.log("=== Validación Cloudflare R2 ===\n");
  console.log("Variables (.env):");
  console.log(`  CF_R2_ACCOUNT_ID:        ${accountId ? mask(accountId) : "FALTA"}`);
  console.log(`  CF_R2_ACCESS_KEY_ID:     ${accessKeyId ? mask(accessKeyId) : "FALTA"}`);
  console.log(`  CF_R2_SECRET_ACCESS_KEY: ${secretAccessKey ? mask(secretAccessKey) : "FALTA"}`);
  console.log(`  CF_R2_UPLOADS_BUCKET:    ${uploadsBucket || "FALTA"}`);
  console.log(`  CF_R2_TEMPLATES_BUCKET:  ${templatesBucket || "FALTA"}`);
  console.log(`  CF_R2_PUBLIC_BASE:       ${publicBase || "(no configurado)"}`);

  const uploadsReady = Boolean(accountId && accessKeyId && secretAccessKey && uploadsBucket);
  const fullEnabled = Boolean(uploadsReady && templatesBucket);
  console.log(`\nEstado lógico (R2Service):`);
  console.log(`  hasUploadsClient(): ${uploadsReady ? "SÍ" : "NO"}`);
  console.log(`  isEnabled():        ${fullEnabled ? "SÍ" : "NO"}`);

  if (!uploadsReady) {
    console.error("\n❌ Faltan credenciales o bucket de uploads. R2 no operará.");
    process.exit(1);
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true
  });

  console.log("\n--- Bucket uploads ---");
  const uploadsProbe = await probeBucket(client, uploadsBucket, "uploads");
  if (uploadsProbe.ok) {
    console.log(`  ✅ Accesible · objetos listados (muestra): ${uploadsProbe.objectCount}${uploadsProbe.truncated ? "+" : ""}`);
    uploadsProbe.sampleKeys.forEach((k) => console.log(`     · ${k}`));
  } else {
    console.log(`  ❌ ${uploadsProbe.error}`);
  }

  if (templatesBucket) {
    console.log("\n--- Bucket plantillas ---");
    const tplProbe = await probeBucket(client, templatesBucket, "templates");
    if (tplProbe.ok) {
      console.log(`  ✅ Accesible · objetos en muestra: ${tplProbe.objectCount}${tplProbe.truncated ? "+" : ""}`);
      tplProbe.sampleKeys.forEach((k) => console.log(`     · ${k}`));
      console.log("\n  Plantillas requeridas por la API:");
      const keysInBucket = new Set(tplProbe.sampleKeys);
      if (tplProbe.truncated) {
        const full = await client.send(new ListObjectsV2Command({ Bucket: templatesBucket, MaxKeys: 100 }));
        for (const o of full.Contents || []) keysInBucket.add(o.Key);
      }
      for (const key of TEMPLATE_KEYS) {
        const found = [...keysInBucket].some((k) => k === key);
        console.log(`     ${found ? "✅" : "❌"} ${key}`);
      }
    } else {
      console.log(`  ❌ ${tplProbe.error}`);
    }
  }

  if (publicBase) {
    console.log("\n--- Dominio público (CF_R2_PUBLIC_BASE) ---");
    const pub = await probePublicBase(publicBase);
    if (pub.reachable) {
      console.log(`  ✅ Responde HTTP ${pub.status} en ${publicBase}`);
    } else {
      console.log(`  ⚠️  No responde o error: ${pub.error || `HTTP ${pub.status}`}`);
      console.log("     Verifique custom domain en R2 → Settings → Public access.");
    }
  } else {
    console.log("\n--- Dominio público ---");
    console.log("  ℹ️  CF_R2_PUBLIC_BASE no configurado: avatares/CV usarán URLs prefirmadas.");
  }

  const ok =
    uploadsProbe.ok && (!templatesBucket || (await probeBucket(client, templatesBucket, "t")).ok);
  console.log(`\n${ok ? "✅ R2 operativo para la API." : "❌ Revise errores arriba."}`);
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
