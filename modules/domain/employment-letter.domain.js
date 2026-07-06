/**
 * Carta y certificado laboral (Colombia).
 * - Constancia de vinculación vigente (práctica habitual ante entidades crediticias y terceros).
 * - Certificado al retiro (CST art. 57: duración, monto, naturaleza de las labores y causa).
 */
import {
  KEYS,
  CONTRACT_LEGAL_REP_NAME,
  CONTRACT_LEGAL_REP_ID_DOC
} from "../core/config.js";
import { read } from "../core/data-io.js";
import { colombiaTodayIsoDate } from "../core/utils.js";
import { formatContractNoticeDateEs, normalizeContractRenewalYmd } from "./contract-renewal.logic.js";
import {
  CO_TERMINATION_CAUSE_LABELS,
  calcColombiaTerminationEmployedDays
} from "./payroll-colombia-termination.domain.js";
import { employeeIsConductorServiceProvider } from "./nomina.domain.js";
import {
  blobToDataUrl,
  contractLegalRepSignatureSrc,
  downloadBlobFile,
  ensureJsPdfLoaded
} from "./reporteria.domain.js";

export { CO_TERMINATION_CAUSE_LABELS };

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function parseYmd(raw) {
  const n = normalizeContractRenewalYmd(raw);
  if (!n) return null;
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(n);
  if (!p) return null;
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]), 12, 0, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function escapeEmploymentLetterHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function resolveEmploymentLetterCompany(employee) {
  const companies = read(KEYS.companies, []);
  const companyId = String(employee?.companyId || "").trim();
  const company = companies.find((row) => String(row.id) === companyId) || companies[0] || {};
  const city = String(company.city || employee?.city || "").trim();
  const department = String(company.department || employee?.department || "").trim();
  const cityLine = city && department && !city.toLowerCase().includes(department.toLowerCase())
    ? `${city}, ${department}`
    : city || department || "Colombia";
  return {
    name: String(company.name || "Transportes Antares").trim(),
    nit: String(company.taxId || company.nit || "").trim(),
    address: String(company.address || "").trim(),
    city,
    department,
    cityLine,
    phone: String(company.phone || "").trim(),
    email: String(company.email || "").trim()
  };
}

/** Tiempo de servicio en lenguaje natural (ingreso → fecha de corte inclusive). */
export function formatEmploymentServiceTimeEs(hireDateYmd, endDateYmd) {
  const hire = parseYmd(hireDateYmd);
  const end = parseYmd(endDateYmd);
  if (!hire || !end || end < hire) return "—";
  let years = end.getFullYear() - hire.getFullYear();
  let months = end.getMonth() - hire.getMonth();
  let days = end.getDate() - hire.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const parts = [];
  if (years > 0) parts.push(`${years} año${years === 1 ? "" : "s"}`);
  if (months > 0) parts.push(`${months} mes${months === 1 ? "" : "es"}`);
  if (days > 0 || !parts.length) parts.push(`${Math.max(days, 0)} día${days === 1 ? "" : "s"}`);
  const calendarDays = calcColombiaTerminationEmployedDays(hireDateYmd, endDateYmd);
  return `${parts.join(", ")} (${calendarDays.toLocaleString("es-CO")} días calendario)`;
}

