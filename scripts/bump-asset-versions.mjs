#!/usr/bin/env node
/**
 * Versiona los recursos de index.html y app.js según el CONTENIDO del archivo
 * (?v=<hash de 10 caracteres>), en lugar de editar a mano cientos de «?v=…».
 *
 *   node scripts/bump-asset-versions.mjs            → reescribe las versiones que cambiaron
 *   node scripts/bump-asset-versions.mjs --check    → no escribe; sale con 1 si alguna está desactualizada (CI)
 *
 * Solo toca referencias locales con «?v=» (./ruta/archivo.ext?v=…). Si el archivo no existe lo reporta y sigue.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const targets = ["index.html", "app.js"].map((f) => resolve(root, f)).filter(existsSync);
const REF = /((?:\.\/|\/)?[\w./@-]+\.(?:js|mjs|css|svg|png|jpg|jpeg|webp|mp4|json))\?v=([\w.-]+)/g;

const originals = new Map(targets.map((t) => [t, readFileSync(t, "utf8")]));
const working = new Map(originals);
// app.js se versiona dentro de index.html y, a su vez, referencia otros módulos: se repite hasta estabilizar.
const hashOf = (file) => createHash("sha1").update(working.has(file) ? working.get(file) : readFileSync(file)).digest("hex").slice(0, 10);
const missingRefs = new Set();

for (let pass = 0; pass < 5; pass += 1) {
  let changed = false;
  for (const target of [...targets].reverse()) {
    const base = dirname(target);
    const source = working.get(target);
    const next = source.replace(REF, (whole, rel, current) => {
      const file = resolve(rel.startsWith("/") ? root : base, rel.replace(/^\//, ""));
      if (!existsSync(file)) {
        missingRefs.add(rel);
        return whole;
      }
      const version = hashOf(file);
      return version === current ? whole : `${rel}?v=${version}`;
    });
    if (next !== source) {
      working.set(target, next);
      changed = true;
    }
  }
  if (!changed) break;
}

const staleFiles = targets.filter((t) => working.get(t) !== originals.get(t));
const stale = staleFiles.length;
const missing = missingRefs.size;
missingRefs.forEach((rel) => console.warn(`  · no existe: ${rel}`));
if (!check) staleFiles.forEach((t) => writeFileSync(t, working.get(t)));

if (check) {
  if (stale || missing) {
    console.error(`Archivos con versiones desactualizadas: ${stale}; referencias a archivos inexistentes: ${missing}. Ejecute: node scripts/bump-asset-versions.mjs`);
    process.exit(1);
  }
  console.log("OK versiones de recursos al día");
} else {
  console.log(`Archivos actualizados: ${stale}; referencias a archivos inexistentes: ${missing}`);
  if (missing) process.exitCode = 1;
}
