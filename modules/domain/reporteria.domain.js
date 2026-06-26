/**
 * Dominio reportería: permisos de reportes, vista previa, exportación PDF/CSV/Excel BI,
 * sincronización conductor ↔ empleado y normalización de filas para formularios.
 * Extraído desde `portal-runtime.js` (Fase 12).
 */
import {
  KEYS,
  ROLES,
  CO_CATALOGS,
  REPORT_RULES,
  REPORT_BRAND_LOGO_PATH
} from "../core/config.js";
import { read, writeAwaitServer, writeAwaitServerCreate, syncPayloadForEditedRow } from "../core/data-io.js";
import { state, nodes } from "../core/store.js";
import { currentUser, hasPermission, canAccessRRHH } from "../core/auth.js";
import {
  escapeHtml,
  escapeAttr,
  fmtDate,
  nowIso,
  normalizePortalDateYmd,
  formatPortalPhoneForDisplay,
  pickFirstNonEmpty,
  normalizeLatinUpperForDb,
  stampCreatedRecord,
  stampUpdatedRecord,
  newUuidV4
} from "../core/utils.js";
import { parseNum } from "./historial.domain.js";
import { matchCatalogOptionValue, normalizePortalPhoneForStorage } from "./payroll-catalog-sanitize.domain.js";
import { normalizeDocumentDigits } from "./payroll-identifiers.domain.js";
import { notify, userMessage } from "../ui/modals.js";


/** Suma un año calendario a `YYYY-MM-DD` (local), para vigencias de examen. */
export function addOneYearToYmd(ymd) {
  const n = normalizePortalDateYmd(ymd);
  if (!n) return "";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return "";
  const y = Number(p[1]);
  const mo = Number(p[2]) - 1;
  const day = Number(p[3]);
  const d = new Date(y, mo, day);
  if (Number.isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function latinForDb(value) {
  const fn = globalThis.AntaresValidation?.normalizeLatinForDb;
  return typeof fn === "function" ? fn(value) : String(value ?? "").trim();
}

function ic() {
  return typeof globalThis !== "undefined" && globalThis.IC ? globalThis.IC : /** @type {Record<string, string>} */ ({});
}


export function toCsv(rows = [], columns = []) {
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const header = columns.map((col) => esc(col.label)).join(",");
  const body = rows.map((row) => columns.map((col) => esc(row[col.key])).join(",")).join("\n");
  return `${header}\n${body}`;
}

export function canAccessReport(user, reportId) {
  if (!user) return false;
  if (user.role === ROLES.CLIENT) return false;
  const rule = REPORT_RULES[reportId];
  if (!rule) return false;
  if (!hasPermission(user, rule.permission)) return false;
  if (rule.adminOnly) return user.role === ROLES.ADMIN;
  if (rule.rrhhAllowed) return canAccessRRHH(user.role) || user.role === ROLES.ADMIN;
  return true;
}

let reportBrandLogoDataUrlPromise = null;

export function reportPreviewValueIsEmpty(value) {
  const text = String(value ?? "").trim();
  return !text || text === "-" || text === "—" || text.toLowerCase() === "null" || text.toLowerCase() === "undefined";
}

export function reportPreviewSamples(rows = [], key = "") {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => row?.[key])
    .filter((value) => !reportPreviewValueIsEmpty(value))
    .slice(0, 8);
}

const REPORT_CURRENCY_HINT =
  /(cop\b|costo|cost\b|neto|net\b|gross|devengado|deducc|reembolso|viatic|salario|aspiracion|combustible|standby|nomina|nómina|tarifa|monetario|factur|valor\s+(viaje|operativo|asegurado|del|de|trip)|ingresos?\s+operativ|n[oó]mina\s+neta|pago|bruto)/i;
const REPORT_COUNT_HINT =
  /(total(es)?|pendiente(s)?|cerrad[oa]s?|emitid[oa]s?|activ[oa]s?|abiert[oa]s?|cantidad|cupos?|permisos?|viajes?|entrevistas?|contratos?|controles?|registros?|usuarios?|conductores?|solicitudes?|numero|n[uú]mero|count\b|qty\b|litros?|comparendos?|empleados?)/i;

function reportPreviewNumericValue(value) {
  return typeof value === "number" || /^-?\d+(?:[.,]\d+)?$/.test(String(value ?? "").trim());
}

function reportPreviewPreformattedCurrency(value) {
  return typeof value === "string" && /^\$/.test(String(value).trim());
}

export function reportPreviewInferValueCellType(value, row = {}, column = {}) {
  const metric = String(row?.metric || "").toLowerCase();
  const key = String(column?.key || "").toLowerCase();
  const label = String(column?.label || "").toLowerCase();
  const meta = `${metric} ${key} ${label}`;

  if (reportPreviewPreformattedCurrency(value)) return "currency";
  if (REPORT_COUNT_HINT.test(metric) || (REPORT_COUNT_HINT.test(meta) && !REPORT_CURRENCY_HINT.test(meta))) return "number";
  if (REPORT_CURRENCY_HINT.test(metric) || REPORT_CURRENCY_HINT.test(meta)) return "currency";

  if (reportPreviewNumericValue(value)) {
    if (/(ingreso|n[oó]mina|salario|costo|tarifa|devengado|neto|bruto|deducc|standby|combustible|viatic|aspiracion|reembolso|monetario|finanz)/i.test(metric)) {
      return "currency";
    }
    if (/(total|pendiente|cerrad|emitid|activ|abiert|contrato|control|aprobacion|viaje|solicitud|permiso|entrevista|usuario|conductor|liquidacion)/i.test(metric)) {
      return "number";
    }
    return "number";
  }
  return "text";
}

export function reportPreviewResolveCellType(column = {}, row = {}, value) {
  const explicit = String(column?.type || "").trim().toLowerCase();
  if (explicit && explicit !== "auto") return explicit;
  const key = String(column?.key || "").toLowerCase();
  if (key === "value" && row && typeof row === "object") {
    return reportPreviewInferValueCellType(value, row, column);
  }
  return reportPreviewInferColumnType(column, row && typeof row === "object" ? [row] : []);
}

export function reportPreviewInferColumnType(column = {}, rows = []) {
  const explicit = String(column?.type || "").trim().toLowerCase();
  if (explicit && explicit !== "auto") return explicit;

  const key = String(column?.key || "").toLowerCase();
  const label = String(column?.label || "").toLowerCase();
  const meta = `${key} ${label}`;
  const samples = reportPreviewSamples(rows, column?.key || "");
  const sampleText = samples.map((value) => String(value).trim()).join(" | ");
  const allBoolean = samples.length > 0 && samples.every((value) => /^(si|sí|no)$/i.test(String(value).trim()));

  if (/(status|estado|sla)/i.test(meta)) return "status";
  if (/(riesgo|risk|vigencia|vence|vencimiento)/i.test(meta)) return "risk";
  if (allBoolean || /(termoking|tiene|entrevista|contrato)/i.test(meta)) return "boolean";
  if (/(categor|tipo|rol|origen|modalidad|fuente)/i.test(meta)) return "tag";
  if (
    /(count|qty|permissions|liters|litros|trips$|viajes$|entrevistas|comparendos|openings|capacity|odometer)/i.test(key) ||
    REPORT_COUNT_HINT.test(meta)
  ) {
    return "number";
  }
  if (/(min|hora|horas|hour|hours|dia|dias|days|kg|litro|liters|permis|edad|viajes|entrevistas|resoluci|capacidad|cantidad)/i.test(meta)) {
    return "number";
  }
  if (REPORT_CURRENCY_HINT.test(meta)) return "currency";
  if (/%/.test(sampleText) || /(porcentaje|tasa|pct|rate|closure|cierre)/i.test(meta)) return "percent";
  if (/(fecha|date|venc|entrega|asign|cread|pago|revision|ingreso|registro)/i.test(meta) && !/(solicitud|valor|numero|n[uú]mero|count)/i.test(key)) {
    return "date";
  }
  if (/(detalle|novedad|observ|resumen|reason|nota)/i.test(meta)) return "longtext";
  if (/(placa|viaje|factura|documento|doc|codigo|correo|licencia)/i.test(meta) && !/(total|activo|cerrad|histor)/i.test(meta)) {
    return "id";
  }
  if (key === "value" && /^valor$/i.test(label.trim())) return "auto";
  return "text";
}

export function reportPreviewFormatValue(value, type = "text") {
  if (reportPreviewValueIsEmpty(value)) return "—";
  if (reportPreviewPreformattedCurrency(value)) return String(value).trim();
  if (type === "currency" && reportPreviewNumericValue(value)) {
    return `$${parseNum(value).toLocaleString("es-CO")}`;
  }
  if (type === "percent" && reportPreviewNumericValue(value)) {
    return `${parseNum(value).toLocaleString("es-CO")}%`;
  }
  if (type === "number" && reportPreviewNumericValue(value)) {
    return parseNum(value).toLocaleString("es-CO");
  }
  return String(value);
}

export function reportPreviewTone(type = "text", value) {
  const text = String(reportPreviewFormatValue(value, type)).toLowerCase();
  if (type === "boolean") return /^(si|sí)$/i.test(text) ? "success" : "neutral";
  if (type === "tag") return "info";
  if (/(rechaz|vencid|crit|cr[ií]tic|no disponible|incumpl|cancel|alert|sin fecha|fuera)/i.test(text)) return "danger";
  if (/(pendient|pr[oó]xim|atenci[oó]n|espera|riesgo)/i.test(text)) return "warning";
  if (/(aprob|pagad|cumpl|complet|cerrad|controlad|vigent|disponible|si|sí)/i.test(text)) return "success";
  if (/(ocupad|asignad|activo|operaci[oó]n|proceso|ruta|revisi[oó]n)/i.test(text)) return "info";
  return "neutral";
}

export function reportPreviewColumnMeta(columns = [], rows = []) {
  return (Array.isArray(columns) ? columns : []).map((column, index) => ({
    ...column,
    type: reportPreviewInferColumnType(column, rows),
    pinned: index === 0
  }));
}

const REPORT_PREVIEW_ROW_VISUALS = [
  { tone: "info", categoryIcon: "settings", detailIcon: "activity" },
  { tone: "warning", categoryIcon: "clock", detailIcon: "clock" },
  { tone: "success", categoryIcon: "briefcase", detailIcon: "check" },
  { tone: "info", categoryIcon: "dollar", detailIcon: "activity" },
  { tone: "warning", categoryIcon: "file", detailIcon: "clock" },
  { tone: "success", categoryIcon: "shield", detailIcon: "check" },
  { tone: "info", categoryIcon: "building", detailIcon: "activity" },
  { tone: "warning", categoryIcon: "users", detailIcon: "clock" }
];

function reportPreviewPortalIcon(key = "") {
  const ic = typeof globalThis !== "undefined" && globalThis.IC ? globalThis.IC : {};
  return ic[key] || "";
}

function reportPreviewRowVisual(rowIndex = 0) {
  return REPORT_PREVIEW_ROW_VISUALS[Math.abs(Number(rowIndex) || 0) % REPORT_PREVIEW_ROW_VISUALS.length];
}

export function reportPreviewCategoryCellHtml(value, rowIndex = 0) {
  const display = reportPreviewFormatValue(value, "tag");
  if (display === "—") return `<span class="report-empty">—</span>`;
  const visual = reportPreviewRowVisual(rowIndex);
  const icon = reportPreviewPortalIcon(visual.categoryIcon);
  return `<span class="report-cat-badge report-cat-badge--${visual.tone}">${icon}<span>${escapeHtml(display)}</span></span>`;
}

export function reportPreviewDetailCellHtml(value, rowIndex = 0) {
  const display = reportPreviewFormatValue(value, "longtext");
  if (display === "—") return `<span class="report-empty">—</span>`;
  const visual = reportPreviewRowVisual(rowIndex);
  const icon = reportPreviewPortalIcon(visual.detailIcon);
  return `<span class="report-detail"><span class="report-detail__icon report-detail__icon--${visual.tone}" aria-hidden="true">${icon}</span><span class="report-detail__text">${escapeHtml(display)}</span></span>`;
}

export function reportPreviewCellInnerHtml(value, type = "text", context = {}) {
  const columnKey = String(context?.columnKey || "").toLowerCase();
  const rowIndex = Number(context?.rowIndex) || 0;
  const row = context?.row && typeof context.row === "object" ? context.row : {};
  const column = context?.column && typeof context.column === "object" ? context.column : { key: columnKey };
  const cellType = reportPreviewResolveCellType(column, row, value);
  if (columnKey === "category") return reportPreviewCategoryCellHtml(value, rowIndex);
  if (columnKey === "detail") return reportPreviewDetailCellHtml(value, rowIndex);
  if (columnKey === "metric") {
    const display = reportPreviewFormatValue(value, cellType);
    if (display === "—") return `<span class="report-empty">—</span>`;
    return `<span class="report-metric">${escapeHtml(display)}</span>`;
  }
  const display = reportPreviewFormatValue(value, cellType);
  if (display === "—") return `<span class="report-empty">—</span>`;
  const safe = escapeHtml(display);
  if (["status", "risk", "boolean", "tag"].includes(cellType)) {
    return `<span class="report-badge report-badge--${reportPreviewTone(cellType, display)}">${safe}</span>`;
  }
  if (cellType === "id") return `<span class="report-code">${safe}</span>`;
  if (cellType === "longtext") return `<span class="report-note">${safe}</span>`;
  const valueClass =
    columnKey === "value" || ["currency", "number", "percent"].includes(cellType) ? " report-value--highlight" : "";
  return `<span class="report-value${valueClass}">${safe}</span>`;
}

export function downloadBlobFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 400);
}

