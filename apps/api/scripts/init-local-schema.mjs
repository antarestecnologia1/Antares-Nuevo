/**
 * Alias local: CREATE 01–08 (sin Supabase). Ver apply-schema.mjs para producción (--supabase).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "apply-schema.mjs");
const r = spawnSync(process.execPath, [script], { stdio: "inherit" });
process.exit(r.status ?? 1);
