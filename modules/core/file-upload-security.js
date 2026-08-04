/**
 * Validación de archivos en el cliente (UX). El servidor vuelve a validar
 * (extensión, allowlist, magic bytes) — nunca confiar solo en el navegador.
 */

/** @typedef {"image"|"document"|"cv"} UploadPurpose */

const BLOCKED_EXTENSIONS = new Set([
  "exe",
  "bat",
  "cmd",
  "com",
  "scr",
  "msi",
  "dll",
  "vbs",
  "vbe",
  "js",
  "jse",
  "mjs",
  "cjs",
  "ws",
  "wsf",
  "wsc",
  "wsh",
  "ps1",
  "psm1",
  "psd1",
  "jar",
  "app",
  "deb",
  "rpm",
  "sh",
  "bash",
  "zsh",
  "cpl",
  "inf",
  "reg",
  "hta",
  "pif",
  "lnk",
  "url",
  "iso",
  "img",
  "dmg",
  "apk",
  "ipa",
  "wasm",
  "html",
  "htm",
  "shtml",
  "xhtml",
  "svg",
  "svgz",
  "php",
  "phtml",
  "asp",
  "aspx",
  "jsp",
  "cgi",
  "py",
  "rb",
  "pl",
  "action",
  "msc",
  "msp",
  "sys",
  "drv",
  "scf",
  "vb",
  "vbscript"
]);

const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

const CV_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ...IMAGE_MIME
]);
const CV_EXT = new Set(["pdf", "doc", "docx", ...IMAGE_EXT]);

const DOCUMENT_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/csv",
  "application/zip",
  "application/x-zip-compressed",
  ...IMAGE_MIME
]);
const DOCUMENT_EXT = new Set([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "odt",
  "ods",
  "odp",
  "txt",
  "csv",
  "md",
  "zip",
  ...IMAGE_EXT
]);

const EXT_TO_MIME = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
  txt: "text/plain",
  csv: "text/csv",
  md: "text/markdown",
  zip: "application/zip",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif"
};

export const SAFE_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";
export const SAFE_CV_ACCEPT = ".pdf,.doc,.docx,image/jpeg,image/png,image/webp,image/gif";
export const SAFE_DOCUMENT_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.txt,.csv,.md,.zip,image/jpeg,image/png,image/webp,image/gif";