export function buildEmploymentLetterMeta(employee, opts = {}) {
  const e = employee || {};
  const company = resolveEmploymentLetterCompany(e);
  const letterKind = String(opts.letterKind || "vigente").trim().toLowerCase() === "retiro" ? "retiro" : "vigente";
  const letterDate = normalizeContractRenewalYmd(opts.letterDate) || colombiaTodayIsoDate();
  const hireYmd = normalizeContractRenewalYmd(e.startDate || e.contractVigenteStartDate);
  const terminationDate =
    letterKind === "retiro"
      ? normalizeContractRenewalYmd(opts.terminationDate) || letterDate
      : letterDate;
  const addressee = String(opts.addressee || "A quien interese").trim() || "A quien interese";
  const includeSalary = opts.includeSalary !== false;
  const includeSocialSecurity = opts.includeSocialSecurity !== false;
  const terminationCause = String(opts.terminationCause || "otro").trim().toLowerCase();
  const causeLabel = CO_TERMINATION_CAUSE_LABELS[terminationCause] || CO_TERMINATION_CAUSE_LABELS.otro;
  const baseSalary = parseNum(e.baseSalary);
  const transportAllowance = parseNum(e.transportAllowance ?? e.auxilioTransporte);
  const salaryText =
    baseSalary > 0
      ? `$${Math.round(baseSalary).toLocaleString("es-CO")} mensuales`
      : "No registrado en expediente";
  const transportText =
    transportAllowance > 0
      ? `$${Math.round(transportAllowance).toLocaleString("es-CO")} mensuales (auxilio de transporte legal cuando aplica)`
      : "";
  const contractType = String(e.contractType || "Término indefinido").trim();
  const workSchedule = String(e.workSchedule || "Diurna").trim();
  const isServiceProvider = employeeIsConductorServiceProvider(e);

  return {
    letterKind,
    letterDate,
    letterDateLabel: formatContractNoticeDateEs(letterDate) || letterDate,
    hireYmd,
    hireLabel: formatContractNoticeDateEs(hireYmd) || hireYmd || "—",
    terminationDate,
    terminationLabel: formatContractNoticeDateEs(terminationDate) || terminationDate,
    serviceTime: hireYmd ? formatEmploymentServiceTimeEs(hireYmd, terminationDate) : "—",
    addressee,
    includeSalary,
    includeSocialSecurity,
    terminationCause,
    causeLabel,
    company,
    name: String(e.name || "").trim(),
    docType: String(e.documentType || "C.C.").trim(),
    idDoc: String(e.idDoc || "").trim(),
    position: String(e.position || "—").trim(),
    contractType,
    workSchedule,
    isServiceProvider,
    salaryText,
    transportText,
    eps: String(e.eps || "—").trim(),
    pensionFund: String(e.pensionFund || "—").trim(),
    arl: String(e.arl || "—").trim(),
    contractEndLabel: formatContractNoticeDateEs(e.contractEndDate) || String(e.contractEndDate || "").trim()
  };
}

export function validateEmploymentLetterRequest(employee, fields = {}) {
  const e = employee || {};
  if (!String(e.name || "").trim()) {
    return { ok: false, message: "Complete el nombre del colaborador en la ficha." };
  }
  if (!String(e.idDoc || "").trim()) {
    return { ok: false, message: "Complete el documento de identidad del colaborador." };
  }
  if (!normalizeContractRenewalYmd(e.startDate)) {
    return { ok: false, message: "Registre la fecha de ingreso del colaborador antes de generar la carta." };
  }
  const letterKind = String(fields.letterKind || "vigente").trim().toLowerCase();
  const letterDate = normalizeContractRenewalYmd(fields.letterDate);
  if (!letterDate) {
    return { ok: false, field: "letterDate", message: "Indique la fecha del documento." };
  }
  if (letterKind === "retiro") {
    const term = normalizeContractRenewalYmd(fields.terminationDate);
    if (!term) {
      return { ok: false, field: "terminationDate", message: "Indique la fecha de retiro para el certificado (CST art. 57)." };
    }
    if (term < normalizeContractRenewalYmd(e.startDate)) {
      return { ok: false, field: "terminationDate", message: "La fecha de retiro no puede ser anterior al ingreso." };
    }
  }
  return { ok: true, letterKind: letterKind === "retiro" ? "retiro" : "vigente", letterDate };
}

function employmentLetterFileSlug(meta) {
  const kind = meta.letterKind === "retiro" ? "certificado_retiro" : "carta_vigente";
  const safeName = String(meta.name || "colaborador")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return `carta_laboral_${kind}_${safeName || "colaborador"}`;
}

export function employmentLetterFileName(employee, opts = {}, ext = "pdf") {
  const meta = buildEmploymentLetterMeta(employee, opts);
  return `${employmentLetterFileSlug(meta)}.${String(ext || "pdf").replace(/^\./, "")}`;
}

