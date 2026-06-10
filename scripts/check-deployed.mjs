import { chromium } from 'playwright';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const url = process.argv[2] || 'https://antarestecnologia1.github.io/Antares-Nuevo/';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message.slice(0, 300)}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`[console] ${m.text().slice(0, 300)}`); });
page.on('requestfailed', (r) => errors.push(`[reqfail] ${r.url().slice(0, 160)} -> ${r.failure()?.errorText}`));

await page.goto(url, { waitUntil: 'load', timeout: 90000 }).catch((e) => errors.push(`[goto] ${e.message}`));
await page.waitForTimeout(4000);
await page.screenshot({ path: path.join(root, 'test-results', 'deployed.png') });
console.log(errors.length ? `ERRORES (${errors.length}):\n${errors.slice(0, 25).join('\n')}` : 'Sin errores');
await browser.close();