export function downloadCsv(filename, rows = [], columns = []) {
  downloadBlobFile(filename, toCsv(rows, columns), "text/csv;charset=utf-8;");
}

export function reportExportStamp() {
  return new Date().toISOString().slice(0, 10);
}

export function reportExportSlug(title) {
  return String(title || "reporte")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

export function reportExportFilename(report, ext) {
  const base = String(report?.fileName || "reporte")
    .replace(/\.(csv|html|xls|pdf)$/i, "")
    .trim();
  const slug = reportExportSlug(report?.title || base);
  return `${slug || base || "reporte"}_${reportExportStamp()}.${ext}`;
}

export function reportPdfCellText(value) {
  if (value == null) return "-";
  const normalized = String(value).replace(/\s+/g, " ").trim();
  return normalized || "-";
}

export function reportBrandCopyrightText() {
  return `© ${new Date().getFullYear()} Transportes Antares. Todos los derechos reservados.`;
}

export function reportBrandLogoSrc() {
  const liveLogo = document.querySelector(".hero-brand-logo, .auth-modal-brand-logo, .brand-logo, .sidebar-brand-logo");
  const src = String(liveLogo?.currentSrc || liveLogo?.src || "").trim();
  if (src) return src;
  try {
    return new URL(REPORT_BRAND_LOGO_PATH, window.location.href).href;
  } catch (_e) {
    return REPORT_BRAND_LOGO_PATH;
  }
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("blob-to-data-url-failed"));
    reader.readAsDataURL(blob);
  });
}

export function imageElementToDataUrl(img) {
  try {
    if (!(img instanceof HTMLImageElement)) return "";
    const width = Number(img.naturalWidth || img.width || 0);
    const height = Number(img.naturalHeight || img.height || 0);
    if (!width || !height) return "";
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  } catch (_e) {
    return "";
  }
}

export async function getReportBrandLogoDataUrl() {
  if (!reportBrandLogoDataUrlPromise) {
    reportBrandLogoDataUrlPromise = (async () => {
      const liveLogo = document.querySelector(".hero-brand-logo, .auth-modal-brand-logo, .brand-logo, .sidebar-brand-logo");
      if (liveLogo instanceof HTMLImageElement && liveLogo.complete && Number(liveLogo.naturalWidth || 0) > 0) {
        const dataUrl = imageElementToDataUrl(liveLogo);
        if (dataUrl) return dataUrl;
      }
      const src = reportBrandLogoSrc();
      if (/^data:/i.test(src)) return src;
      try {
        const res = await fetch(src, { credentials: "same-origin", cache: "force-cache" });
        if (!res.ok) throw new Error(`logo-${res.status}`);
        return await blobToDataUrl(await res.blob());
      } catch (_e) {
        return "";
      }
    })();
  }
  return reportBrandLogoDataUrlPromise;
}

const JSPDF_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const JSPDF_AUTOTABLE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
let jsPdfLoadPromise = null;

function loadVendorScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.referrerPolicy = "no-referrer";
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`No se pudo cargar ${src} (compruebe conexion o CDN)`));
    document.head.appendChild(s);
  });
}

/**
 * jsPDF + autotable se cargan bajo demanda al exportar: son ~450 KB que el
 * visitante de la landing nunca necesita (antes iban como <script> en index.html).
 */
async function ensureJsPdf() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  if (!jsPdfLoadPromise) {
    jsPdfLoadPromise = (async () => {
      await loadVendorScriptOnce(JSPDF_CDN);
      await loadVendorScriptOnce(JSPDF_AUTOTABLE_CDN);
    })().catch((err) => {
      jsPdfLoadPromise = null;
      throw err;
    });
  }
  await jsPdfLoadPromise;
  if (!window.jspdf?.jsPDF) throw new Error("PDF export unavailable");
  return window.jspdf.jsPDF;
}