/** Contenido plano reutilizable para HTML, PDF y Word. */
export function buildEmploymentLetterPlainDocument(employee, opts = {}) {
  const meta = buildEmploymentLetterMeta(employee, opts);
  const company = meta.company;
  const employerId = company.nit ? `, identificada con NIT ${company.nit}` : "";
  const domicile = company.address
    ? ` con domicilio en ${company.address}${company.cityLine ? `, ${company.cityLine}` : ""}`
    : company.cityLine
      ? ` con sede en ${company.cityLine}`
      : "";

  if (meta.letterKind === "retiro") {
    const employerNit = company.nit ? `, NIT ${company.nit}` : "";
    const paragraphs = [
      meta.addressee,
      `En cumplimiento del artículo 57 del Código Sustantivo del Trabajo, ${company.name}${employerNit} certifica que el(la) señor(a) ${meta.name}, identificado(a) con ${meta.docType} No. ${meta.idDoc}, prestó sus servicios en el cargo de ${meta.position}, con jornada ${meta.workSchedule} y tipo de vinculación ${meta.contractType}.`,
      `Duración del vínculo: desde el ${meta.hireLabel} hasta el ${meta.terminationLabel} (${meta.serviceTime}).`,
      `Naturaleza y calidad de las labores: funciones propias del cargo de ${meta.position} en el giro ordinario del empleador.`,
      `Monto de las labores: ${meta.salaryText}${meta.transportText ? ` · ${meta.transportText}` : ""}.`,
      `Causa del retiro: ${meta.causeLabel}.`
    ];
    if (meta.includeSocialSecurity) {
      paragraphs.push(
        `Afiliaciones en seguridad social: EPS ${meta.eps}, fondo de pensiones ${meta.pensionFund} y ARL ${meta.arl}.`
      );
    }
    paragraphs.push(
      "Se expide el presente certificado a solicitud del interesado, sin perjuicio de las obligaciones pendientes de liquidación, pago de prestaciones y entrega de soportes que correspondan conforme al ordenamiento laboral colombiano."
    );
    return {
      title: "CERTIFICADO LABORAL",
      metaLine: `${company.cityLine || "Colombia"}, ${meta.letterDateLabel}`,
      paragraphs,
      closing: "Atentamente,",
      disclaimer: employmentLetterDisclaimer("retiro"),
      fileName: employmentLetterFileName(employee, opts, "pdf"),
      fileNameDocx: employmentLetterFileName(employee, opts, "docx"),
      signature: {
        name: CONTRACT_LEGAL_REP_NAME,
        idDoc: CONTRACT_LEGAL_REP_ID_DOC,
        role: "Representante legal",
        company: company.name
      }
    };
  }

  const contractDetail =
    meta.contractType === "Termino fijo" && meta.contractEndLabel
      ? ` mediante contrato a término fijo con vencimiento el ${meta.contractEndLabel}`
      : ` mediante contrato ${meta.contractType.toLowerCase()}`;
  const linkVerb = meta.isServiceProvider ? "presta sus servicios profesionales" : "se encuentra vinculado(a) laboralmente";

  const paragraphs = [
    meta.addressee,
    `${company.name}${employerId}${domicile}, certifica que el(la) señor(a) ${meta.name}, identificado(a) con ${meta.docType} No. ${meta.idDoc}, ${linkVerb} con nuestra organización${contractDetail}, desempeñando el cargo de ${meta.position}.`,
    `Fecha de ingreso: ${meta.hireLabel}.`,
    `Tiempo de servicio a la fecha: ${meta.serviceTime}.`,
    `Tipo de contrato: ${meta.contractType}. Jornada laboral: ${meta.workSchedule}.`
  ];
  if (meta.includeSalary) {
    let salaryLine = `Remuneración mensual: ${meta.salaryText}.`;
    if (meta.transportText) salaryLine += ` Auxilio de transporte: ${meta.transportText}.`;
    paragraphs.push(salaryLine);
  }
  if (meta.includeSocialSecurity) {
    paragraphs.push(
      `Afiliaciones vigentes en seguridad social: EPS ${meta.eps}, fondo de pensiones ${meta.pensionFund} y ARL ${meta.arl}, conforme a la normatividad colombiana.`
    );
  }
  paragraphs.push(
    "A la fecha de expedición de la presente constancia, la vinculación se encuentra vigente. Este documento se expide a solicitud del interesado, para los fines que estime convenientes, en aplicación de las obligaciones de información del empleador previstas en el Código Sustantivo del Trabajo y la normativa laboral colombiana vigente."
  );

  return {
    title: "CONSTANCIA DE VINCULACIÓN LABORAL",
    metaLine: `${company.cityLine || "Colombia"}, ${meta.letterDateLabel}`,
    paragraphs,
    closing: "Atentamente,",
    disclaimer: employmentLetterDisclaimer("vigente"),
    fileName: employmentLetterFileName(employee, opts, "pdf"),
    fileNameDocx: employmentLetterFileName(employee, opts, "docx"),
    signature: {
      name: CONTRACT_LEGAL_REP_NAME,
      idDoc: CONTRACT_LEGAL_REP_ID_DOC,
      role: "Representante legal",
      company: company.name
    }
  };
}

