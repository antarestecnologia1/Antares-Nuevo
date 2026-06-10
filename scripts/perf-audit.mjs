import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(import.meta.dirname, '..');
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4',
  '.json': 'application/json', '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(8137, r));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

// red 4G típica: 9 Mbps bajada, 60 ms latencia
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.emulateNetworkConditions', {
  offline: false, latency: 60,
  downloadThroughput: (9 * 1024 * 1024) / 8,
  uploadThroughput: (3 * 1024 * 1024) / 8,
});

const reqs = [];
page.on('response', async (resp) => {
  try {
    const req = resp.request();
    let size = 0;
    try { size = (await resp.body()).length; } catch { size = 0; }
    reqs.push({ url: req.url(), type: req.resourceType(), size });
  } catch {}
});

await page.addInitScript(() => {
  window.__heroVisibleAt = null;
  const poll = () => {
    const h1 = document.querySelector('#hero h1, .hero-copy h1, .hero h1');
    if (h1) {
      const el = h1.closest('[data-reveal]') || h1;
      if (parseFloat(getComputedStyle(el).opacity) > 0.9) {
        window.__heroVisibleAt = performance.now();
        return;
      }
    }
    requestAnimationFrame(poll);
  };
  requestAnimationFrame(poll);
});

const t0 = Date.now();
await page.goto('http://localhost:8137/', { waitUntil: 'load', timeout: 120000 });
const loadMs = Date.now() - t0;
await page.waitForTimeout(2500);

const nav = await page.evaluate(() => {
  const n = performance.getEntriesByType('navigation')[0];
  const fcp = performance.getEntriesByName('first-contentful-paint')[0];
  return {
    domContentLoaded: Math.round(n.domContentLoadedEventEnd),
    load: Math.round(n.loadEventEnd),
    fcp: fcp ? Math.round(fcp.startTime) : null,
  };
});

const byType = {};
for (const r of reqs) {
  byType[r.type] ??= { n: 0, kb: 0 };
  byType[r.type].n++;
  byType[r.type].kb += r.size / 1024;
}

const heroVisible = await page.evaluate(() => Math.round(window.__heroVisibleAt ?? -1));
console.log(`FCP: ${nav.fcp} ms | Hero visible: ${heroVisible} ms | DOMContentLoaded: ${nav.domContentLoaded} ms | load: ${nav.load} ms (goto: ${loadMs} ms)`);
console.log(`Total requests: ${reqs.length} | Total: ${(reqs.reduce((a, r) => a + r.size, 0) / 1024 / 1024).toFixed(2)} MB`);
console.log('\nPor tipo:');
for (const [t, v] of Object.entries(byType).sort((a, b) => b[1].kb - a[1].kb)) {
  console.log(`  ${t.padEnd(12)} ${String(v.n).padStart(3)} reqs  ${v.kb.toFixed(0).padStart(7)} KB`);
}
console.log('\nTop 12 recursos:');
for (const r of [...reqs].sort((a, b) => b.size - a.size).slice(0, 12)) {
  console.log(`  ${(r.size / 1024).toFixed(0).padStart(6)} KB  ${r.url.replace('http://localhost:8137', '')}`);
}

await browser.close();
server.close();
