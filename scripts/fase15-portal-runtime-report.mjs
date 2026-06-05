/**
 * Informe Fase 15: métricas de modules/** y verificación portal-runtime.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const modulesDir = path.join(root, "modules");
const portalRt = path.join(root, "modules", "core", "portal-runtime.js");

function walkJs(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith(".")) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkJs(p, acc);
    else if (p.endsWith(".js")) acc.push(p);
  }
  return acc;
}

const fnLineRe = /^(export\s+)?(async\s+)?function\s+\w+/gm;

function analyzeFile(abs) {
  const txt = fs.readFileSync(abs, "utf8");
  const lines = txt.split(/\r?\n/).length;
  const fnDecl = (txt.match(/^function\s/gm) || []).length;
  const asyncFnDecl = (txt.match(/^async function\s/gm) || []).length;
  const topFn = (txt.match(fnLineRe) || []).length;
  const capsConst = (txt.match(/^const [A-Z_]{3,}\b/gm) || []).length;
  const deps = new Set();
  const fromRe = /\bfrom\s+["']([^"']+)["']/g;
  let m;
  while ((m = fromRe.exec(txt))) deps.add(m[1]);
  return { lines, fnDecl, asyncFnDecl, topFn, capsConst, deps: [...deps].sort() };
}

// --- Verificación portal-runtime (criterios usuario) ---
const pr = fs.readFileSync(portalRt, "utf8");
const prLines = pr.split(/\r?\n/);
const count = (re) => (pr.match(re) || []).length;
const v = {
  "^function ": count(/^function /gm),
  "^async function ": count(/^async function /gm),
  "^const [A-Z_]{3,}": count(/^const [A-Z_]{3,}/gm),
  "window hooks": count(/window\.AntaresPortalRuntime|window\.AppLegacyViews|window\.__portalRefresh/g)
};

const files = walkJs(modulesDir).sort();
const rows = [];
let sumLines = 0;
let sumTopFn = 0;
for (const abs of files) {
  const rel = path.relative(root, abs).replace(/\\/g, "/");
  const a = analyzeFile(abs);
  sumLines += a.lines;
  sumTopFn += a.topFn;
  rows.push({ rel, ...a });
}
rows.sort((a, b) => b.lines - a.lines);

const depEdges = [];
for (const r of rows) {
  for (const d of r.deps) {
    if (!d.startsWith(".") && !d.startsWith("/")) continue;
    depEdges.push(`${r.rel} -> ${d}`);
  }
}
depEdges.sort();

console.log("=== VERIFICACIÓN portal-runtime.js (objetivo: 0 en todo) ===");
console.log(JSON.stringify(v, null, 2));
console.log("\n=== RESUMEN modules/**/*.js ===");
console.log("archivos:", files.length, "líneas totales:", sumLines, "decl. función (export )?async?function:", sumTopFn);
console.log("\n=== Top 25 por líneas (líneas | funciones | archivo) ===");
for (const r of rows.slice(0, 25)) {
  console.log(`${r.lines}\t${r.topFn}\t${r.rel}`);
}

console.log("\n=== Dependencias internas (import … from \"./…\" o \"../…\") — aristas únicas, primeras 120 ===");
const uniq = [...new Set(depEdges)];
for (const e of uniq.slice(0, 120)) console.log(e);
if (uniq.length > 120) console.log(`… y ${uniq.length - 120} aristas más`);