function escapeXml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function docxParagraph(text, { bold = false, center = false, spacingAfter = 160 } = {}) {
  const align = center ? "<w:jc w:val=\"center\"/>" : "";
  const boldTag = bold ? "<w:b/>" : "";
  return `<w:p><w:pPr>${align}<w:spacing w:after="${spacingAfter}"/></w:pPr><w:r><w:rPr>${boldTag}<w:sz w:val="24"/><w:szCs w:val="24"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function employmentLetterDisclaimer(kind) {
  const base =
    "Documento generado desde Antares con la firma digitalizada del representante legal registrada en el sistema.";
  const stamp = " Estampe sello de la empresa únicamente si la entidad receptora lo exige.";
  if (kind === "retiro") {
    return `${base}${stamp} Valide causal, montos y finiquito con abogado laboral antes de entregar (CST art. 57).`;
  }
  return `${base}${stamp} No sustituye asesoría jurídica.`;
}

/** Carga la firma del representante legal (misma imagen que contratos y desprendibles). */
async function fetchLegalRepSignatureAsset() {
  const src = contractLegalRepSignatureSrc();
  if (/^data:image\/[a-z0-9+.-]+;base64,/i.test(src)) {
    const match = /^data:image\/([a-z0-9+.-]+);base64,(.+)$/i.exec(src);
    if (!match) return null;
    const ext = match[1].toLowerCase().replace("jpeg", "jpg") === "png" ? "png" : "jpg";
    const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
    return {
      dataUrl: src,
      bytes,
      ext,
      mime: ext === "png" ? "image/png" : "image/jpeg",
      pdfFormat: ext === "png" ? "PNG" : "JPEG"
    };
  }
  try {
    const res = await fetch(src, { credentials: "same-origin", cache: "force-cache" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const mime = String(blob.type || "image/jpeg").toLowerCase();
    const ext = mime.includes("png") ? "png" : "jpg";
    const buffer = await blob.arrayBuffer();
    const dataUrl = await blobToDataUrl(blob);
    return {
      dataUrl,
      bytes: new Uint8Array(buffer),
      ext,
      mime: ext === "png" ? "image/png" : "image/jpeg",
      pdfFormat: ext === "png" ? "PNG" : "JPEG"
    };
  } catch (_e) {
    return null;
  }
}

function pdfDetectImageFormat(dataUrl, fallback = "JPEG") {
  const match = /^data:image\/([a-z0-9+.-]+);/i.exec(String(dataUrl || ""));
  const fmt = String(match?.[1] || "").toLowerCase();
  if (fmt === "png") return "PNG";
  if (fmt === "jpg" || fmt === "jpeg") return "JPEG";
  return fallback;
}

function appendLetterSignatureToPdf(pdf, doc, signatureAsset, y, pageWidth) {
  const sigWidth = 158;
  const sigHeight = 56;
  const centerX = pageWidth / 2;

  if (signatureAsset?.dataUrl) {
    try {
      pdf.addImage(
        signatureAsset.dataUrl,
        signatureAsset.pdfFormat || pdfDetectImageFormat(signatureAsset.dataUrl),
        centerX - sigWidth / 2,
        y,
        sigWidth,
        sigHeight
      );
      y += sigHeight + 6;
      pdf.setDrawColor(17, 17, 17);
      pdf.setLineWidth(0.6);
      pdf.line(centerX - sigWidth * 0.44, y, centerX + sigWidth * 0.44, y);
      y += 14;
    } catch (_e) {
      pdf.setFont("times", "normal");
      pdf.setFontSize(10);
      pdf.text("_______________________________________", centerX, y, { align: "center" });
      y += 16;
    }
  } else {
    pdf.setFont("times", "normal");
    pdf.setFontSize(10);
    pdf.text("_______________________________________", centerX, y, { align: "center" });
    y += 16;
  }

  pdf.setFont("times", "bold");
  pdf.setFontSize(10);
  pdf.text(doc.signature.name, centerX, y, { align: "center" });
  y += 14;
  pdf.setFont("times", "normal");
  pdf.text(doc.signature.idDoc, centerX, y, { align: "center" });
  y += 14;
  pdf.text(`${doc.signature.role} · ${doc.signature.company}`, centerX, y, { align: "center" });
  return y + 24;
}

function docxSignatureImageParagraph(relId, widthEmu = 1920960, heightEmu = 685800) {
  return `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing>
    <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
      <wp:extent cx="${widthEmu}" cy="${heightEmu}"/>
      <wp:docPr id="99001" name="Firma representante legal"/>
      <wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/></wp:cNvGraphicFramePr>
      <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
          <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:nvPicPr><pic:cNvPr id="99002" name="firma-representante-legal"/><pic:cNvPicPr/></pic:nvPicPr>
            <pic:blipFill>
              <a:blip r:embed="${relId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
              <a:stretch><a:fillRect/></a:stretch>
            </pic:blipFill>
            <pic:spPr>
              <a:xfrm><a:off x="0" y="0"/><a:ext cx="${widthEmu}" cy="${heightEmu}"/></a:xfrm>
              <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            </pic:spPr>
          </pic:pic>
        </a:graphicData>
      </a:graphic>
    </wp:inline>
  </w:drawing></w:r></w:p>`;
}

function buildEmploymentLetterDocxXml(doc, { signatureRelId = "" } = {}) {
  const signatureParts = signatureRelId
    ? [
        docxSignatureImageParagraph(signatureRelId),
        docxParagraph("_______________________________________", { center: true, spacingAfter: 60 })
      ]
    : [docxParagraph("_______________________________________", { center: true, spacingAfter: 80 })];
  const body = [
    docxParagraph(doc.title, { bold: true, center: true, spacingAfter: 240 }),
    docxParagraph(doc.metaLine, { spacingAfter: 200 }),
    ...doc.paragraphs.map((p) => docxParagraph(p)),
    docxParagraph(doc.closing, { spacingAfter: 240 }),
    ...signatureParts,
    docxParagraph(doc.signature.name, { bold: true, center: true, spacingAfter: 40 }),
    docxParagraph(doc.signature.idDoc, { center: true, spacingAfter: 40 }),
    docxParagraph(`${doc.signature.role} · ${doc.signature.company}`, { center: true, spacingAfter: 200 }),
    docxParagraph(doc.disclaimer, { spacingAfter: 120 })
  ].join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1417" w:right="1417" w:bottom="1417" w:left="1417"/></w:sectPr></w:body>
</w:document>`;
}

