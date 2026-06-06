import fs from "node:fs";

function exportNames(file) {
  const t = fs.readFileSync(file, "utf8");
  const names = new Set();
  const patterns = [
    /^export const (\w+)/gm,
    /^export let (\w+)/gm,
    /^export function (\w+)/gm,
    /^export async function (\w+)/gm,
    /^export class (\w+)/gm
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(t))) names.add(m[1]);
  }
  for (const m of t.matchAll(/^export \{([^}]+)\}/gm)) {
    m[1].split(",").forEach((p) => {
      const parts = p.trim().split(/\s+as\s+/);
      const n = (parts[1] || parts[0]).trim();
      if (n) names.add(n);
    });
  }
  return [...names].sort();
}

const files = [
  "modules/core/config.js",
  "modules/core/auth.js",
  "modules/core/store.js",
  "modules/core/utils.js",
  "modules/ui/modals.js"
];
const all = new Set();
for (const f of files) {
  for (const n of exportNames(f)) all.add(n);
}
const lines = [
  "/** Imports ES: el runtime ya no depende del orden defer vs módulos en index.html. */",
  'import * as __pr from "./portal-runtime-env.mjs";',
  "",
  "// Enlaces léxicos (módulo estricto; `IC` sigue viniendo del script `portal-icons.js`).",
  ...[...all].map((n) => `const ${n} = __pr.${n};`),
  "const IC = globalThis.IC;",
  ""
];
const header = lines.join("\n");
const rtPath = "modules/core/portal-runtime.js";
const body = fs.readFileSync(rtPath, "utf8");
const marker = 'import * as __pr from "./portal-runtime-env.mjs";';
if (body.includes(marker)) {
  console.log("skip: already has module header");
  process.exit(0);
}
fs.writeFileSync(rtPath, header + body, "utf8");
console.log("prepended", lines.length, "lines to", rtPath);