export function normalizeUploadMime(raw) {
  const mime = String(raw || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (mime === "image/jpg" || mime === "image/pjpeg") return "image/jpeg";
  if (mime === "application/x-zip-compressed") return "application/zip";
  if (mime === "application/csv") return "text/csv";
  return mime || "application/octet-stream";
}

export function extFromFileName(fileName) {
  const safe = String(fileName || "").trim();
  const idx = safe.lastIndexOf(".");
  if (idx <= 0 || idx >= safe.length - 1) return "";
  return safe.slice(idx + 1).toLowerCase().slice(0, 16);
}

function allowlistsFor(purpose) {
  if (purpose === "image") return { mimes: IMAGE_MIME, exts: IMAGE_EXT };
  if (purpose === "cv") return { mimes: CV_MIME, exts: CV_EXT };
  return { mimes: DOCUMENT_MIME, exts: DOCUMENT_EXT };
}

function purposeLabel(purpose) {
  if (purpose === "image") return "Solo se permiten imágenes JPEG, PNG, WebP o GIF.";
  if (purpose === "cv") {
    return "Formato no permitido. Use PDF, Word (doc/docx) o imagen (jpeg, png, webp o gif).";
  }
  return "Tipo no permitido. Use PDF, Office, texto, ZIP o imagen (JPEG/PNG/WebP/GIF).";
}

function bytesMatch(view, offset, expected) {
  for (let i = 0; i < expected.length; i += 1) {
    if (view[offset + i] !== expected[i]) return false;
  }
  return true;
}

function asciiAt(view, start, len) {
  let s = "";
  for (let i = 0; i < len; i += 1) s += String.fromCharCode(view[start + i] || 0);
  return s;
}

function looksLikeExecutable(view) {
  if (view.length < 2) return false;
  if (bytesMatch(view, 0, [0x4d, 0x5a])) return true;
  if (bytesMatch(view, 0, [0x7f, 0x45, 0x4c, 0x46])) return true;
  if (
    bytesMatch(view, 0, [0xfe, 0xed, 0xfa, 0xce]) ||
    bytesMatch(view, 0, [0xfe, 0xed, 0xfa, 0xcf]) ||
    bytesMatch(view, 0, [0xce, 0xfa, 0xed, 0xfe]) ||
    bytesMatch(view, 0, [0xcf, 0xfa, 0xed, 0xfe])
  ) {
    return true;
  }
  if (bytesMatch(view, 0, [0xca, 0xfe, 0xba, 0xbe])) return true;
  return false;
}

function looksLikeHtmlOrSvg(view) {
  const n = Math.min(view.length, 512);
  let head = "";
  for (let i = 0; i < n; i += 1) head += String.fromCharCode(view[i]);
  const trimmed = head.replace(/^\uFEFF/, "").trimStart().toLowerCase();
  if (trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html")) return true;
  if (trimmed.startsWith("<svg") || trimmed.includes("<svg")) return true;
  if (trimmed.startsWith("<?xml") && (trimmed.includes("<svg") || trimmed.includes("<html"))) return true;
  if (/<script[\s>]/i.test(trimmed)) return true;
  return false;
}

function isZipContainer(view) {
  return (
    bytesMatch(view, 0, [0x50, 0x4b, 0x03, 0x04]) ||
    bytesMatch(view, 0, [0x50, 0x4b, 0x05, 0x06]) ||
    bytesMatch(view, 0, [0x50, 0x4b, 0x07, 0x08])
  );
}

function isOleCompound(view) {
  return bytesMatch(view, 0, [0xd0, 0xcf, 0x11, 0xe0]);
}

function isMostlyText(view) {
  const n = Math.min(view.length, 4096);
  if (!n) return false;
  let suspicious = 0;
  for (let i = 0; i < n; i += 1) {
    const c = view[i];
    const ok = c === 0x09 || c === 0x0a || c === 0x0d || (c >= 0x20 && c <= 0x7e) || c >= 0x80;
    if (!ok) suspicious += 1;
  }
  return suspicious / n < 0.05;
}

function magicMatchesMime(view, mime) {
  if (mime === "application/pdf") return asciiAt(view, 0, 4) === "%PDF";
  if (
    mime === "application/msword" ||
    mime === "application/vnd.ms-excel" ||
    mime === "application/vnd.ms-powerpoint"
  ) {
    return isOleCompound(view);
  }
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mime === "application/vnd.oasis.opendocument.text" ||
    mime === "application/vnd.oasis.opendocument.spreadsheet" ||
    mime === "application/vnd.oasis.opendocument.presentation" ||
    mime === "application/zip"
  ) {
    return isZipContainer(view);
  }
  if (mime === "image/jpeg") return bytesMatch(view, 0, [0xff, 0xd8, 0xff]);
  if (mime === "image/png") return bytesMatch(view, 0, [0x89, 0x50, 0x4e, 0x47]);
  if (mime === "image/gif") {
    const g = asciiAt(view, 0, 6);
    return g === "GIF87a" || g === "GIF89a";
  }
  if (mime === "image/webp") {
    return asciiAt(view, 0, 4) === "RIFF" && asciiAt(view, 8, 4) === "WEBP";
  }
  if (mime === "text/plain" || mime === "text/csv" || mime === "text/markdown") {
    return isMostlyText(view) && !looksLikeHtmlOrSvg(view) && !looksLikeExecutable(view);
  }
  return false;
}

function resolveMime(fileName, declaredMime, purpose) {
  const { mimes, exts } = allowlistsFor(purpose);
  let mime = normalizeUploadMime(declaredMime);
  const ext = extFromFileName(fileName);
  if (ext && BLOCKED_EXTENSIONS.has(ext)) {
    return { ok: false, message: `Extensión .${ext} no permitida por seguridad.` };
  }
  const loose = mime === "application/octet-stream" || mime === "binary/octet-stream" || !mime;
  if ((!mimes.has(mime) || loose) && ext && EXT_TO_MIME[ext] && exts.has(ext)) {
    mime = EXT_TO_MIME[ext];
  }
  if (!mimes.has(mime)) {
    return { ok: false, message: purposeLabel(purpose) };
  }
  if (ext && !exts.has(ext)) {
    return { ok: false, message: purposeLabel(purpose) };
  }
  return { ok: true, mime, ext };
}

async function readFileHead(file, maxBytes = 512) {
  const blob = file.slice(0, maxBytes);
  const buf = await blob.arrayBuffer();
  return new Uint8Array(buf);
}

/**
 * Valida un `File`/`Blob` del navegador. Devuelve `{ ok, mime, message }`.
 * @param {File|Blob} file
 * @param {UploadPurpose} purpose
 */
export async function validateUploadFile(file, purpose = "document") {
  if (!file) return { ok: false, message: "Adjunte un archivo." };
  const fileName = String(file.name || "archivo");
  const declared = typeof file.type === "string" ? file.type : "";
  const resolved = resolveMime(fileName, declared, purpose);
  if (!resolved.ok) return { ok: false, message: resolved.message };

  let view;
  try {
    view = await readFileHead(file, purpose === "document" || purpose === "cv" ? 512 : 32);
  } catch (_e) {
    return { ok: false, message: "No se pudo leer el archivo. Intente de nuevo." };
  }
  if (!view || view.length < 4) {
    return { ok: false, message: "El archivo está vacío o incompleto." };
  }
  if (looksLikeExecutable(view)) {
    return { ok: false, message: "El archivo parece un ejecutable y no está permitido." };
  }
  if (purpose === "image" && looksLikeHtmlOrSvg(view)) {
    return { ok: false, message: "El contenido no es una imagen válida." };
  }
  if (!magicMatchesMime(view, resolved.mime)) {
    return { ok: false, message: "El contenido del archivo no coincide con el formato declarado." };
  }
  if (looksLikeHtmlOrSvg(view) && !String(resolved.mime).startsWith("text/")) {
    return { ok: false, message: "El archivo contiene marcado HTML/SVG no permitido." };
  }
  return { ok: true, mime: resolved.mime, ext: resolved.ext };
}

/** Lanza Error con mensaje amigable si el archivo no es seguro. */
export async function assertSafeUploadFile(file, purpose = "document") {
  const result = await validateUploadFile(file, purpose);
  if (!result.ok) throw new Error(result.message || "Archivo no permitido.");
  return result;
}

const api = {
  validateUploadFile,
  assertSafeUploadFile,
  normalizeUploadMime,
  extFromFileName,
  SAFE_IMAGE_ACCEPT,
  SAFE_CV_ACCEPT,
  SAFE_DOCUMENT_ACCEPT
};

if (typeof window !== "undefined") {
  window.AntaresFileUploadSecurity = api;
}

export default api;