async function ensureJsZipForLetter() {
  if (window.RecruitmentDomain?.ensureJsZip) return window.RecruitmentDomain.ensureJsZip();
  throw new Error("JSZip no disponible: recargue la página.");
}

/** Descarga la carta laboral como Word (.docx). */
export async function downloadEmploymentLetterDocx(employee, opts = {}) {
  const doc = buildEmploymentLetterPlainDocument(employee, opts);
  const signatureAsset = await fetchLegalRepSignatureAsset();
  const JSZip = await ensureJsZipForLetter();
  const zip = new JSZip();
  const hasSignature = Boolean(signatureAsset?.bytes?.length);
  const signatureRelId = hasSignature ? "rId2" : "";
  const signatureExt = signatureAsset?.ext || "jpg";
  const signatureMime = signatureAsset?.mime || "image/jpeg";

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${hasSignature ? `<Default Extension="${signatureExt}" ContentType="${signatureMime}"/>` : ""}
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );
  zip.folder("_rels")?.file(
    ".rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );
  if (hasSignature) {
    zip.folder("word")?.folder("media")?.file(`image1.${signatureExt}`, signatureAsset.bytes);
  }
  zip.folder("word")?.file("document.xml", buildEmploymentLetterDocxXml(doc, { signatureRelId }));
  zip.folder("word")?.folder("_rels")?.file(
    "document.xml.rels",
    hasSignature
      ? `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.${signatureExt}"/>
</Relationships>`
      : `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`
  );
  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlobFile(doc.fileNameDocx, blob, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  return { ok: true, fileName: doc.fileNameDocx, signed: hasSignature };
}

function pdfWriteParagraph(pdf, text, x, y, maxWidth, { fontSize = 11, bold = false, lineHeight = 15, align = "left" } = {}) {
  pdf.setFont("times", bold ? "bold" : "normal");
  pdf.setFontSize(fontSize);
  const lines = pdf.splitTextToSize(String(text || ""), maxWidth);
  lines.forEach((line) => {
    if (align === "center") pdf.text(line, x, y, { align: "center" });
    else pdf.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

/** Descarga la carta laboral como PDF. */
export async function downloadEmploymentLetterPdf(employee, opts = {}) {
  const doc = buildEmploymentLetterPlainDocument(employee, opts);
  const jsPdfCtor = await ensureJsPdfLoaded();
  const pdf = new jsPdfCtor({ unit: "pt", format: "a4", compress: true });
  const margin = 56;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  let y = margin + 8;

  pdf.setProperties({
    title: doc.title,
    subject: "Carta laboral",
    author: doc.signature.company,
    creator: "Antares"
  });

  y = pdfWriteParagraph(pdf, doc.title, pageWidth / 2, y, maxWidth, {
    fontSize: 14,
    bold: true,
    lineHeight: 18,
    align: "center"
  });
  y += 6;
  y = pdfWriteParagraph(pdf, doc.metaLine, margin, y, maxWidth, { fontSize: 11 });
  y += 8;

  doc.paragraphs.forEach((paragraph, idx) => {
    const isAddressee = idx === 0;
    y = pdfWriteParagraph(pdf, paragraph, margin, y, maxWidth, { bold: isAddressee, lineHeight: 15 });
    y += 6;
    if (y > pageHeight - margin - 120) {
      pdf.addPage();
      y = margin;
    }
  });

  y += 10;
  y = pdfWriteParagraph(pdf, doc.closing, margin, y, maxWidth);
  y += 20;

  const signatureAsset = await fetchLegalRepSignatureAsset();
  y = appendLetterSignatureToPdf(pdf, doc, signatureAsset, y, pageWidth);

  pdf.setFontSize(8.5);
  pdf.setTextColor(80, 80, 80);
  y = pdfWriteParagraph(pdf, doc.disclaimer, margin, y, maxWidth, { fontSize: 8.5, lineHeight: 11 });

  pdf.save(doc.fileName);
  return { ok: true, fileName: doc.fileName, signed: Boolean(signatureAsset?.dataUrl) };
}

/** Exporta según formato: preview | pdf | word */
export async function exportEmploymentLetter(employee, opts = {}) {
  const format = String(opts.exportFormat || "preview").trim().toLowerCase();
  if (format === "pdf") return downloadEmploymentLetterPdf(employee, opts);
  if (format === "word" || format === "docx") return downloadEmploymentLetterDocx(employee, opts);
  return openEmploymentLetterPrintWindow(employee, opts);
}

export function encodeEmploymentLetterExportToken(employeeId, opts = {}) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify({ employeeId: String(employeeId || ""), opts }))));
  } catch (_e) {
    return "";
  }
}

