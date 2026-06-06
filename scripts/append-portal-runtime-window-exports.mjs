import fs from "node:fs";

const path = "modules/core/portal-runtime.js";
let t = fs.readFileSync(path, "utf8");
const marker = "/** Expone API del runtime a scripts defer";
if (t.includes(marker)) {
  console.log("skip: window expose block already present");
  process.exit(0);
}

const names = new Set();
for (const re of [/^function (\w+)\s*\(/gm, /^async function (\w+)\s*\(/gm]) {
  let m;
  while ((m = re.exec(t))) names.add(m[1]);
}

const sorted = [...names].sort();
const lines = [
  "",
  marker + " (antes: script clásico enlazaba `function` al `window`). */",
  "Object.assign(window, {"
];
for (const n of sorted) {
  lines.push(`  ${n},`);
}
lines.push("});", "");
fs.appendFileSync(path, lines.join("\n"), "utf8");
console.log("appended window exports:", sorted.length);
