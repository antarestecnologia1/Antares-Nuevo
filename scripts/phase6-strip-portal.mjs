/**
 * Elimina de portal-runtime.js los bloques movidos a auth.js / dominio.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const fp = path.join(root, "modules/core/portal-runtime.js");
const lines = fs.readFileSync(fp, "utf8").split(/\r?\n/);

const ranges = [
  [10171, 10177],
  [8313, 9014],
  [7999, 8298],
  [7827, 7997],
  [7791, 7794],
  [7756, 7503],
  [7450, 6651],
  [4417, 4399]
];

const drop = new Set();
for (const [a, b] of ranges) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  for (let i = lo; i <= hi; i++) drop.add(i);
}

const out = lines.filter((_line, idx) => !drop.has(idx + 1));
fs.writeFileSync(fp, out.join("\n"));
console.log("Removed", drop.size, "lines from portal-runtime.js");
