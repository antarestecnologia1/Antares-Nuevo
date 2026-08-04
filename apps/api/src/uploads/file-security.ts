import { BadRequestException } from "@nestjs/common";

/** Propósito de la subida: define allowlist y reglas de magic bytes. */
export type UploadPurpose = "image" | "document" | "cv";

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

const EXT_TO_MIME: Record<string, string> = {
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

export function normalizeUploadMime(raw: string): string {
  const mime = String(raw || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (mime === "image/jpg" || mime === "image/pjpeg") return "image/jpeg";
  if (mime === "application/x-zip-compressed") return "application/zip";
  if (mime === "application/csv") return "text/csv";
  return mime || "application/octet-stream";
}

export function extFromFileName(fileName: string): string {
  const safe = String(fileName || "").trim();
  const idx = safe.lastIndexOf(".");
  if (idx <= 0 || idx >= safe.length - 1) return "";
  return safe.slice(idx + 1).toLowerCase().slice(0, 16);
}

function allowlistsFor(purpose: UploadPurpose): { mimes: Set<string>; exts: Set<string> } {
  if (purpose === "image") return { mimes: IMAGE_MIME, exts: IMAGE_EXT };
  if (purpose === "cv") return { mimes: CV_MIME, exts: CV_EXT };
  return { mimes: DOCUMENT_MIME, exts: DOCUMENT_EXT };
}

function startsWith(buf: Buffer, ...bytes: number[]): boolean {
  return bytes.every((v, i) => buf[i] === v);
}

function asciiAt(buf: Buffer, start: number, len: number): string {
  return buf.subarray(start, start + len).toString("ascii");
}

/** Firmas de binarios ejecutables / contenedores peligrosos (independiente de extensión). */
function looksLikeExecutable(buf: Buffer): boolean {
  if (buf.length < 2) return false;
  /* PE / DOS MZ */
  if (startsWith(buf, 0x4d, 0x5a)) return true;
  /* ELF */
  if (startsWith(buf, 0x7f, 0x45, 0x4c, 0x46)) return true;
  /* Mach-O */
  if (
    startsWith(buf, 0xfe, 0xed, 0xfa, 0xce) ||
    startsWith(buf, 0xfe, 0xed, 0xfa, 0xcf) ||
    startsWith(buf, 0xce, 0xfa, 0xed, 0xfe) ||
    startsWith(buf, 0xcf, 0xfa, 0xed, 0xfe)
  ) {
    return true;
  }
  /* Java class */
  if (startsWith(buf, 0xca, 0xfe, 0xba, 0xbe)) return true;
  return false;
}

function looksLikeHtmlOrSvg(buf: Buffer): boolean {
  const head = buf.subarray(0, Math.min(buf.length, 512)).toString("utf8").toLowerCase().replace(/^\uFEFF/, "");
  const trimmed = head.trimStart();
  if (trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html")) return true;
  if (trimmed.startsWith("<svg") || trimmed.includes("<svg")) return true;
  if (trimmed.startsWith("<?xml") && (trimmed.includes("<svg") || trimmed.includes("<html"))) return true;
  if (/<script[\s>]/i.test(trimmed)) return true;
  return false;
}

function isZipContainer(buf: Buffer): boolean {
  return (
    startsWith(buf, 0x50, 0x4b, 0x03, 0x04) ||
    startsWith(buf, 0x50, 0x4b, 0x05, 0x06) ||
    startsWith(buf, 0x50, 0x4b, 0x07, 0x08)
  );
}

function isOleCompound(buf: Buffer): boolean {
  return startsWith(buf, 0xd0, 0xcf, 0x11, 0xe0);
}

function isMostlyText(buf: Buffer): boolean {
  const sample = buf.subarray(0, Math.min(buf.length, 4096));
  if (!sample.length) return false;
  let suspicious = 0;
  for (let i = 0; i < sample.length; i += 1) {
    const c = sample[i];
    const ok =
      c === 0x09 ||
      c === 0x0a ||
      c === 0x0d ||
      (c >= 0x20 && c <= 0x7e) ||
      c >= 0x80;
    if (!ok) suspicious += 1;
  }
  return suspicious / sample.length < 0.05;
}

function magicMatchesMime(buf: Buffer, mime: string): boolean {
  if (mime === "application/pdf") return asciiAt(buf, 0, 4) === "%PDF";
  if (mime === "application/msword" || mime === "application/vnd.ms-excel" || mime === "application/vnd.ms-powerpoint") {
    return isOleCompound(buf);
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
    return isZipContainer(buf);
  }
  if (mime === "image/jpeg") return startsWith(buf, 0xff, 0xd8, 0xff);
  if (mime === "image/png") return startsWith(buf, 0x89, 0x50, 0x4e, 0x47);
  if (mime === "image/gif") {
    const g = asciiAt(buf, 0, 6);
    return g === "GIF87a" || g === "GIF89a";
  }
  if (mime === "image/webp") {
    return asciiAt(buf, 0, 4) === "RIFF" && asciiAt(buf, 8, 4) === "WEBP";
  }
  if (mime === "text/plain" || mime === "text/csv" || mime === "text/markdown") {
    return isMostlyText(buf) && !looksLikeHtmlOrSvg(buf) && !looksLikeExecutable(buf);
  }
  return false;
}

function purposeLabel(purpose: UploadPurpose): string {
  if (purpose === "image") return "Solo se permiten imágenes JPEG, PNG, WebP o GIF.";
  if (purpose === "cv") {
    return "Formato de archivo no permitido. Use PDF, Word (doc/docx) o imagen (jpeg, png, webp o gif).";
  }
  return "Tipo de archivo no permitido. Use PDF, Office, texto, ZIP o imagen (JPEG/PNG/WebP/GIF).";
}

export type SafeUploadMeta = {
  mime: string;
  ext: string;
  fileName: string;
};

/**
 * Valida metadatos de un presign (sin bytes). Rechaza extensiones peligrosas
 * y exige MIME/extensión de la allowlist del propósito.
 */
export function assertSafeUploadMeta(opts: {
  fileName: string;
  contentType: string;
  purpose: UploadPurpose;
}): SafeUploadMeta {
  const fileName = String(opts.fileName || "archivo").trim() || "archivo";
  const ext = extFromFileName(fileName);
  if (ext && BLOCKED_EXTENSIONS.has(ext)) {
    throw new BadRequestException(
      `Extensión .${ext} no permitida por seguridad. Use otro formato de archivo.`
    );
  }
  const { mimes, exts } = allowlistsFor(opts.purpose);
  let mime = normalizeUploadMime(opts.contentType);
  const loose = mime === "application/octet-stream" || mime === "binary/octet-stream" || !mime;
  if ((!mime || !mimes.has(mime)) && loose && ext && EXT_TO_MIME[ext] && exts.has(ext)) {
    mime = EXT_TO_MIME[ext];
  }
  if (!mimes.has(mime)) {
    throw new BadRequestException(purposeLabel(opts.purpose));
  }
  if (ext && !exts.has(ext)) {
    /* Extensión no alineada con el propósito (p. ej. .pdf en avatar). */
    throw new BadRequestException(purposeLabel(opts.purpose));
  }
  const resolvedExt = ext && exts.has(ext) ? (ext === "jpeg" ? "jpg" : ext) : mimeExtFallback(mime);
  return { mime, ext: resolvedExt, fileName };
}

function mimeExtFallback(mime: string): string {
  switch (mime) {
    case "application/pdf":
      return "pdf";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    case "application/vnd.ms-excel":
      return "xls";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "xlsx";
    case "application/vnd.ms-powerpoint":
      return "ppt";
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return "pptx";
    case "text/plain":
      return "txt";
    case "text/csv":
      return "csv";
    case "text/markdown":
      return "md";
    case "application/zip":
      return "zip";
    default:
      return "bin";
  }
}

/**
 * Valida archivo con buffer (multipart). Comprueba extensión, MIME allowlist,
 * firmas mágicas y rechaza ejecutables / HTML/SVG disfrazados.
 */
export function assertSafeUploadBuffer(opts: {
  buffer: Buffer;
  fileName?: string;
  mimeType?: string;
  purpose: UploadPurpose;
}): SafeUploadMeta {
  const buf = opts.buffer;
  if (!buf || buf.length < 4) {
    throw new BadRequestException("El archivo adjunto está vacío o incompleto.");
  }
  if (looksLikeExecutable(buf)) {
    throw new BadRequestException("El archivo parece un ejecutable y no está permitido.");
  }
  if (opts.purpose === "image" && looksLikeHtmlOrSvg(buf)) {
    throw new BadRequestException("El contenido no es una imagen válida.");
  }

  const meta = assertSafeUploadMeta({
    fileName: opts.fileName || "archivo",
    contentType: opts.mimeType || "",
    purpose: opts.purpose
  });

  if (!magicMatchesMime(buf, meta.mime)) {
    throw new BadRequestException("El contenido del archivo no coincide con el formato declarado.");
  }

  /* Doble chequeo: HTML/SVG en documentos de texto ya cubierto; para el resto, bloquear SVG/HTML si se coló. */
  if (looksLikeHtmlOrSvg(buf) && !meta.mime.startsWith("text/")) {
    throw new BadRequestException("El archivo contiene marcado HTML/SVG no permitido.");
  }

  return meta;
}

/** Extensión segura a partir de nombre + MIME ya validados. */
export function resolveSafeFileExt(fileName: string, mime: string, purpose: UploadPurpose): string {
  const meta = assertSafeUploadMeta({ fileName, contentType: mime, purpose });
  return meta.ext;
}