export async function exportCatalogReportPdf(report, meta = {}) {
  const jsPdfCtor = await ensureJsPdf();
  const title = report?.title || "Reporte";
  const columns = Array.isArray(report?.columns) && report.columns.length ? report.columns : [{ key: "message", label: "Detalle" }];
  const rows = Array.isArray(report?.rows) ? report.rows : [];
  const generatedAt = reportPdfCellText(meta.generatedAt || fmtDate(nowIso()));
  const generatedBy = meta.generatedBy ? reportPdfCellText(meta.generatedBy) : "";
  const rowCount = rows.length;
  const orientation = columns.length > 6 ? "landscape" : "portrait";
  const doc = new jsPdfCtor({ orientation, unit: "pt", format: "a4", compress: true });
  if (typeof doc.autoTable !== "function") throw new Error("PDF table export unavailable");
  const logoDataUrl = await getReportBrandLogoDataUrl();
  const logoFormatRaw = /^data:image\/([a-z0-9+.-]+);/i.exec(String(logoDataUrl || ""))?.[1] || "png";
  const logoFormat = logoFormatRaw.toLowerCase() === "jpg" ? "JPEG" : logoFormatRaw.toUpperCase();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 40;
  const headerY = 28;
  const headerHeight = 72;
  const tableStartY = 138;
  const titleText = reportPdfCellText(title);
  const copyrightText = reportBrandCopyrightText();

  doc.setProperties({
    title: titleText,
    subject: "Reporte operativo",
    author: "Transportes Antares",
    creator: "Antares"
  });

  const metaParts = [`Generado: ${generatedAt}`];
  if (generatedBy) metaParts.push(`Usuario: ${generatedBy}`);
  metaParts.push(`Registros: ${rowCount}`);

  const drawPageHeader = (pageNumber) => {
    doc.setFillColor(30, 74, 115);
    doc.roundedRect(marginX, headerY, pageWidth - marginX * 2, headerHeight, 12, 12, "F");
    const logoBoxSize = headerHeight - 20;
    const logoX = marginX + 12;
    const logoY = headerY + 10;
    const titleStartX = logoDataUrl ? logoX + logoBoxSize + 14 : marginX + 14;
    const titleMaxWidth = pageWidth - marginX - titleStartX - 14;
    if (logoDataUrl) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(logoX, logoY, logoBoxSize, logoBoxSize, 10, 10, "F");
      try {
        doc.addImage(logoDataUrl, logoFormat, logoX + 6, logoY + 6, logoBoxSize - 12, logoBoxSize - 12, undefined, "FAST");
      } catch (_e) {
        // Si el logo no se puede incrustar, mantenemos el reporte legible.
      }
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text(titleText, titleStartX, headerY + 29, { maxWidth: titleMaxWidth });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Transportes Antares · Centro de reportería", titleStartX, headerY + 50, { maxWidth: titleMaxWidth });

    doc.setTextColor(11, 33, 56);
    doc.setFontSize(9.5);
    doc.text(metaParts.join("   |   "), marginX, headerY + headerHeight + 16, {
      maxWidth: pageWidth - marginX * 2
    });

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(copyrightText, pageWidth / 2, pageHeight - 18, { align: "center" });
    doc.text(`Página ${pageNumber}`, pageWidth - marginX, pageHeight - 18, { align: "right" });
  };

  const tableBody = rows.length
    ? rows.map((row) => columns.map((col) => reportPdfCellText(row?.[col.key])))
    : [[{
        content: "Sin datos para el periodo o filtros seleccionados.",
        colSpan: columns.length,
        styles: { halign: "center", fontStyle: "italic", textColor: [100, 116, 139] }
      }]];

  doc.autoTable({
    head: [columns.map((col) => reportPdfCellText(col.label))],
    body: tableBody,
    startY: tableStartY,
    margin: { top: tableStartY, right: marginX, bottom: 34, left: marginX },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8.4,
      textColor: [11, 33, 56],
      lineColor: [184, 212, 235],
      cellPadding: { top: 6, right: 7, bottom: 6, left: 7 },
      overflow: "linebreak",
      valign: "top"
    },
    headStyles: {
      fillColor: [30, 74, 115],
      textColor: [255, 255, 255],
      lineColor: [30, 74, 115],
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [245, 250, 255]
    },
    didDrawPage: ({ pageNumber }) => {
      drawPageHeader(pageNumber);
    }
  });

  doc.save(reportExportFilename(report, "pdf"));
}

export function reportsPeriodLabel(period) {
  const labels = {
    "30d": "Últimos 30 días",
    "90d": "Últimos 90 días",
    month: "Mes actual",
    ytd: "Año en curso",
    all: "Histórico completo"
  };
  return labels[String(period || "90d").trim()] || labels["90d"];
}

export function reportsExportDefaultFilters() {
  return { period: "90d" };
}

export function normalizeReportsExportFilters(raw) {
  const base = reportsExportDefaultFilters();
  const next = raw && typeof raw === "object" ? { ...base, ...raw } : base;
  const period = String(next.period || base.period).trim();
  return {
    period: ["30d", "90d", "month", "ytd", "all"].includes(period) ? period : base.period
  };
}

export function reportsExportPeriodChip(value, label, current) {
  const active = current === value ? " is-active" : "";
  return `<button type="button" class="reports-bi-chip${active}" data-action="reports-export-period-chip" data-period="${escapeAttr(value)}" aria-pressed="${current === value ? "true" : "false"}">${escapeHtml(label)}</button>`;
}

const REPORTS_BI_LAYOUT_STORAGE = "antares_reports_bi_layout_v1";

export function reportsBiDefaultLayout() {
  return {
    insights: true,
    kpis: {
      revenue: true,
      trips: true,
      requests: true,
      sla: true,
      cycle: true,
      fuel: true,
      maint: true,
      fleet: true,
      docs: true
    },
    scores: { sla: true, assign: true, thermoking: true },
    charts: {
      revenue: true,
      weekly: true,
      funnel: true,
      status: true,
      clients: true,
      routes: true,
      drivers: true,
      rankings: true
    }
  };
}

export function normalizeReportsBiLayout(raw) {
  const def = reportsBiDefaultLayout();
  if (!raw || typeof raw !== "object") return def;
  return {
    insights: raw.insights !== false,
    kpis: { ...def.kpis, ...(raw.kpis && typeof raw.kpis === "object" ? raw.kpis : {}) },
    scores: { ...def.scores, ...(raw.scores && typeof raw.scores === "object" ? raw.scores : {}) },
    charts: { ...def.charts, ...(raw.charts && typeof raw.charts === "object" ? raw.charts : {}) }
  };
}

export function reportsBiLayoutStorageKey() {
  const u = currentUser();
  const id = String(u?.id || u?.email || "anon").trim() || "anon";
  return `${REPORTS_BI_LAYOUT_STORAGE}_${id}`;
}

export function loadReportsBiLayout() {
  if (state.reportsUi?.layout) return normalizeReportsBiLayout(state.reportsUi.layout);
  try {
    const raw = localStorage.getItem(reportsBiLayoutStorageKey());
    if (raw) return normalizeReportsBiLayout(JSON.parse(raw));
  } catch (_e) {
    /* noop */
  }
  return reportsBiDefaultLayout();
}

export function destroyReportsCharts() {
  const list = state.reportsChartInstances || [];
  list.forEach((ch) => {
    try {
      ch.destroy();
    } catch (_e) {
      /* noop */
    }
  });
  state.reportsChartInstances = [];
}

export function loadChartJsLib() {
  if (window.Chart) return Promise.resolve(window.Chart);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-antares-chartjs]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Chart));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    s.crossOrigin = "anonymous";
    s.referrerPolicy = "no-referrer";
    s.dataset.antaresChartjs = "1";
    s.onload = () => resolve(window.Chart);
    s.onerror = () => reject(new Error("Chart.js no cargó"));
    document.head.appendChild(s);
  });
}

const REPORTS_BI_BRAND = Object.freeze({
  primary: "#377cc0",
  primaryDeep: "#2a6399",
  primaryDeeper: "#1e4a73",
  accent: "#5a94c8",
  soft: "#dceaf7",
  success: "#1b8e5f",
  warning: "#d97706",
  danger: "#d62828",
  neutral: "#94a3b8",
  text: "#0b2138",
  muted: "#64748b",
  line: "#b8d4eb",
  onPrimary: "#f0f7ff",
  white: "#ffffff"
});

export function reportsBiBrandPalette() {
  const b = REPORTS_BI_BRAND;
  return [b.primaryDeep, b.primary, b.primaryDeeper, b.success, b.warning, "#356fa8", "#4a7fb8", b.neutral];
}

