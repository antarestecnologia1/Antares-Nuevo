#!/usr/bin/env node
/**
 * Scanner de codificacion para todo el repositorio.
 *
 * Detecta, leyendo BYTES (no texto), los tres danos tipicos de tildes:
 *
 *  1. NOT_UTF8   -> el archivo no es UTF-8 valido (bytes latin1/cp1252 crudos).
 *                   Sintoma: la tilde se ve como "?" o rompe el parser.
 *  2. MOJIBAKE   -> es UTF-8 valido, pero el texto contiene la doble
 *                   codificacion clasica ("Ã¡", "Ã©", "â€œ"...).
 *  3. LOST       -> contiene U+FFFD; el caracter original ya se perdio y
 *                   NO se puede recuperar automaticamente.
 *  4. BOM        -> UTF-8 con BOM, que rompe algunos parsers/servidores.
 *
 * encoding-tool:allow-mojibake (los ejemplos de arriba son a proposito)
 *
 * Uso:
 *   node scripts/scan-encoding.mjs              # reporte legible
 *   node scripts/scan-encoding.mjs --json       # salida JSON
 *   node scripts/scan-encoding.mjs --strict     # exit 1 si hay hallazgos
 */

import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { collectFiles, ROOT } from './lib/encoding-utils.mjs';
import { classify } from './lib/encoding-core.mjs';

const args = new Set(process.argv.slice(2));
const asJson = args.has('--json');
const strict = args.has('--strict');

const findings = [];

for (const file of collectFiles(ROOT)) {
  let buf;
  try {
    buf = readFileSync(file);
  } catch {
    continue;
  }
  const result = classify(buf);
  if (result.issues.length === 0) continue;
  findings.push({
    file: relative(ROOT, file).replace(/\\/g, '/'),
    issues: result.issues,
    samples: result.samples,
  });
}

if (asJson) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  const byIssue = new Map();
  for (const f of findings) {
    for (const i of f.issues) {
      if (!byIssue.has(i)) byIssue.set(i, []);
      byIssue.get(i).push(f);
    }
  }

  if (findings.length === 0) {
    console.log('OK: no se detectaron problemas de codificacion.');
  } else {
    for (const [issue, files] of [...byIssue].sort()) {
      console.log(`\n=== ${issue} (${files.length} archivo(s)) ===`);
      for (const f of files) {
        console.log(`  ${f.file}`);
        for (const s of f.samples.slice(0, 3)) {
          console.log(`      L${s.line}: ${s.text}`);
        }
      }
    }
    console.log(`\nTotal: ${findings.length} archivo(s) con hallazgos.`);
  }
}

// INTENTIONAL no es un fallo: el archivo declara su pragma a proposito.
const failures = findings.filter(
  (f) => !(f.issues.length === 1 && f.issues[0] === 'INTENTIONAL'),
);

if (strict && failures.length > 0) process.exit(1);