function letterPreviewActionsHtml(exportToken) {
  if (!exportToken) {
    return `<div class="no-print"><button type="button" onclick="window.print()">Imprimir / guardar PDF</button></div>`;
  }
  const token = escapeEmploymentLetterHtml(exportToken);
  return `<div class="no-print employment-letter-actions">
    <button type="button" onclick="window.print()">Imprimir</button>
    <button type="button" data-export-token="${token}" data-export-format="pdf" class="employment-letter-download-btn">Descargar PDF</button>
    <button type="button" data-export-token="${token}" data-export-format="word" class="employment-letter-download-btn">Descargar Word</button>
  </div>
  <script>
    document.querySelectorAll(".employment-letter-download-btn").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var opener = window.opener;
        if (!opener || typeof opener.runEmploymentLetterDownload !== "function") {
          alert("No se pudo iniciar la descarga. Cierre esta ventana y elija PDF o Word en el formulario de generación.");
          return;
        }
        opener.runEmploymentLetterDownload(btn.getAttribute("data-export-token"), btn.getAttribute("data-export-format"));
      });
    });
  </script>`;
}

function letterSignatureBlock(companyName) {
  const signatureSrc = contractLegalRepSignatureSrc();
  return `<div class="sign" role="group" aria-label="Firma del empleador">
    <p class="sign__kicker">Firma del empleador</p>
    <img class="sign__img" src="${escapeEmploymentLetterHtml(signatureSrc)}" alt="Firma del representante legal" />
    <div class="sign__line" aria-hidden="true"></div>
    <p class="sign__name"><strong>${escapeEmploymentLetterHtml(CONTRACT_LEGAL_REP_NAME)}</strong></p>
    <p class="sign__meta">${escapeEmploymentLetterHtml(CONTRACT_LEGAL_REP_ID_DOC)}</p>
    <p class="sign__role">Representante legal · ${escapeEmploymentLetterHtml(companyName)}</p>
  </div>`;
}

function letterStyles() {
  return `<style>
    body { font-family: "Times New Roman", Georgia, serif; max-width: 720px; margin: 2rem auto; color: #111; line-height: 1.55; font-size: 12pt; }
    h1 { font-size: 14pt; text-align: center; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 1.25rem; }
    .meta { margin: 1.25rem 0; }
    .facts { margin: 1rem 0 1.25rem; padding: 0; }
    .facts dt { font-weight: 700; margin-top: 0.55rem; }
    .facts dd { margin: 0.15rem 0 0 0; }
    .sign { margin-top: 2.5rem; text-align: center; max-width: 360px; margin-left: auto; margin-right: auto; }
    .sign__kicker { margin: 0 0 0.65rem; font-size: 9pt; letter-spacing: 0.06em; text-transform: uppercase; color: #555; }
    .sign__img { max-width: 220px; max-height: 80px; object-fit: contain; display: block; margin: 0 auto 0.5rem; }
    .sign__line { height: 1px; background: #111; width: 78%; margin: 0 auto 0.75rem; }
    .sign__name { margin: 0; font-size: 11pt; }
    .sign__meta, .sign__role { margin: 0.2rem 0 0; font-size: 10pt; color: #333; }
    .muted { color: #444; font-size: 10pt; margin-top: 2rem; }
    .no-print { margin-top: 1.5rem; text-align: center; display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
    .no-print button { font-family: system-ui, sans-serif; padding: 0.55rem 1.1rem; cursor: pointer; margin: 0; }
    @media print { .no-print { display: none; } body { margin: 1.2cm; } }
  </style>`;
}