export function reportsBiChartColors() {
  const b = REPORTS_BI_BRAND;
  const dark = String(document.body?.dataset?.theme || "light") === "dark";
  return {
    dark,
    primary: dark ? b.accent : b.primary,
    primaryDeep: dark ? "#5a9fd4" : b.primaryDeep,
    accent: dark ? "#6eb5e8" : b.accent,
    success: dark ? "#3ecf9a" : b.success,
    warning: dark ? "#f5b84a" : b.warning,
    neutral: dark ? "#64748b" : b.neutral,
    palette: reportsBiBrandPalette(),
    barPrimary: dark ? "rgba(42, 99, 153, 0.88)" : "rgba(42, 99, 153, 0.92)",
    barDeep: dark ? "rgba(30, 74, 115, 0.88)" : "rgba(30, 74, 115, 0.92)",
    barSuccess: dark ? "rgba(27, 142, 95, 0.82)" : "rgba(27, 142, 95, 0.9)",
    fillPrimary: dark ? "rgba(42, 99, 153, 0.2)" : "rgba(42, 99, 153, 0.14)",
    fillSuccess: dark ? "rgba(27, 142, 95, 0.16)" : "rgba(27, 142, 95, 0.12)",
    funnel: [b.primaryDeeper, b.primaryDeep, b.primary, b.success, "#356fa8"]
  };
}

export function reportsBiChartTheme() {
  const b = REPORTS_BI_BRAND;
  const dark = String(document.body?.dataset?.theme || "light") === "dark";
  const text = dark ? "#e8f4fc" : b.text;
  const muted = dark ? "#9ec7e8" : b.muted;
  const grid = dark ? "rgba(148, 163, 184, 0.14)" : "rgba(184, 212, 235, 0.55)";
  const font = { family: "'Montserrat', system-ui, sans-serif", size: 11, weight: "600" };
  const copTooltip = {
    callbacks: {
      label(ctx) {
        const raw = ctx.parsed?.y ?? ctx.parsed?.x ?? ctx.raw;
        const n = parseNum(raw);
        if (String(ctx.dataset?.label || "").toLowerCase().includes("cop") || ctx.chart?.canvas?.id === "reports-chart-clients") {
          return `${ctx.dataset.label || ""}: $${n.toLocaleString("es-CO")}`;
        }
        return `${ctx.dataset.label || ""}: ${n.toLocaleString("es-CO")}`;
      }
    }
  };
  return { text, muted, grid, font, copTooltip };
}

export function reportsBiExcelEsc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function reportsBiExcelTable(headers, rows) {
  const th = headers.map((h) => `<th class="xls-th">${reportsBiExcelEsc(h)}</th>`).join("");
  const body = (rows || [])
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td class="xls-td">${reportsBiExcelEsc(cell)}</td>`).join("")}</tr>`
    )
    .join("");
  return `<table class="xls-table" cellspacing="0" cellpadding="0"><thead><tr>${th}</tr></thead><tbody>${body || `<tr><td class="xls-td" colspan="${headers.length}">Sin datos</td></tr>`}</tbody></table>`;
}

export function reportsBiCaptureChartImages(root) {
  const ids = [
    "reports-chart-revenue",
    "reports-chart-weekly",
    "reports-chart-funnel",
    "reports-chart-status",
    "reports-chart-thermoking",
    "reports-chart-clients",
    "reports-chart-routes",
    "reports-chart-drivers"
  ];
  const out = {};
  ids.forEach((id) => {
    const canvas = root?.querySelector(`#${id}`);
    if (!canvas) return;
    try {
      out[id] = canvas.toDataURL("image/png");
    } catch (_e) {
      out[id] = "";
    }
  });
  return out;
}

export function reportsBiExcelChartBlock(title, subtitle, imageData, tableHtml) {
  const img = imageData
    ? `<img src="${imageData}" alt="${reportsBiExcelEsc(title)}" width="560" height="280" style="display:block;margin:8px 0;border:1px solid ${REPORTS_BI_BRAND.line};"/>`
    : `<p class="xls-muted">Gráfica no disponible — consulte la tabla de datos.</p>`;
  return `<tr><td colspan="4" class="xls-section">
    <h3 class="xls-chart-title">${reportsBiExcelEsc(title)}</h3>
    ${subtitle ? `<p class="xls-muted">${reportsBiExcelEsc(subtitle)}</p>` : ""}
    ${img}
    ${tableHtml}
  </td></tr>`;
}

