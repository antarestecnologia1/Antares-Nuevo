import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 4175;

async function startServer() {
  const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8"
  };
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const rel = decodeURIComponent(String(req.url || "/").split("?")[0]).replace(/^\/+/, "") || "index.html";
      const filePath = path.normalize(path.join(ROOT, rel));
      if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      try {
        const body = await readFile(filePath);
        res.writeHead(200, { "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    });
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

const server = await startServer();
const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForSelector("#portal-app", { timeout: 15000 });
await page.evaluate(() => {
  window.location.hash = "#portal/transport-vehicles";
  window.dispatchEvent(new HashChangeEvent("hashchange"));
});
await page.waitForTimeout(1000);

await page.evaluate(() => {
  document.querySelector("[data-action='hr-workspace-tab'][data-module='transport-vehicles'][data-tab='data']")?.click();
});
await page.waitForTimeout(500);
await page.evaluate(() => {
  document.querySelector("[data-action='edit-vehicle'][data-id='veh-1']")?.click();
});
await page.waitForSelector("#crud-form", { timeout: 5000 });

const vehicleVal = await page.evaluate(() => {
  const form = document.getElementById("crud-form");
  const V = window.AntaresValidation;
  const res = V?.validateDomForm?.(form);
  const brand = form.querySelector("[name='brand']");
  brand.value = "Chevrolet QA";
  brand.dispatchEvent(new Event("input", { bubbles: true }));
  const res2 = V?.validateDomForm?.(form);
  return {
    before: res,
    after: res2,
    dates: [...form.querySelectorAll("[data-portal-date-iso]")].map((el) => ({
      name: el.name,
      value: el.value
    }))
  };
});

console.log(JSON.stringify(vehicleVal, null, 2));

await browser.close();
server.close();
