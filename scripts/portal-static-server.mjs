/**
 * Servidor estático mínimo para E2E del portal legacy (index.html + assets).
 * Uso: node scripts/portal-static-server.mjs
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pdf": "application/pdf"
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const rel = decoded.replace(/^\/+/, "") || "index.html";
  const abs = path.normalize(path.join(ROOT, rel));
  if (!abs.startsWith(ROOT)) return null;
  return abs;
}

const server = createServer(async (req, res) => {
  try {
    const abs = safePath(req.url || "/");
    if (!abs) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    let filePath = abs;
    if (existsSync(filePath) && !filePath.endsWith(".html")) {
      /* file */
    } else if (existsSync(`${filePath}.html`)) {
      filePath = `${filePath}.html`;
    } else if (!path.extname(filePath) && existsSync(path.join(filePath, "index.html"))) {
      filePath = path.join(filePath, "index.html");
    } else if (!existsSync(filePath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const body = await readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(body);
  } catch (err) {
    res.writeHead(500);
    res.end(String(err?.message || err));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[portal-static-server] http://${HOST}:${PORT}/`);
});
