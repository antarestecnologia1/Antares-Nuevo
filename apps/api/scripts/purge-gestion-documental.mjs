/**
 * Elimina todos los archivos y metadatos de Gestión documental (DMS).
 *
 * Borra:
 *   - R2 (`CF_R2_UPLOADS_BUCKET`): prefijos `documentos_empresa/` y `documentos_rrhh/`
 *   - Postgres: `documentos_empresa`, `carpetas_documento_empresa`,
 *               `documentos_empleado`, `carpetas_documento_empleado` (si existen)
 *
 * NO toca: avatares, CVs de postulaciones, plantillas de contrato (`CF_R2_TEMPLATES_BUCKET`).
 *
 * Uso (desde la raíz del repo o apps/api, con apps/api/.env):
 *   node apps/api/scripts/purge-gestion-documental.mjs --dry-run
 *   node apps/api/scripts/purge-gestion-documental.mjs --confirm
 *
 * Opciones:
 *   --dry-run     Solo inventaria; no borra nada
 *   --confirm     Obligatorio para ejecutar el borrado real
 *   --r2-only     Solo objetos en R2
 *   --db-only     Solo filas en Postgres
 *   --company     Solo DMS corporativo (documentos_empresa + prefijo R2)
 *   --employee    Solo expediente RRHH (documentos_empleado + prefijo R2)
 *
 * Después de purgar, en el portal (admin con permiso de subida):
 *   await resetAndRecreateCompanyDocuments({ force: true })
 * Eso regenera estructura de carpetas + contratos/cartas oficiales + colillas pagadas.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client
} from "@aws-sdk/client-s3";
import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.join(__dirname, "..");
const ENV_PATH = path.join(API_ROOT, ".env");

const R2_PREFIXES = {
  company: "documentos_empresa/",
  employee: "documentos_rrhh/"
};

const DB_TABLES = {
  company: ["documentos_empresa", "carpetas_documento_empresa"],
  employee: ["documentos_empleado", "carpetas_documento_empleado"]
};

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const confirm = args.has("--confirm") || args.has("--yes");
const r2Only = args.has("--r2-only");
const dbOnly = args.has("--db-only");
const companyOnly = args.has("--company");
const employeeOnly = args.has("--employee");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Falta ${filePath} — configure CF_R2_* y DATABASE_URL`);
  }
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

function poolSsl(connectionString) {
  const u = String(connectionString || "").toLowerCase();
  return u.includes("supabase.co") || u.includes(".render.com") || u.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : false;
}

function selectedScopes() {
  if (companyOnly && !employeeOnly) return ["company"];
  if (employeeOnly && !companyOnly) return ["employee"];
  return ["company", "employee"];
}

function createR2Client() {
  const accountId = String(process.env.CF_R2_ACCOUNT_ID || "").trim();
  const accessKeyId = String(process.env.CF_R2_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = String(process.env.CF_R2_SECRET_ACCESS_KEY || "").trim();
  const bucket = String(process.env.CF_R2_UPLOADS_BUCKET || "").trim();
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "Faltan CF_R2_ACCOUNT_ID / CF_R2_ACCESS_KEY_ID / CF_R2_SECRET_ACCESS_KEY / CF_R2_UPLOADS_BUCKET"
    );
  }
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true
  });
  return { client, bucket };
}

async function listAllKeys(client, bucket, prefix) {
  const keys = [];
  let token;
  do {
    const out = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: token,
        MaxKeys: 1000
      })
    );
    for (const obj of out.Contents || []) {
      if (obj.Key) keys.push(obj.Key);
    }
    token = out.IsTruncated ? out.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

async function deleteKeys(client, bucket, keys) {
  let deleted = 0;
  const chunkSize = 1000;
  for (let i = 0; i < keys.length; i += chunkSize) {
    const chunk = keys.slice(i, i + chunkSize);
    const out = await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: chunk.map((Key) => ({ Key })),
          Quiet: true
        }
      })
    );
    const errors = out.Errors || [];
    if (errors.length) {
      const sample = errors
        .slice(0, 3)
        .map((e) => `${e.Key}: ${e.Code} ${e.Message}`)
        .join("; ");
      throw new Error(`R2 DeleteObjects falló (${errors.length}): ${sample}`);
    }
    deleted += chunk.length;
  }
  return deleted;
}

async function tableExists(pool, name) {
  const r = await pool.query(`SELECT to_regclass($1) IS NOT NULL AS ok`, [`public.${name}`]);
  return Boolean(r.rows[0]?.ok);
}

async function countRows(pool, table) {
  const r = await pool.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
  return Number(r.rows[0]?.n || 0);
}

async function purgeDb(pool, scopes) {
  const summary = [];
  for (const scope of scopes) {
    for (const table of DB_TABLES[scope]) {
      if (!(await tableExists(pool, table))) {
        summary.push({ table, exists: false, deleted: 0 });
        continue;
      }
      const before = await countRows(pool, table);
      if (dryRun) {
        summary.push({ table, exists: true, deleted: 0, wouldDelete: before });
        continue;
      }
      const r = await pool.query(`DELETE FROM ${table}`);
      summary.push({ table, exists: true, deleted: Number(r.rowCount || 0), before });
    }
  }
  return summary;
}

async function purgeR2(scopes) {
  const { client, bucket } = createR2Client();
  const summary = [];
  for (const scope of scopes) {
    const prefix = R2_PREFIXES[scope];
    const keys = await listAllKeys(client, bucket, prefix);
    if (dryRun) {
      summary.push({
        prefix,
        bucket,
        wouldDelete: keys.length,
        sample: keys.slice(0, 5)
      });
      continue;
    }
    const deleted = keys.length ? await deleteKeys(client, bucket, keys) : 0;
    summary.push({ prefix, bucket, deleted, listed: keys.length });
  }
  return summary;
}

async function main() {
  loadEnvFile(ENV_PATH);

  if (!dryRun && !confirm) {
    console.error(
      [
        "Este script borra archivos reales de Gestión documental.",
        "Ejecute primero con --dry-run para ver el inventario,",
        "luego con --confirm para borrar.",
        "",
        "  node apps/api/scripts/purge-gestion-documental.mjs --dry-run",
        "  node apps/api/scripts/purge-gestion-documental.mjs --confirm"
      ].join("\n")
    );
    process.exit(1);
  }

  if (r2Only && dbOnly) {
    throw new Error("Use solo uno de --r2-only o --db-only");
  }

  const scopes = selectedScopes();
  const doR2 = !dbOnly;
  const doDb = !r2Only;

  console.log("=== Purge Gestión documental ===");
  console.log(`Modo:     ${dryRun ? "DRY-RUN (sin borrar)" : "BORRADO REAL"}`);
  console.log(`Alcance:  ${scopes.join(", ")}`);
  console.log(`R2:       ${doR2 ? "sí" : "no"}`);
  console.log(`Postgres: ${doDb ? "sí" : "no"}`);
  console.log("");

  if (doR2) {
    console.log("--- Cloudflare R2 ---");
    const r2 = await purgeR2(scopes);
    for (const row of r2) {
      if (dryRun) {
        console.log(`  ${row.prefix} → ${row.wouldDelete} objeto(s) en ${row.bucket}`);
        if (row.sample?.length) {
          for (const k of row.sample) console.log(`    · ${k}`);
          if (row.wouldDelete > row.sample.length) console.log("    · …");
        }
      } else {
        console.log(`  ${row.prefix} → borrados ${row.deleted}/${row.listed}`);
      }
    }
    console.log("");
  }

  if (doDb) {
    const databaseUrl = String(process.env.DATABASE_URL || "").trim();
    if (!databaseUrl) throw new Error("Falta DATABASE_URL en apps/api/.env");
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: poolSsl(databaseUrl),
      max: 2
    });
    try {
      console.log("--- PostgreSQL ---");
      const db = await purgeDb(pool, scopes);
      for (const row of db) {
        if (!row.exists) {
          console.log(`  ${row.table} → (tabla no existe, omitida)`);
          continue;
        }
        if (dryRun) {
          console.log(`  ${row.table} → ${row.wouldDelete} fila(s)`);
        } else {
          console.log(`  ${row.table} → borradas ${row.deleted} fila(s)`);
        }
      }
    } finally {
      await pool.end();
    }
    console.log("");
  }

  if (dryRun) {
    console.log("Dry-run listo. Para borrar de verdad:");
    console.log("  node apps/api/scripts/purge-gestion-documental.mjs --confirm");
  } else {
    console.log("Purge completado.");
    console.log("");
    console.log("Siguiente paso (en el portal, consola del navegador, admin):");
    console.log("  await resetAndRecreateCompanyDocuments({ force: true })");
    console.log("También limpie caché local si hace falta:");
    console.log(
      "  localStorage.removeItem('antares_company_documents_v1');"
    );
    console.log(
      "  localStorage.removeItem('antares_company_document_folders_v1');"
    );
    console.log(
      "  localStorage.removeItem('antares_employee_documents_v1');"
    );
    console.log(
      "  localStorage.removeItem('antares_employee_document_folders_v1');"
    );
  }
}

main().catch((err) => {
  console.error("PURGE_FAILED:", err?.message || err);
  process.exit(1);
});
