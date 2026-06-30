import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml" };

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/_modal_harness.html";
    const fp = path.join(ROOT, p);
    const buf = await readFile(fp);
    res.writeHead(200, { "content-type": MIME[path.extname(fp)] || "application/octet-stream" });
    res.end(buf);
  } catch (e) {
    res.writeHead(404); res.end("not found: " + req.url);
  }
});
await new Promise((r) => server.listen(4199, r));

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1024, height: 720 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("http://127.0.0.1:4199/_modal_harness.html", { waitUntil: "networkidle" });

for (const theme of ["light", "dark"]) {
  await page.evaluate((t) => document.body.setAttribute("data-theme", t), theme);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(ROOT, `_modal_${theme}.png`) });
  // also scroll modal content to bottom to view footer when scrolled
  await page.evaluate(() => { const c = document.getElementById("crud-modal-content"); if (c) c.scrollTop = c.scrollHeight; });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(ROOT, `_modal_${theme}_scrolled.png`) });
}

const geo = await page.evaluate(() => {
  const pick = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { sel, left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), pad: cs.padding, margin: cs.margin, overflowX: cs.overflowX, position: cs.position }; };
  return [
    pick(".modal-card.modal-card-edit"),
    pick("#crud-modal-content"),
    pick("#crud-form"),
    pick(".module-panel-actions--footer.modal-edit-actions"),
    pick(".module-panel-actions__bar"),
    pick(".module-panel-btn--cancel"),
    pick(".module-panel-btn--save")
  ];
});
console.log(JSON.stringify(geo, null, 2));

await browser.close();
await new Promise((r) => server.close(r));
console.log("done");