function salaryParagraph(meta) {
  if (!meta.includeSalary) return "";
  const lines = [`Remuneración mensual: <strong>${escapeEmploymentLetterHtml(meta.salaryText)}</strong>.`];
  if (meta.transportText) {
    lines.push(`Auxilio de transporte: <strong>${escapeEmploymentLetterHtml(meta.transportText)}</strong>.`);
  }
  return `<p>${lines.join(" ")}</p>`;
}

function socialSecurityParagraph(meta) {
  if (!meta.includeSocialSecurity) return "";
  return `<p>
    Afiliaciones vigentes en seguridad social: EPS <strong>${escapeEmploymentLetterHtml(meta.eps)}</strong>,
    fondo de pensiones <strong>${escapeEmploymentLetterHtml(meta.pensionFund)}</strong>
    y ARL <strong>${escapeEmploymentLetterHtml(meta.arl)}</strong>, conforme a la normatividad colombiana.
  </p>`;
}

/** Constancia de vinculación laboral vigente. */
export function buildActiveEmploymentLetterHtml(employee, opts = {}) {
  const meta = buildEmploymentLetterMeta(employee, { ...opts, letterKind: "vigente" });
  const company = meta.company;
  const employerId = company.nit ? `, identificada con NIT ${escapeEmploymentLetterHtml(company.nit)}` : "";
  const domicile = company.address
    ? ` con domicilio en ${escapeEmploymentLetterHtml(company.address)}${company.cityLine ? `, ${escapeEmploymentLetterHtml(company.cityLine)}` : ""}`
    : company.cityLine
      ? ` con sede en ${escapeEmploymentLetterHtml(company.cityLine)}`
      : "";
  const contractDetail =
    meta.contractType === "Termino fijo" && meta.contractEndLabel
      ? ` mediante contrato a término fijo con vencimiento el <strong>${escapeEmploymentLetterHtml(meta.contractEndLabel)}</strong>`
      : ` mediante contrato ${escapeEmploymentLetterHtml(meta.contractType.toLowerCase())}`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Carta laboral · ${escapeEmploymentLetterHtml(meta.name)}</title>
  ${letterStyles()}
</head>
<body>
  <h1>Constancia de vinculación laboral</h1>
  <p class="meta">${escapeEmploymentLetterHtml(company.cityLine || "Colombia")}, ${escapeEmploymentLetterHtml(meta.letterDateLabel)}</p>
  <p><strong>${escapeEmploymentLetterHtml(meta.addressee)}</strong></p>
  <p>
    <strong>${escapeEmploymentLetterHtml(company.name)}</strong>${employerId}${domicile},
    certifica que el(la) señor(a) <strong>${escapeEmploymentLetterHtml(meta.name)}</strong>,
    identificado(a) con ${escapeEmploymentLetterHtml(meta.docType)} No. <strong>${escapeEmploymentLetterHtml(meta.idDoc)}</strong>,
    ${
      meta.isServiceProvider
        ? "presta sus servicios profesionales"
        : "se encuentra vinculado(a) laboralmente"
    } con nuestra organización${contractDetail},
    desempeñando el cargo de <strong>${escapeEmploymentLetterHtml(meta.position)}</strong>.
  </p>
  <dl class="facts">
    <dt>Fecha de ingreso</dt><dd>${escapeEmploymentLetterHtml(meta.hireLabel)}</dd>
    <dt>Tiempo de servicio a la fecha</dt><dd>${escapeEmploymentLetterHtml(meta.serviceTime)}</dd>
    <dt>Tipo de contrato</dt><dd>${escapeEmploymentLetterHtml(meta.contractType)}</dd>
    <dt>Jornada laboral</dt><dd>${escapeEmploymentLetterHtml(meta.workSchedule)}</dd>
  </dl>
  ${salaryParagraph(meta)}
  ${socialSecurityParagraph(meta)}
  <p>
    A la fecha de expedición de la presente constancia, la vinculación se encuentra <strong>vigente</strong>.
    Este documento se expide a solicitud del interesado, para los fines que estime convenientes,
    en aplicación de las obligaciones de información del empleador previstas en el Código Sustantivo del Trabajo
    y la normativa laboral colombiana vigente.
  </p>
  <p>Atentamente,</p>
  ${letterSignatureBlock(company.name)}
  <p class="muted">${escapeEmploymentLetterHtml(employmentLetterDisclaimer("vigente"))}</p>
  ${opts.previewActionsHtml || `<div class="no-print"><button type="button" onclick="window.print()">Imprimir / guardar PDF</button></div>`}
</body>
</html>`;
}

/** Certificado laboral al retiro (CST art. 57). */
export function buildTerminationEmploymentCertificateHtml(employee, opts = {}) {
  const meta = buildEmploymentLetterMeta(employee, { ...opts, letterKind: "retiro" });
  const company = meta.company;
  const employerId = company.nit ? `, NIT ${escapeEmploymentLetterHtml(company.nit)}` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Certificado laboral · ${escapeEmploymentLetterHtml(meta.name)}</title>
  ${letterStyles()}
</head>
<body>
  <h1>Certificado laboral</h1>
  <p class="meta">${escapeEmploymentLetterHtml(company.cityLine || "Colombia")}, ${escapeEmploymentLetterHtml(meta.letterDateLabel)}</p>
  <p><strong>${escapeEmploymentLetterHtml(meta.addressee)}</strong></p>
  <p>
    En cumplimiento del artículo 57 del Código Sustantivo del Trabajo, <strong>${escapeEmploymentLetterHtml(company.name)}</strong>${employerId}
    certifica que el(la) señor(a) <strong>${escapeEmploymentLetterHtml(meta.name)}</strong>,
    identificado(a) con ${escapeEmploymentLetterHtml(meta.docType)} No. <strong>${escapeEmploymentLetterHtml(meta.idDoc)}</strong>,
    prestó sus servicios en el cargo de <strong>${escapeEmploymentLetterHtml(meta.position)}</strong>,
    con jornada <strong>${escapeEmploymentLetterHtml(meta.workSchedule)}</strong>
    y tipo de vinculación <strong>${escapeEmploymentLetterHtml(meta.contractType)}</strong>.
  </p>
  <dl class="facts">
    <dt>Duración del vínculo</dt>
    <dd>Desde el ${escapeEmploymentLetterHtml(meta.hireLabel)} hasta el ${escapeEmploymentLetterHtml(meta.terminationLabel)} (${escapeEmploymentLetterHtml(meta.serviceTime)}).</dd>
    <dt>Naturaleza y calidad de las labores</dt>
    <dd>Funciones propias del cargo de ${escapeEmploymentLetterHtml(meta.position)} en el giro ordinario del empleador.</dd>
    <dt>Monto de las labores</dt>
    <dd>${escapeEmploymentLetterHtml(meta.salaryText)}${meta.transportText ? ` · ${escapeEmploymentLetterHtml(meta.transportText)}` : ""}.</dd>
    <dt>Causa del retiro</dt>
    <dd>${escapeEmploymentLetterHtml(meta.causeLabel)}.</dd>
  </dl>
  ${socialSecurityParagraph(meta)}
  <p>
    Se expide el presente certificado a solicitud del interesado, sin perjuicio de las obligaciones pendientes
    de liquidación, pago de prestaciones y entrega de soportes que correspondan conforme al ordenamiento laboral colombiano.
  </p>
  <p>Atentamente,</p>
  ${letterSignatureBlock(company.name)}
  <p class="muted">${escapeEmploymentLetterHtml(employmentLetterDisclaimer("retiro"))}</p>
  ${opts.previewActionsHtml || `<div class="no-print"><button type="button" onclick="window.print()">Imprimir / guardar PDF</button></div>`}
</body>
</html>`;
}

export function buildEmploymentLetterHtml(employee, opts = {}) {
  const kind = String(opts.letterKind || "vigente").trim().toLowerCase();
  return kind === "retiro"
    ? buildTerminationEmploymentCertificateHtml(employee, opts)
    : buildActiveEmploymentLetterHtml(employee, opts);
}

/** Abre ventana imprimible con la carta o certificado laboral. */
export function openEmploymentLetterPrintWindow(employee, opts = {}) {
  const exportToken = encodeEmploymentLetterExportToken(employee?.id, opts);
  const previewActionsHtml = letterPreviewActionsHtml(exportToken);
  const html = buildEmploymentLetterHtml(employee, { ...opts, previewActionsHtml });
  const popup = window.open("", "_blank", "width=820,height=900");
  if (!popup) {
    return { ok: false, message: "El navegador bloqueó la ventana. Permita ventanas emergentes e intente de nuevo." };
  }
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  return { ok: true };
}
