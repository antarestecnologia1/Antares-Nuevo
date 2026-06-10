// Genera styles.landing.css: el subconjunto de styles.css que la landing pública
// necesita para el primer pintado. Se obtiene con CSS coverage de Chromium mientras
// se ejercita la landing (scroll, tema oscuro, móvil, menú, modal de login).
// El styles.css completo se sigue cargando asíncrono y corrige cualquier omisión.
//
// Uso: node scripts/split-landing-css.mjs   (regenerar cuando cambie styles.css)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const cssPath = path.join(root, 'styles.css');
const outPath = path.join(root, 'styles.landing.css');

// ───────────────────────── parser mínimo de bloques CSS ─────────────────────────

function parseBlocks(text, base = 0) {
  const nodes = [];
  let i = 0;
  const n = text.length;
  while (i < n) {
    // saltar espacios y comentarios
    while (i < n) {
      if (/\s/.test(text[i])) { i++; continue; }
      if (text.startsWith('/*', i)) {
        const end = text.indexOf('*/', i + 2);
        i = end === -1 ? n : end + 2;
        continue;
      }
      break;
    }
    if (i >= n) break;
    const start = i;
    // leer prelude hasta '{' o ';'
    let depth = 0; let inStr = null; let preludeEnd = -1; let opener = -1;
    for (let j = i; j < n; j++) {
      const c = text[j];
      if (inStr) {
        if (c === '\\') j++;
        else if (c === inStr) inStr = null;
        continue;
      }
      if (c === '"' || c === "'") { inStr = c; continue; }
      if (text.startsWith('/*', j)) { j = text.indexOf('*/', j + 2) + 1; continue; }
      if (c === '{') { opener = j; break; }
      if (c === ';') { preludeEnd = j; break; }
    }
    if (opener === -1 && preludeEnd !== -1) {
      // at-rule de una línea (@import, @charset)
      nodes.push({ type: 'stmt', start: base + start, end: base + preludeEnd + 1, prelude: text.slice(start, preludeEnd).trim() });
      i = preludeEnd + 1;
      continue;
    }
    if (opener === -1) break;
    // encontrar cierre del bloque
    depth = 1; inStr = null; let close = -1;
    for (let j = opener + 1; j < n; j++) {
      const c = text[j];
      if (inStr) {
        if (c === '\\') j++;
        else if (c === inStr) inStr = null;
        continue;
      }
      if (c === '"' || c === "'") { inStr = c; continue; }
      if (text.startsWith('/*', j)) { j = text.indexOf('*/', j + 2) + 1; continue; }
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { close = j; break; } }
    }
    if (close === -1) close = n - 1;
    const prelude = text.slice(start, opener).trim();
    const node = { type: 'rule', start: base + start, end: base + close + 1, prelude };
    if (/^@(media|supports|layer)\b/i.test(prelude)) {
      node.type = 'group';
      node.children = parseBlocks(text.slice(opener + 1, close), base + opener + 1);
    }
    nodes.push(node);
    i = close + 1;
  }
  return nodes;
}

// ───────────────────────── coverage ─────────────────────────

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4',
  '.json': 'application/json', '.webp': 'image/webp',
};
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(8137, r));

async function exercisePage(page) {
  await page.goto('http://localhost:8137/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);
  // scroll completo para disparar reveals y estilos de cada sección
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
  // tema oscuro y de vuelta
  await page.click('[data-theme-option="dark"]').catch(() => {});
  await page.waitForTimeout(500);
  await page.click('[data-theme-option="light"]').catch(() => {});
  await page.waitForTimeout(300);
  // modal de login
  await page.click('#open-auth').catch(() => {});
  await page.waitForTimeout(600);
  await page.click('#close-auth').catch(() => {});
  await page.waitForTimeout(300);
}

const browser = await chromium.launch();
const usedRanges = [];

for (const viewport of [{ width: 1366, height: 800 }, { width: 390, height: 844 }, { width: 768, height: 1024 }]) {
  const page = await browser.newPage({ viewport });
  await page.coverage.startCSSCoverage({ resetOnNavigation: false });
  await exercisePage(page);
  if (viewport.width < 900) {
    await page.click('#hamburger-btn').catch(() => {});
    await page.waitForTimeout(500);
  }
  const coverage = await page.coverage.stopCSSCoverage();
  for (const entry of coverage) {
    if (!entry.url.includes('styles.css')) continue;
    usedRanges.push(...entry.ranges.map((r) => ({ start: r.start, end: r.end })));
  }
  await page.close();
}
await browser.close();
server.close();

usedRanges.sort((a, b) => a.start - b.start);

function overlapsUsed(start, end) {
  for (const r of usedRanges) {
    if (r.start >= end) break;
    if (r.end > start) return true;
  }
  return false;
}

// ───────────────────────── ensamblar subset ─────────────────────────

const css = fs.readFileSync(cssPath, 'utf8');
const tree = parseBlocks(css);

const ALWAYS_KEEP = /^(:root|@font-face|@keyframes|-webkit-keyframes|@import|@charset|@property|html|body)\b|^@-webkit-keyframes/i;

function emit(nodes, out) {
  for (const node of nodes) {
    const text = css.slice(node.start, node.end);
    if (node.type === 'stmt') { out.push(text); continue; }
    const keep = ALWAYS_KEEP.test(node.prelude) || overlapsUsed(node.start, node.end);
    if (node.type === 'group') {
      const inner = [];
      // dentro de un grupo usado, decidir hijo por hijo
      emit(node.children, inner);
      if (inner.length) out.push(`${node.prelude} {\n${inner.join('\n')}\n}`);
      continue;
    }
    if (keep) out.push(text);
  }
}

const parts = [
  `/* GENERADO por scripts/split-landing-css.mjs — NO editar a mano.
   Subconjunto crítico de styles.css para el primer pintado de la landing.
   styles.css completo se carga asíncrono después y manda en la cascada.
   Regenerar con: node scripts/split-landing-css.mjs */`,
];
emit(tree, parts);
const result = parts.join('\n\n') + '\n';
fs.writeFileSync(outPath, result);

const pct = ((result.length / css.length) * 100).toFixed(1);
console.log(`styles.landing.css: ${(result.length / 1024).toFixed(0)} KB (${pct}% de styles.css, ${(css.length / 1024).toFixed(0)} KB)`);