export function buildReportsBiExcelHtml(snapshot, chartImages = {}, layout) {
  const b = REPORTS_BI_BRAND;
  const L = normalizeReportsBiLayout(layout || loadReportsBiLayout());
  const logoSrc = reportsBiExcelEsc(reportBrandLogoSrc());
  const copyrightText = reportsBiExcelEsc(reportBrandCopyrightText());
  const k = snapshot.kpis;
  const fmtCop = snapshot.fmtCop;
  const slaOk = k.slaOk ?? snapshot.slaOk ?? 0;
  const slaTotal = k.slaTotal ?? snapshot.slaTotal ?? 0;
  const trendTxt = (d) => {
    const n = parseNum(d);
    if (n > 0) return `+${n}%`;
    if (n < 0) return `${n}%`;
    return "0%";
  };
  const kpiRows = [];
  if (L.kpis.revenue) kpiRows.push(["Recaudo operativo", fmtCop(k.revenue), trendTxt(k.trends?.revenue), `Ticket ${fmtCop(k.avgTicket)}`]);
  if (L.kpis.trips) kpiRows.push(["Viajes", String(k.trips), trendTxt(k.trends?.trips), ""]);
  if (L.kpis.requests) kpiRows.push(["Solicitudes", String(k.requests), trendTxt(k.trends?.requests), ""]);
  if (L.kpis.sla) kpiRows.push(["SLA cumplido", `${k.slaPct}%`, "", `${slaOk}/${slaTotal} viajes`]);
  if (L.kpis.cycle) kpiRows.push(["Ciclo promedio", `${k.avgCycleHours} h`, "", `Aprob. ${k.avgApprovalMin} min`]);
  if (L.kpis.fuel) kpiRows.push(["Combustible", fmtCop(k.fuelCost), "", `${parseNum(snapshot.fuelLiters).toLocaleString("es-CO")} L`]);
  if (L.kpis.maint) kpiRows.push(["Taller", fmtCop(k.maintCost), "", k.standbyTotal > 0 ? `Standby ${fmtCop(k.standbyTotal)}` : "Sin standby"]);
  if (L.kpis.fleet) kpiRows.push(["Flota libre", `${k.fleetAvailable}/${k.fleetTotal}`, "", `${k.fleetUtilPct}% ocupación`]);
  if (L.kpis.docs) kpiRows.push(["Alertas documentales", String(k.docRisk), "", ""]);
  const insightRows = L.insights ? (snapshot.insights || []).map((ins) => [ins.title, ins.text]) : [];
  const revenueRows = (snapshot.revenueLabels || snapshot.revenueMonths || []).map((label, i) => [
    label,
    fmtCop(snapshot.revenueSeries[i] || 0),
    String(snapshot.tripsSeries[i] || 0)
  ]);
  const weeklyRows = (snapshot.weekKeys || []).map((wk, i) => [wk, String(snapshot.weekSeries[i] || 0)]);
  const statusRows = (snapshot.statusChart || []).map((x) => [x.label, String(x.value)]);
  const funnelRows = (snapshot.funnel || []).map((x) => [x.label, String(x.value)]);
  const clientRows = (snapshot.topClients || []).map((x) => [x[0], fmtCop(x[1])]);
  const routeRows = (snapshot.topRoutes || []).map((x) => [x[0], String(x[1])]);
  const driverRows = (snapshot.topDrivers || []).map((x) => [x[0], String(x[1])]);

  const chartBlocks = [
    L.charts.revenue
      ? reportsBiExcelChartBlock(
          "Recaudo y volumen mensual",
          "Barras: ingresos · Línea: viajes",
          chartImages["reports-chart-revenue"],
          reportsBiExcelTable(["Mes", "Recaudo COP", "Viajes"], revenueRows)
        )
      : "",
    L.charts.weekly
      ? reportsBiExcelChartBlock(
          "Actividad semanal",
          "Viajes por semana",
          chartImages["reports-chart-weekly"],
          reportsBiExcelTable(["Semana", "Viajes"], weeklyRows)
        )
      : "",
    L.charts.funnel
      ? reportsBiExcelChartBlock(
          "Conversión operativa de solicitudes",
          "Desde la radicación hasta el cierre",
          chartImages["reports-chart-funnel"],
          reportsBiExcelTable(["Etapa", "Cantidad"], funnelRows)
        )
      : "",
    L.charts.status
      ? reportsBiExcelChartBlock(
          "Estados de solicitudes",
          "Distribución en el periodo",
          chartImages["reports-chart-status"],
          reportsBiExcelTable(["Estado", "Cantidad"], statusRows)
        )
      : "",
    L.scores.thermoking
      ? reportsBiExcelChartBlock(
          "Termoking vs carga seca",
          "",
          chartImages["reports-chart-thermoking"],
          reportsBiExcelTable(["Tipo", "Solicitudes"], [
            ["Con Termoking", String(snapshot.thermoking?.yes || 0)],
            ["Carga seca", String(snapshot.thermoking?.no || 0)]
          ])
        )
      : "",
    L.charts.clients
      ? reportsBiExcelChartBlock(
          "Top clientes por recaudo",
          "",
          chartImages["reports-chart-clients"],
          reportsBiExcelTable(["Cliente", "Recaudo COP"], clientRows)
        )
      : "",
    L.charts.routes
      ? reportsBiExcelChartBlock(
          "Rutas activas",
          "Por cantidad de viajes",
          chartImages["reports-chart-routes"],
          reportsBiExcelTable(["Ruta", "Viajes"], routeRows)
        )
      : "",
    L.charts.drivers
      ? reportsBiExcelChartBlock(
          "Top conductores",
          "Viajes asignados",
          chartImages["reports-chart-drivers"],
          reportsBiExcelTable(["Conductor", "Viajes"], driverRows)
        )
      : ""
  ]
    .filter(Boolean)
    .join("");

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" lang="es">
<head>
<meta charset="utf-8"/>
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Analitica</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
body{font-family:Montserrat,Arial,sans-serif;color:${b.text};font-size:11pt}
.xls-logo-cell{background:#ffffff;padding:12px 16px 6px}
.xls-logo{width:160px;max-width:160px;height:auto;display:block}
.xls-banner{background:${b.primaryDeeper};color:${b.onPrimary};font-size:18pt;font-weight:700;padding:14px 16px}
.xls-subbanner{background:${b.primaryDeep};color:${b.onPrimary};font-size:10pt;padding:8px 16px}
.xls-meta{color:${b.muted};font-size:9pt;padding:10px 16px;border-bottom:2px solid ${b.line}}
.xls-section{padding:12px 8px;vertical-align:top;border-bottom:1px solid ${b.line}}
.xls-section-title{background:${b.soft};color:${b.primaryDeeper};font-size:11pt;font-weight:700;padding:8px 12px;border-left:4px solid ${b.primaryDeep}}
.xls-chart-title{margin:0 0 4px;color:${b.primaryDeep};font-size:12pt;font-weight:700}
.xls-muted{margin:0 0 6px;color:${b.muted};font-size:9pt}
.xls-table{width:100%;border-collapse:collapse;margin-top:8px}
.xls-th{background:${b.primaryDeep};color:${b.onPrimary};font-size:9pt;font-weight:700;padding:7px 8px;text-align:left;border:1px solid ${b.primaryDeeper}}
.xls-td{font-size:9pt;padding:6px 8px;border:1px solid ${b.line};vertical-align:top}
.xls-kpi-primary{background:${b.primaryDeeper};color:${b.onPrimary};font-weight:700}
.xls-kpi-warn{background:rgba(217,119,6,0.12);color:${b.text}}
.xls-stat strong{color:${b.primaryDeep};font-size:14pt}
.xls-foot{color:${b.muted};font-size:9pt;padding:10px 16px}
</style>
</head>
<body>
<table width="100%" cellspacing="0" cellpadding="0">
<tr><td colspan="4" class="xls-logo-cell"><img class="xls-logo" src="${logoSrc}" alt="Logo de Transportes Antares" /></td></tr>
<tr><td colspan="4" class="xls-banner">Transportes Antares — Analítica operativa</td></tr>
<tr><td colspan="4" class="xls-subbanner">${reportsBiExcelEsc(snapshot.periodLabel)} · Corte ${reportsBiExcelEsc(snapshot.generatedAt)}</td></tr>
<tr><td colspan="4" class="xls-meta">En operación: ${k.activeOps ?? snapshot.activeOps ?? 0} · Asignadas: ${k.assignRate}% · Cerradas: ${k.closeRate}% · SLA: ${k.slaPct}% · Conversión: ${k.assignRate}%</td></tr>
<tr><td colspan="4" class="xls-section-title">Indicadores clave</td></tr>
<tr>
  <th class="xls-th">Indicador</th><th class="xls-th">Valor</th><th class="xls-th">Tendencia</th><th class="xls-th">Detalle</th>
</tr>
${
  kpiRows.length
    ? kpiRows
        .map(
          (row, i) =>
            `<tr class="${i === 0 ? "xls-kpi-primary" : row[0] === "Alertas documentales" && k.docRisk ? "xls-kpi-warn" : ""}">
        <td class="xls-td">${reportsBiExcelEsc(row[0])}</td>
        <td class="xls-td">${reportsBiExcelEsc(row[1])}</td>
        <td class="xls-td">${reportsBiExcelEsc(row[2])}</td>
        <td class="xls-td">${reportsBiExcelEsc(row[3])}</td>
      </tr>`
        )
        .join("")
    : `<tr><td class="xls-td" colspan="4">Sin indicadores seleccionados en la vista personalizada.</td></tr>`
}
${
  insightRows.length
    ? `<tr><td colspan="4" class="xls-section-title">Hallazgos automáticos</td></tr>
${insightRows.map((r) => `<tr><td class="xls-td"><strong>${reportsBiExcelEsc(r[0])}</strong></td><td class="xls-td" colspan="3">${reportsBiExcelEsc(r[1])}</td></tr>`).join("")}`
    : ""
}
${
  L.scores.sla || L.scores.assign
    ? `<tr><td colspan="4" class="xls-section-title">Cumplimiento y conversión</td></tr>
<tr>
  ${L.scores.sla ? `<td class="xls-td"><strong>SLA</strong></td><td class="xls-td">${k.slaPct}% (${slaOk}/${slaTotal})</td>` : "<td colspan=\"2\"></td>"}
  ${L.scores.assign ? `<td class="xls-td"><strong>Conversión a viaje</strong></td><td class="xls-td">${k.assignRate}% (${k.trips}/${k.requests})</td>` : "<td colspan=\"2\"></td>"}
</tr>`
    : ""
}
${chartBlocks ? `<tr><td colspan="4" class="xls-section-title">Visualizaciones (gráficas + datos)</td></tr>` : ""}
${chartBlocks}
<tr><td colspan="4" class="xls-meta">Exportado desde Antares · Mismos criterios que el panel BI · ${reportsBiExcelEsc(snapshot.periodLabel)}</td></tr>
<tr><td colspan="4" class="xls-foot">${copyrightText}</td></tr>
</table>
</body></html>`;
}

export function downloadReportsBiExcel(filename, html) {
  const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function wireReportsCharts(snapshot, layout) {
  destroyReportsCharts();
  const root = nodes.viewRoot?.querySelector(".reports-bi");
  if (!root || !window.Chart) return;
  const L = normalizeReportsBiLayout(layout || loadReportsBiLayout());
  const Chart = window.Chart;
  const { text, muted, grid, font, copTooltip } = reportsBiChartTheme();
  const c = reportsBiChartColors();
  const { primaryDeep, success, palette, barPrimary, barDeep, barSuccess, fillPrimary, fillSuccess, funnel } = c;
  const tooltipBg = c.dark ? "rgba(15, 28, 46, 0.96)" : "rgba(255, 255, 255, 0.98)";
  const tooltipBorder = c.dark ? "rgba(131, 190, 233, 0.35)" : "rgba(55, 124, 192, 0.35)";
  const baseOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 480, easing: "easeOutQuart" },
    plugins: {
      legend: { labels: { color: text, font, boxWidth: 12, padding: 12 } },
      tooltip: {
        ...copTooltip,
        backgroundColor: tooltipBg,
        titleColor: text,
        bodyColor: muted,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 10
      }
    }
  };
  const scaleOpts = {
    x: { ticks: { color: muted, font }, grid: { color: grid } },
    y: { ticks: { color: muted, font }, grid: { color: grid } }
  };

  const push = (id, config) => {
    const canvas = root.querySelector(id);
    if (!canvas) return;
    state.reportsChartInstances.push(new Chart(canvas, config));
  };

  const labels = snapshot.revenueLabels || snapshot.revenueMonths;

  if (L.charts.revenue)
    push("#reports-chart-revenue", {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            type: "bar",
            label: "Recaudo COP",
            data: snapshot.revenueSeries,
            backgroundColor: barPrimary,
            borderColor: barPrimary,
            borderRadius: 6,
            yAxisID: "y"
          },
          {
            type: "line",
            label: "Viajes",
            data: snapshot.tripsSeries,
            borderColor: success,
            backgroundColor: fillSuccess,
            fill: true,
            tension: 0.35,
            yAxisID: "y1"
          }
        ]
      },
      options: {
        ...baseOpts,
        scales: {
          x: scaleOpts.x,
          y: { ...scaleOpts.y, position: "left" },
          y1: { position: "right", grid: { drawOnChartArea: false }, ticks: { color: success, font } }
        }
      }
    });

  if (L.charts.weekly)
    push("#reports-chart-weekly", {
      type: "line",
      data: {
        labels: snapshot.weekKeys.map((k, i) => `S${i + 1}`),
        datasets: [
          {
            label: "Viajes / semana",
            data: snapshot.weekSeries,
            borderColor: primaryDeep,
            backgroundColor: fillPrimary,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: primaryDeep
          }
        ]
      },
      options: { ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: false } }, scales: scaleOpts }
    });

  if (L.charts.status)
    push("#reports-chart-status", {
      type: "doughnut",
      data: {
        labels: snapshot.statusChart.map((x) => x.label),
        datasets: [
          {
            data: snapshot.statusChart.map((x) => x.value),
            backgroundColor: palette,
            borderColor: c.dark ? "rgba(15, 28, 46, 0.9)" : "#ffffff",
            borderWidth: 2,
            hoverOffset: 6
          }
        ]
      },
      options: {
        ...baseOpts,
        cutout: "62%",
        plugins: { ...baseOpts.plugins, legend: { position: "bottom", labels: { color: text, font, boxWidth: 10 } } }
      }
    });

  if (L.scores.thermoking)
    push("#reports-chart-thermoking", {
      type: "doughnut",
      data: {
        labels: ["Con Termoking", "Carga seca"],
        datasets: [
          {
            data: [snapshot.thermoking.yes, snapshot.thermoking.no],
            backgroundColor: [c.primaryDeep, c.neutral],
            borderColor: c.dark ? "rgba(15, 28, 46, 0.9)" : "#ffffff",
            borderWidth: 2
          }
        ]
      },
      options: {
        ...baseOpts,
        cutout: "65%",
        plugins: { ...baseOpts.plugins, legend: { position: "bottom", labels: { color: text, font } } }
      }
    });

  const hBar = (id, rows, label, color) => {
    push(id, {
      type: "bar",
      data: {
        labels: rows.map((x) => (x[0].length > 24 ? `${x[0].slice(0, 22)}…` : x[0])),
        datasets: [{ label, data: rows.map((x) => x[1]), backgroundColor: color, borderRadius: 6 }]
      },
      options: { indexAxis: "y", ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: false } }, scales: scaleOpts }
    });
  };

  if (L.charts.clients) hBar("#reports-chart-clients", snapshot.topClients, "COP", barPrimary);
  if (L.charts.routes) hBar("#reports-chart-routes", snapshot.topRoutes, "Viajes", barDeep);
  if (L.charts.drivers) hBar("#reports-chart-drivers", snapshot.topDrivers, "Viajes", barSuccess);

  if (L.charts.funnel)
    push("#reports-chart-funnel", {
      type: "bar",
      data: {
        labels: snapshot.funnel.map((x) => x.label),
        datasets: [{ label: "Cantidad", data: snapshot.funnel.map((x) => x.value), backgroundColor: funnel, borderRadius: 8 }]
      },
      options: {
        ...baseOpts,
        plugins: { legend: { display: false }, tooltip: baseOpts.plugins.tooltip },
        scales: { x: { ...scaleOpts.x, grid: { display: false } }, y: scaleOpts.y }
      }
    });
}

export async function exportReportsBiToExcel(snapshot, root, layout) {
  if (!root) throw new Error("Panel BI no visible");
  const L = normalizeReportsBiLayout(layout || loadReportsBiLayout());
  await loadChartJsLib();
  if (!state.reportsChartInstances?.length) {
    wireReportsCharts(snapshot, L);
  }
  await new Promise((resolve) => setTimeout(resolve, 560));
  const chartImages = reportsBiCaptureChartImages(root);
  const hasAnyChart = Object.values(chartImages).some((src) => String(src || "").startsWith("data:image"));
  if (!hasAnyChart && Object.values(L.charts).some(Boolean)) {
    notify(userMessage("reportBiExcelChartsPending"), "warn");
  }
  const stamp = new Date().toISOString().slice(0, 10);
  const period = String(snapshot.period || "90d");
  const html = buildReportsBiExcelHtml(snapshot, chartImages, L);
  downloadReportsBiExcel(`analitica_operativa_${period}_${stamp}.xls`, html);
}

export function reportsExportFiltersHtml() {
  const filters = normalizeReportsExportFilters(state.reportsUi?.exportFilters);
  return `<section class="reports-export-filters" aria-label="Corte temporal de reportes">
    <div class="reports-export-filters-head">
      <div>
        <p class="reports-export-filters-kicker">Corte exportable</p>
        <h3>Periodo de análisis</h3>
        <p class="reports-export-filters-copy">Este corte se aplica al generar reportes con fecha operativa. Inventarios y cumplimiento documental siguen mostrando estado vigente.</p>
      </div>
      <span class="reports-export-filters-badge">${escapeHtml(reportsPeriodLabel(filters.period))}</span>
    </div>
    <div class="reports-bi-period-chips" role="group" aria-label="Periodo exportable">
      ${reportsExportPeriodChip("30d", "30 d", filters.period)}
      ${reportsExportPeriodChip("90d", "90 d", filters.period)}
      ${reportsExportPeriodChip("month", "Mes", filters.period)}
      ${reportsExportPeriodChip("ytd", "Año", filters.period)}
      ${reportsExportPeriodChip("all", "Todo", filters.period)}
    </div>
  </section>`;
}

export function reportsExportPanelHtml(user) {
  const cards = [
    { id: "executive_control_tower", icon: "activity", title: "Resumen ejecutivo de gestión", subtitle: "Indicadores integrados de operación, finanzas, RRHH y cumplimiento.", group: "Estrategia" },
    { id: "service_levels", icon: "clock", title: "Cumplimiento de nivel de servicio", subtitle: "Tiempos de respuesta, entrega y desviación frente al SLA.", group: "Operación" },
    { id: "fleet_summary", icon: "truck", title: "Disponibilidad y productividad de flota", subtitle: "Estado operativo, cierres históricos y riesgo documental.", group: "Operación" },
    { id: "trips_operations", icon: "compass", title: "Seguimiento operativo de viajes", subtitle: "Control de viajes, modalidad, SLA y facturación asociada.", group: "Operación" },
    { id: "requests_lifecycle", icon: "file", title: "Trazabilidad de solicitudes", subtitle: "Seguimiento integral desde la radicación hasta la decisión final.", group: "Operación" },
    { id: "drivers_performance", icon: "user", title: "Desempeño y habilitación de conductores", subtitle: "Productividad, vigencia documental y cierre de servicios.", group: "Operación" },
    { id: "fuel_operations", icon: "fuel", title: "Consumo y costos de combustible", subtitle: "Litros, costo por litro, odómetro y responsable del pago.", group: "Costos" },
    { id: "maintenance_fleet", icon: "activity", title: "Gestión de mantenimiento de flota", subtitle: "Intervenciones técnicas, costo e impacto por indisponibilidad.", group: "Costos" },
    { id: "revenue_by_route", icon: "dollar", title: "Ingresos y ticket promedio por ruta", subtitle: "Recaudo, clientes atendidos y participación por trayecto.", group: "Finanzas" },
    { id: "request_funnel", icon: "layers", title: "Conversión operativa de solicitudes", subtitle: "Evolución del volumen por etapa del proceso operativo.", group: "Operación" },
    { id: "document_compliance", icon: "shield", title: "Cumplimiento documental de flota", subtitle: "Estado de SOAT, tecnomecánica y alertas por vencimiento.", group: "Cumplimiento" },
    { id: "payroll_summary", icon: "dollar", title: "Consolidado de nómina", subtitle: "Devengados, deducciones, pagos y aprobaciones de gestión humana.", group: "RRHH" },
    { id: "hiring_pipeline", icon: "briefcase", title: "Gestión de selección y contratación", subtitle: "Seguimiento del proceso de reclutamiento, entrevistas y contratación.", group: "RRHH" },
    { id: "labor_compliance", icon: "shield", title: "Cumplimiento laboral y SST", subtitle: "Controles regulatorios, vencimientos y trazabilidad documental.", group: "Cumplimiento" },
    { id: "users_access", icon: "shield", title: "Gobierno de usuarios y accesos", subtitle: "Roles, permisos, origen del usuario e ingreso al sistema.", group: "Gobierno" },
    { id: "authorizations_traceability", icon: "check", title: "Trazabilidad de autorizaciones", subtitle: "Tiempos de resolución, aprobadores y observaciones de cierre.", group: "Gobierno" }
  ];
  const visibleCards = cards.filter((card) => canAccessReport(user, card.id));
  if (!visibleCards.length) {
    return `<p class="muted">Tu perfil no tiene reportes habilitados. Solicita permisos al administrador.</p>`;
  }
  const groups = [...new Set(visibleCards.map((c) => c.group))];
  const sections = groups
    .map((group) => {
      const groupCards = visibleCards.filter((c) => c.group === group);
      return `<div class="reports-export-group">
        <h3 class="reports-export-group-title">${escapeHtml(group)}</h3>
        <div class="dash-grid reports-export-grid">
        ${groupCards
          .map(
            (card) => `
      <article class="p-card reports-card-pro">
        <div class="p-card-header">
          <div class="p-card-header-left">
            <div class="p-card-icon">${ic()[card.icon] || ic().activity}</div>
            <div>
              <h2>${escapeHtml(card.title)}</h2>
              <p class="reports-card-subtitle">${escapeHtml(card.subtitle)}</p>
            </div>
          </div>
        </div>
        <div class="p-card-body">
          <div class="toolbar reports-card-actions">
            <button class="btn btn-sm btn-approve" type="button" data-action="generate-report" data-report="${escapeAttr(card.id)}" data-format="preview" title="Ver en pantalla, sin ventanas emergentes">${ic().eye} Vista previa</button>
            <button class="btn btn-sm btn-action" type="button" data-action="generate-report" data-report="${escapeAttr(card.id)}" data-format="pdf" title="Descarga el reporte en PDF">${ic().download} PDF</button>
            <button class="btn btn-sm btn-action" type="button" data-action="generate-report" data-report="${escapeAttr(card.id)}" data-format="excel" title="Descarga Excel (.xls) con formato corporativo">${ic().file} Excel</button>
          </div>
        </div>
      </article>`
          )
          .join("")}
        </div>
      </div>`;
    })
    .join("");
  return reportsExportFiltersHtml() + sections;
}

export function dateInRange(value, range) {
  if (!range) return false;
  const ts = new Date(value || "").getTime();
  if (!Number.isFinite(ts)) return false;
  return ts >= range.start.getTime() && ts <= range.end.getTime();
}

const PORTAL_VEHICLE_TYPE_OPTIONS = ["Camion", "Turbo", "Tractomula", "Bus"];

/** Fila de vehículo lista para modales de edición / ficha (catálogos y fechas YYYY-MM-DD). */
export function normalizeVehicleRowForEditor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const v = { ...raw };
  v.color = matchCatalogOptionValue(CO_CATALOGS.vehicleColors, v.color);
  v.bodyType = matchCatalogOptionValue(CO_CATALOGS.bodyTypes, v.bodyType);
  v.fuelType = matchCatalogOptionValue(CO_CATALOGS.fuelTypes, v.fuelType);
  v.axleConfig = matchCatalogOptionValue(CO_CATALOGS.axleConfig, v.axleConfig);
  const typeRaw = String(v.type || "").trim();
  v.type =
    PORTAL_VEHICLE_TYPE_OPTIONS.find((t) => t.toLowerCase() === typeRaw.toLowerCase()) || typeRaw;
  v.soatExpeditionDate = normalizePortalDateYmd(v.soatExpeditionDate);
  v.soatExpiryDate = normalizePortalDateYmd(v.soatExpiryDate);
  v.techInspectionExpeditionDate = normalizePortalDateYmd(v.techInspectionExpeditionDate);
  v.techInspectionExpiryDate = normalizePortalDateYmd(v.techInspectionExpiryDate);
  v.rcPolicyExpiry = normalizePortalDateYmd(v.rcPolicyExpiry);
  return v;
}

/** Estado del curso defensivo para selects del portal (`vigente` | `vencido` | `no_aplica`). */
export function normalizeDefensiveCourseForPortal(raw) {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (v === "vigente" || v === "vencido" || v === "no_aplica") return v;
  if (/vencid/.test(v)) return "vencido";
  if (/no\s*aplica/.test(v)) return "no_aplica";
  if (/vigent/.test(v)) return "vigente";
  return "";
}

/**
 * Fila de conductor lista para modales de edición: fechas en YYYY-MM-DD, alias API↔portal
 * y campos que solo viven en RRHH (tipo sangre, EPS, ARL) si el documento coincide.
 */
export function normalizeDriverRowForEditor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const d = { ...raw };
  const occD = d.occupationalExamDate ?? d.psychoTestDate ?? d.psychometricExamDate;
  const intraD = d.instruvialExamDate ?? d.intravehicularExamDate;
  d.occupationalExamDate = normalizePortalDateYmd(occD);
  d.instruvialExamDate = normalizePortalDateYmd(intraD);
  d.occupationalExamExpiry = normalizePortalDateYmd(
    d.occupationalExamExpiry ?? d.psychoTestExpiry ?? d.psychometricExpiry
  );
  d.instruvialExamExpiry = normalizePortalDateYmd(d.instruvialExamExpiry);
  if (d.occupationalExamDate && !d.occupationalExamExpiry) {
    d.occupationalExamExpiry = addOneYearToYmd(d.occupationalExamDate);
  }
  if (d.instruvialExamDate && !d.instruvialExamExpiry) {
    d.instruvialExamExpiry = addOneYearToYmd(d.instruvialExamDate);
  }
  d.psychoTestDate = d.occupationalExamDate;
  d.psychoTestExpiry = d.occupationalExamExpiry;
  d.licenseExpiry = normalizePortalDateYmd(d.licenseExpiry);
  d.defensiveCourseExpiry = normalizePortalDateYmd(d.defensiveCourseExpiry);

  const emp = globalThis.findPayrollEmployeeByIdDoc(d.idDoc);
  if (emp && typeof emp === "object") {
    const fill = (key) => {
      const cur = d[key];
      const empty = cur == null || (typeof cur === "string" && !String(cur).trim());
      if (empty && emp[key] != null && String(emp[key]).trim() !== "") d[key] = emp[key];
    };
    fill("bloodType");
    fill("eps");
    fill("arl");
    fill("comparendos");
    fill("experienceYears");
    fill("defensiveCourse");
    fill("defensiveCourseExpiry");
    fill("emergencyContact");
    fill("emergencyPhone");
    fill("license");
    fill("licenseCategory");
    fill("licenseExpiry");
    fill("occupationalExamDate");
    fill("occupationalExamExpiry");
    fill("instruvialExamDate");
    fill("instruvialExamExpiry");
    if (!String(d.photoUrl || "").trim()) {
      const av = String(emp.avatarUrl || emp.photoUrl || "").trim();
      if (av) d.photoUrl = av;
    }
  }

  const defPick =
    d.defensiveCourse != null && String(d.defensiveCourse).trim() !== ""
      ? d.defensiveCourse
      : d.defensiveDrivingCourse;
  d.defensiveCourse = normalizeDefensiveCourseForPortal(defPick);
  d.bloodType = matchCatalogOptionValue(CO_CATALOGS.bloodTypes, d.bloodType);
  d.licenseCategory = matchCatalogOptionValue(CO_CATALOGS.licenseCategories, d.licenseCategory);
  d.eps = matchCatalogOptionValue(CO_CATALOGS.eps, d.eps);
  d.arl = matchCatalogOptionValue(CO_CATALOGS.arl, d.arl);
  d.licenseExpiry = normalizePortalDateYmd(d.licenseExpiry);
  d.defensiveCourseExpiry = normalizePortalDateYmd(d.defensiveCourseExpiry);
  d.occupationalExamDate = normalizePortalDateYmd(d.occupationalExamDate);
  d.instruvialExamDate = normalizePortalDateYmd(d.instruvialExamDate);
  if (d.occupationalExamDate && !d.occupationalExamExpiry) {
    d.occupationalExamExpiry = addOneYearToYmd(d.occupationalExamDate);
  }
  if (d.instruvialExamDate && !d.instruvialExamExpiry) {
    d.instruvialExamExpiry = addOneYearToYmd(d.instruvialExamDate);
  }
  const phoneDisp = formatPortalPhoneForDisplay(d.phone);
  if (phoneDisp) d.phone = phoneDisp;
  return d;
}

/** Normaliza payload de formulario de conductor antes de persistir (alta o edición). */
export function normalizeDriverFormPayloadForStorage(data) {
  if (!data || typeof data !== "object") return data;
  const d = { ...data };
  if (d.name != null) d.name = normalizeLatinUpperForDb(d.name);
  if (d.address != null) d.address = normalizeLatinUpperForDb(d.address);
  if (d.department != null) d.department = latinForDb(d.department);
  if (d.city != null) d.city = latinForDb(d.city);
  if (d.eps != null) d.eps = matchCatalogOptionValue(CO_CATALOGS.eps, d.eps);
  if (d.arl != null) d.arl = matchCatalogOptionValue(CO_CATALOGS.arl, d.arl);
  if (d.emergencyContact != null) d.emergencyContact = normalizeLatinUpperForDb(d.emergencyContact);
  if (d.bloodType != null) d.bloodType = matchCatalogOptionValue(CO_CATALOGS.bloodTypes, d.bloodType);
  d.phone = normalizePortalPhoneForStorage(d.phone);
  d.emergencyPhone = normalizePortalPhoneForStorage(d.emergencyPhone);
  d.licenseExpiry = normalizePortalDateYmd(d.licenseExpiry);
  const occDate = normalizePortalDateYmd(d.occupationalExamDate);
  const intraDate = normalizePortalDateYmd(d.instruvialExamDate);
  d.occupationalExamDate = occDate;
  d.instruvialExamDate = intraDate;
  d.occupationalExamExpiry = occDate
    ? addOneYearToYmd(occDate)
    : normalizePortalDateYmd(d.occupationalExamExpiry);
  d.instruvialExamExpiry = intraDate
    ? addOneYearToYmd(intraDate)
    : normalizePortalDateYmd(d.instruvialExamExpiry);
  d.psychoTestDate = occDate;
  d.psychoTestExpiry = occDate ? addOneYearToYmd(occDate) : "";
  d.defensiveCourseExpiry = normalizePortalDateYmd(d.defensiveCourseExpiry);
  return d;
}

/** GH → Conductores: todos los campos del empleado que existen en la ficha de flota (sin pisar disponible/ocupado). */
export function buildDriverPatchFromEmployee(employee, extraDriverData = {}) {
  const doc = String(employee?.idDoc || "").trim();
  const occ = normalizePortalDateYmd(
    pickFirstNonEmpty(
      employee?.occupationalExamDate,
      employee?.psychoTestDate,
      employee?.psychometricExamDate,
      extraDriverData.occupationalExamDate,
      extraDriverData.psychoTestDate
    )
  );
  const intra = normalizePortalDateYmd(
    pickFirstNonEmpty(
      employee?.instruvialExamDate,
      employee?.intravehicularExamDate,
      extraDriverData.instruvialExamDate,
      extraDriverData.intravehicularExamDate
    )
  );
  const occEx = occ ? addOneYearToYmd(occ) : normalizePortalDateYmd(employee?.occupationalExamExpiry);
  const intraEx = intra ? addOneYearToYmd(intra) : normalizePortalDateYmd(employee?.instruvialExamExpiry);
  const photo = pickFirstNonEmpty(employee?.avatarUrl, employee?.photoUrl, extraDriverData.photoUrl);
  return {
    name: String(employee?.name || "").trim(),
    documentType: String(employee?.documentType || "CC").trim() || "CC",
    idDoc: doc,
    phone: String(employee?.phone || "").trim(),
    city: String(employee?.city || "").trim(),
    department: String(employee?.department || "").trim(),
    address: String(employee?.address || "").trim(),
    emergencyContact: String(employee?.emergencyContact || "").trim(),
    emergencyPhone: String(employee?.emergencyPhone || "").trim(),
    companyId: String(employee?.companyId || "").trim(),
    bloodType: String(employee?.bloodType || "").trim(),
    license: String(extraDriverData.license || employee?.license || "").trim(),
    licenseCategory: String(extraDriverData.licenseCategory || employee?.licenseCategory || "C2").trim(),
    licenseExpiry: normalizePortalDateYmd(extraDriverData.licenseExpiry || employee?.licenseExpiry),
    occupationalExamDate: occ,
    occupationalExamExpiry: occEx,
    instruvialExamDate: intra,
    instruvialExamExpiry: intraEx,
    psychoTestDate: occ,
    psychoTestExpiry: occEx,
    defensiveCourse: String(employee?.defensiveCourse || "").trim(),
    defensiveCourseExpiry: normalizePortalDateYmd(employee?.defensiveCourseExpiry),
    eps: String(employee?.eps || "").trim(),
    arl: String(employee?.arl || "").trim(),
    comparendos: parseNum(employee?.comparendos ?? 0),
    experienceYears: parseNum(employee?.experienceYears ?? 0),
    photoUrl: photo,
    contractType: String(employee?.contractType || "").trim(),
    baseSalary: parseNum(employee?.baseSalary ?? 0),
    startDate: normalizePortalDateYmd(employee?.startDate)
  };
}

export function buildEmployeeBasicPatchFromDriver(driver) {
  const occ = normalizePortalDateYmd(driver?.occupationalExamDate);
  const intra = normalizePortalDateYmd(driver?.instruvialExamDate);
  const occEx = occ ? addOneYearToYmd(occ) : normalizePortalDateYmd(driver?.occupationalExamExpiry);
  const intraEx = intra ? addOneYearToYmd(intra) : normalizePortalDateYmd(driver?.instruvialExamExpiry);
  const avatar = pickFirstNonEmpty(driver?.photoUrl, driver?.avatarUrl);
  return {
    name: String(driver?.name || "").trim(),
    phone: String(driver?.phone || "").trim(),
    city: String(driver?.city || "").trim(),
    department: String(driver?.department || "").trim(),
    address: String(driver?.address || "").trim(),
    emergencyContact: String(driver?.emergencyContact || "").trim(),
    emergencyPhone: String(driver?.emergencyPhone || "").trim(),
    bloodType: String(driver?.bloodType || "").trim(),
    license: String(driver?.license || "").trim(),
    licenseCategory: String(driver?.licenseCategory || "").trim(),
    licenseExpiry: normalizePortalDateYmd(driver?.licenseExpiry),
    occupationalExamDate: occ,
    occupationalExamExpiry: occEx,
    instruvialExamDate: intra,
    instruvialExamExpiry: intraEx,
    psychoTestDate: occ,
    psychoTestExpiry: occEx,
    defensiveCourse: String(driver?.defensiveCourse || "").trim(),
    defensiveCourseExpiry: normalizePortalDateYmd(driver?.defensiveCourseExpiry),
    eps: String(driver?.eps || "").trim(),
    arl: String(driver?.arl || "").trim(),
    comparendos: parseNum(driver?.comparendos ?? 0),
    experienceYears: parseNum(driver?.experienceYears ?? 0),
    avatarUrl: avatar
  };
}

/** Gestión humana → Conductores: copia la ficha operativa del empleado; conserva disponibilidad y ocupación. */
export async function syncDriverFromEmployee(employee, extraDriverData = {}) {
  if (!employee || String(employee.workerRole || "") !== "conductor") {
    return { ok: true, skipped: true };
  }
  const drivers = read(KEYS.drivers, []);
  const doc = String(employee.idDoc || "").trim();
  const existing = drivers.find((d) => normalizeDocumentDigits(d.idDoc) === normalizeDocumentDigits(doc));
  const driverPatch = buildDriverPatchFromEmployee(employee, extraDriverData);
  if (!driverPatch.license || !driverPatch.licenseExpiry) {
    return { ok: false, message: userMessage("payrollDriverLicenseSync") };
  }
  if (new Date(driverPatch.licenseExpiry).getTime() <= Date.now()) {
    return { ok: false, message: userMessage("payrollLicenseExpired") };
  }
  try {
    if (existing) {
      const nextDrivers = drivers.map((d) =>
        d.id === existing.id
          ? stampUpdatedRecord({
              ...d,
              ...driverPatch,
              id: existing.id,
              available: d.available !== false,
              autoBusy: d.autoBusy,
              hiredAt: d.hiredAt || employee.hiredAt || employee.startDate || nowIso()
            })
          : d
      );
      await writeAwaitServer(KEYS.drivers, nextDrivers, {
        notifyOnFailure: false,
        syncData: syncPayloadForEditedRow(nextDrivers, existing.id)
      });
      return { ok: true, driverId: existing.id };
    }
    const newId = newUuidV4();
    const createdDriver = stampCreatedRecord({
      id: newId,
      ...driverPatch,
      available: true,
      hiredAt: employee.hiredAt || employee.startDate || nowIso()
    });
    await writeAwaitServerCreate(KEYS.drivers, [createdDriver, ...drivers], createdDriver, {
      notifyOnFailure: false
    });
    return { ok: true, driverId: newId };
  } catch (err) {
    return {
      ok: false,
      message: String(err?.message || "No fue posible sincronizar la ficha de conductor en el servidor.")
    };
  }
}