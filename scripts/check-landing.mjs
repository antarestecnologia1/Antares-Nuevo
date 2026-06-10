import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4',
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

const browser = await chromium.launch();
const errors = [];

// 1) Solo CSS crítico (styles.css bloqueado) — simula los primeros instantes en red lenta
const page1 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page1.route('**/styles.css*', (r) => r.abort());
page1.on('pageerror', (e) => errors.push(`[solo-critico] ${e.message}`));
await page1.goto('http://localhost:8137/', { waitUntil: 'load', timeout: 60000 }).catch(() => {});
await page1.waitForTimeout(1500);
await page1.screenshot({ path: path.join(root, 'test-results', 'landing-critical-only.png') });
await page1.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
await page1.waitForTimeout(800);
await page1.screenshot({ path: path.join(root, 'test-results', 'landing-critical-mid.png') });
await page1.close();

// 2) Carga normal completa
const page2 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page2.on('pageerror', (e) => errors.push(`[completo] ${e.message}`));
page2.on('console', (m) => { if (m.type() === 'error') errors.push(`[console] ${m.text().slice(0, 200)}`); });
await page2.goto('http://localhost:8137/', { waitUntil: 'networkidle', timeout: 60000 });
await page2.waitForTimeout(1500);
await page2.screenshot({ path: path.join(root, 'test-results', 'landing-full.png') });
await page2.click('#open-auth').catch(() => {});
await page2.waitForTimeout(800);
await page2.screenshot({ path: path.join(root, 'test-results', 'landing-auth-modal.png') });
await page2.close();

await browser.close();
server.close();
console.log(errors.length ? `ERRORES:\n${errors.join('\n')}` : 'Sin errores JS');
