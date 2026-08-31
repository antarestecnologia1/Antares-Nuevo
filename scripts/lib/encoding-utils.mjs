import { readdirSync, statSync } from 'node:fs';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Directorios que nunca se analizan ni se reparan. */
export const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  'test-results',
  'playwright-report',
  'tmp-docx',
  '_tmp_docx_inspect',
  '_tmp_docx2_inspect',
  '.turbo',
  '.cache',
]);

/** Solo se tocan archivos de texto conocidos: evita corromper binarios. */
export const TEXT_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.jsx',
  '.ts', '.tsx', '.mts', '.cts',
  '.json', '.jsonc',
  '.html', '.htm',
  '.css', '.scss', '.less',
  '.md', '.mdx',
  '.sql',
  '.txt',
  '.yml', '.yaml',
  '.svg',
  '.py',
  '.sh',
  '.xml',
  '.csv',
  '.toml',
  '.ini',
  '.env',
]);

/** Archivos individuales excluidos (generados o gigantes). */
export const SKIP_FILES = new Set([
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
]);

/** Recorre el repo y devuelve las rutas absolutas de los archivos de texto. */
export function* collectFiles(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* collectFiles(full);
      continue;
    }
    if (!entry.isFile()) continue;
    if (SKIP_FILES.has(entry.name)) continue;
    if (!TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) continue;
    try {
      // Evita cargar archivos enormes en memoria.
      if (statSync(full).size > 20 * 1024 * 1024) continue;
    } catch {
      continue;
    }
    yield full;
  }
}
