(() => {
  /** Nombres de archivo en documentacion/ y en R2 (CF_R2_TEMPLATES_BUCKET). */
  const TEMPLATE_FILE_BY_KIND = {
    oficina: "CONTRATO_ADMINISTRATIVO_OFICINA.docx",
    fijo: "CONTRATO_TERMINO_FIJO.docx",
    prestacion: "CONTRATO_PRESTACION_DE_SERVICIOS.docx"
  };

  const TEMPLATE_LABEL_BY_KIND = {
    oficina: "Administrativo oficina",
    fijo: "Término fijo",
    prestacion: "Prestación de servicios"
  };

  const TEMPLATE_BY_KIND = Object.fromEntries(
    Object.entries(TEMPLATE_FILE_BY_KIND).map(([kind, file]) => [kind, `documentacion/${file}`])
  );

  /** Marcadores Word reemplazados solo con datos del empleado/plataforma. */
  const PLATFORM_MERGE_KEYS = new Set([
    "nombre_empleado",
    "cedula_empleado",
    "municipio_empleado",
    "ciudad_empleado",
    "banco_cuenta_bancaria",
    "cuenta_bancaria",
    "salario_letras",
    "duracion_contrato",
    "cargo_empleado",
    "salario"
  ]);

  const BACKEND_TEMPLATE_PATH = "/api/uploads/contract-template";
  const JSZIP_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

  /**
   * Descarga el binario de la plantilla. Si hay backend con JWT (Cloudflare R2
   * privado), pide la plantilla a `/api/uploads/contract-template/:kind`. Si
   * no, usa el archivo estático local como fallback.
   */
  async function fetchTemplateBuffer(kind) {
    const api = window.AntaresApi;
    if (api && typeof api.getArrayBuffer === "function" && api.isConfigured?.()) {
      try {
        return await api.getArrayBuffer(`${BACKEND_TEMPLATE_PATH}/${encodeURIComponent(kind)}`);
      } catch (_) {
        /* fallback a archivo local */
      }
    }
    const localPath = TEMPLATE_BY_KIND[kind];
    if (!localPath) throw new Error("No se encontro la plantilla de contrato seleccionada.");
    const localRes = await fetch(localPath);
    if (!localRes.ok) throw new Error(`No fue posible leer la plantilla: ${localPath}`);
    return localRes.arrayBuffer();
  }

  function inferTemplateKind(contractType, workerRole) {
    const wr = String(workerRole || "").toLowerCase();
    const ct = String(contractType || "").trim();
    if (wr === "conductor") return "prestacion";
    if (ct === "Prestacion de servicios" || ct.toLowerCase().includes("prestacion")) return "prestacion";
    if (ct === "Termino fijo") return "fijo";
    return "oficina";
  }

  const MONTHS_ES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  function escapeXml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function toWordsEs(n) {
    const num = Math.floor(Number(n) || 0);
    if (num === 0) return "cero";

    const units = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const teens = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciseis", "diecisiete", "dieciocho", "diecinueve"];
    const tens = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    const hundreds = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

    const underThousand = (x) => {
      if (x === 0) return "";
      if (x === 100) return "cien";
      if (x < 10) return units[x];
      if (x < 20) return teens[x - 10];
      if (x < 30) return x === 20 ? "veinte" : `veinti${units[x - 20]}`;
      if (x < 100) {
        const d = Math.floor(x / 10);
        const u = x % 10;
        return u ? `${tens[d]} y ${units[u]}` : tens[d];
      }
      const h = Math.floor(x / 100);
      const rest = x % 100;
      return rest ? `${hundreds[h]} ${underThousand(rest)}` : hundreds[h];
    };

    const millions = Math.floor(num / 1000000);
    const thousands = Math.floor((num % 1000000) / 1000);
    const rest = num % 1000;
    const parts = [];

    if (millions) parts.push(millions === 1 ? "un millon" : `${underThousand(millions)} millones`);
    if (thousands) parts.push(thousands === 1 ? "mil" : `${underThousand(thousands)} mil`);
    if (rest) parts.push(underThousand(rest));
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  let jsZipLoadPromise = null;

  function loadScriptOnce(src) {
    if (typeof window.JSZip === "function") return Promise.resolve();
    if (jsZipLoadPromise) return jsZipLoadPromise;
    jsZipLoadPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.async = true;
      s.crossOrigin = "anonymous";
      s.src = src;
      s.onload = () => {
        if (typeof window.JSZip === "function") resolve();
        else {
          jsZipLoadPromise = null;
          reject(new Error("JSZip no expuso el objeto global"));
        }
      };
      s.onerror = () => {
        jsZipLoadPromise = null;
        reject(new Error("No se pudo cargar JSZip (compruebe conexion o CDN)"));
      };
      document.head.appendChild(s);
    });
    return jsZipLoadPromise;
  }

  async function ensureJsZip() {
    if (typeof window.JSZip === "function") return window.JSZip;
    await loadScriptOnce(JSZIP_CDN);
    if (typeof window.JSZip !== "function") {
      throw new Error("JSZip no esta disponible: recargue la pagina o permita el script CDN.");
    }
    return window.JSZip;
  }

  /**
   * Convierte salario numerico a texto para clausulas (referencia legal Colombia).
   */
  function formatSalarioLetrasPesos(n) {
    const num = Math.round(Number(n) || 0);
    if (num <= 0) return "";
    const words = toWordsEs(num);
    return `${words} pesos colombianos`;
  }

  /**
   * Lista ordenada de marcadores para Word: primero los mas largos para no truncar
   * (ej. salario antes que salario_letras romperia el placeholder).
   */
  function buildContractDocxMergeEntries(input) {
    const salaryNumber = Number(input.salario || 0);
    const letters =
      String(input.salario_letras || "").trim() ||
      formatSalarioLetrasPesos(salaryNumber);
    const salFmt =
      Number.isFinite(salaryNumber) && salaryNumber > 0
        ? Math.round(salaryNumber).toLocaleString("es-CO")
        : String(Math.round(Number(salaryNumber) || 0));
    const ciudadRaw = String(input.ciudad_empleado || input.municipio_empleado || "").trim();
    const deptRaw = String(input.departamento_empleado || input.department || "").trim();
    const ciudadTrabajador = formatContractCityWithDepartment(ciudadRaw, deptRaw);
    const municipioTrabajador = formatContractMunicipioOnly(ciudadRaw, deptRaw);
    const pairs = [
      ["nombre_empleado", String(input.nombre_empleado || "").trim()],
      ["cedula_empleado", String(input.cedula_empleado || "").trim()],
      ["municipio_empleado", municipioTrabajador],
      ["ciudad_empleado", ciudadTrabajador],
      ["banco_cuenta_bancaria", String(input.banco_cuenta_bancaria || "").trim()],
      ["cuenta_bancaria", String(input.cuenta_bancaria || "").trim()],
      ["salario_letras", letters],
      ["duracion_contrato", String(input.duracion_contrato || "").trim()],
      ["cargo_empleado", String(input.cargo_empleado || "").trim()],
      ["salario", salFmt]
    ];
    return pairs.sort((a, b) => b[0].length - a[0].length);
  }

  /** Ciudad + departamento para domicilio y firma (una sola vez). */
  function formatContractCityWithDepartment(city, department) {
    const c = String(city || "").trim();
    const d = String(department || "").trim();
    if (!c) return d;
    if (!d) return c;
    if (c.toLowerCase().includes(d.toLowerCase())) return c;
    return `${c}, ${d}`;
  }

  /**
   * Solo municipio: la plantilla "término fijo" añade " Antioquia" después del marcador.
   */
  function formatContractMunicipioOnly(city, department) {
    const c = String(city || "").trim();
    const d = String(department || "").trim();
    if (!c) return "";
    if (!d) return c;
    const deptRe = new RegExp(`[,\\s]*${d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i");
    return c.replace(deptRe, "").trim() || c;
  }

  function parseContractSignDateParts(dateValue) {
    const dt = dateValue ? new Date(`${dateValue}T12:00:00`) : new Date();
    const validDate = Number.isFinite(dt.getTime()) ? dt : new Date();
    return {
      day: String(validDate.getDate()),
      month: MONTHS_ES[validDate.getMonth()],
      year: String(validDate.getFullYear())
    };
  }

  function extractXmlBlock(paraXml, tag) {
    const re = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, "i");
    const m = paraXml.match(re);
    return m ? m[0] : "";
  }

  /** Reconstruye el párrafo con un solo run para evitar artefactos cuando Word parte "de" / año en varios <w:t>. */
  function rebuildConstanciaParagraphXml(paraXml, sentenceText) {
    const pPr = extractXmlBlock(paraXml, "w:pPr");
    const rPr = extractXmlBlock(paraXml, "w:rPr");
    return `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(sentenceText)}</w:t></w:r></w:p>`;
  }

  /**
   * Párrafo de constancia / firma. Las plantillas parten el XML entre "mes de", "de" y el año;
   * los reemplazos parciales generaban "2026de 2026" o "La Cejaa". Se reescribe el párrafo entero.
   */
  function replaceConstanciaParagraphs(xml, cityForSignature, dateValue) {
    const city = String(cityForSignature || "").trim();
    const { day, month, year } = parseContractSignDateParts(dateValue);

    return xml.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/gi, (para) => {
      const plain = para.replace(/<[^>]+>/g, "");
      if (!plain.includes("Para constancia")) return para;

      if (/Para constancia se firma el d[ií]a/i.test(plain)) {
        const sentence = `Para constancia se firma el día ${day} del mes de ${month} del ${year}.`;
        return rebuildConstanciaParagraphXml(para, sentence);
      }

      if (/Para constancia se firma en dos ejemplares/i.test(plain)) {
        const sentence =
          `Para constancia se firma en dos ejemplares del mismo tenor y valor, por los que en ellas intervine, ` +
          `en la ciudad de ${city} a los ${day} días del mes de ${month} de ${year}.`;
        return rebuildConstanciaParagraphXml(para, sentence);
      }

      return para;
    });
  }

  /** Quita resaltado Word (p. ej. amarillo en cuenta_bancaria de la plantilla). */
  function stripWordHighlightFormatting(xml) {
    return xml.replace(/<w:highlight\b[^/]*\/>/gi, "");
  }

  /**
   * Ultima hoja: lineas con solo "Cc." reciben la cedula.
   * Cubre runs partidos y variantes de puntuacion en word/document.xml.
   */
  function injectCedulaAfterCcRuns(xml, cedula) {
    const esc = escapeXml(cedula);
    if (!esc) return xml;

    let out = xml;
    out = out.replace(/(<w:t[^>]*>)\s*Cc\.\s*<\/w:t>/gi, (full, open) => {
      if (full.includes(`Cc. ${esc}`)) return full;
      return `${open}Cc. ${esc}<\/w:t>`;
    });
    out = out.replace(/(<w:t[^>]*>)\s*Cc\s*<\/w:t>/gi, (full, open) => {
      if (full.includes(`Cc. ${esc}`) || full.includes(esc)) return full;
      return `${open}Cc. ${esc}<\/w:t>`;
    });
    out = out.replace(/(<w:t[^>]*>)\s*Cc:\s*<\/w:t>/gi, (full, open) => {
      if (full.includes(esc)) return full;
      return `${open}Cc: ${esc}<\/w:t>`;
    });
    return out;
  }

  /**
   * Reemplaza un placeholder solo cuando ocupa por completo un nodo `<w:t>...</w:t>`
   * (con espacios opcionales). Esto evita que palabras naturales del texto legal
   * que coinciden con el nombre del placeholder (p.ej. "salario", "salarios") sean
   * sustituidas por el valor del empleado.
   *
   * Cuando el placeholder NO se encuentra en su forma estricta (porque Word lo
   * partió en runs distintos) y el nombre incluye guion bajo —es decir, es
   * altamente improbable que colisione con texto natural— se aplica un fallback
   * permisivo basado en string literal.
   */
  function applyMergeEntryStrict(xml, key, escapedValue) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const strictRe = new RegExp(`(<w:t[^>]*>)\\s*${escapedKey}\\s*(<\\/w:t>)`, "g");
    let out = xml;
    let strictReplaced = false;
    out = out.replace(strictRe, (full, openTag, closeTag) => {
      strictReplaced = true;
      const tag = /xml:space="preserve"/i.test(openTag)
        ? openTag
        : openTag.replace(/<w:t/i, '<w:t xml:space="preserve"');
      return `${tag}${escapedValue}${closeTag}`;
    });
    if (!strictReplaced && key.includes("_") && out.includes(key)) {
      out = out.split(key).join(escapedValue);
    }
    return out;
  }

  /**
   * Saneamiento de la plantilla "Termino fijo": el archivo trae un sueldo
   * hardcodeado en el texto ("recibirá un salario mensual de 1.750.905 ...").
   * Lo sustituimos por el monto real del empleado para evitar que el contrato
   * salga con dos sueldos contradictorios.
   */
  function replaceHardcodedSalarySentence(xml, salaryNumber, salaryWords) {
    if (!Number.isFinite(salaryNumber) || salaryNumber <= 0) return xml;
    const salFmt = Math.round(salaryNumber).toLocaleString("es-CO");
    const wordsTxt = String(salaryWords || "").trim();
    return xml.replace(
      /(recibir[\u00e1\u00c1aA]\s+un\s+salario\s+mensual\s+de\s+)([\d.,]+)(\s*\([^)]*\))?/gi,
      (match, prefix) => {
        const replacement = wordsTxt ? `${salFmt} (${escapeXml(wordsTxt)})` : salFmt;
        return `${prefix}${replacement}`;
      }
    );
  }

  async function generateEmployeeContractDocx(input) {
    const JSZipLib = await ensureJsZip();

    let kind = String(input.contractTemplateKind || "").trim().toLowerCase();
    if (!TEMPLATE_BY_KIND[kind]) {
      kind = inferTemplateKind(input.contractType, input.workerRole);
    }
    if (!TEMPLATE_BY_KIND[kind]) {
      throw new Error("No se encontro la plantilla de contrato seleccionada.");
    }

    const sourceBuffer = await fetchTemplateBuffer(kind);

    const salaryNumber = Number(input.salario || 0);
    const mergeEntries = buildContractDocxMergeEntries(input);
    /** Solo municipio en firma: la plantilla término fijo ya añade " Antioquia" tras municipio_empleado en el cuerpo. */
    const ciudadFirma =
      mergeEntries.find((x) => x[0] === "municipio_empleado")?.[1] ||
      mergeEntries.find((x) => x[0] === "ciudad_empleado")?.[1]?.split(",")[0]?.trim() ||
      "";
    const cedulaVal = mergeEntries.find((x) => x[0] === "cedula_empleado")?.[1] || "";
    const salaryWords =
      mergeEntries.find((x) => x[0] === "salario_letras")?.[1] ||
      formatSalarioLetrasPesos(salaryNumber);

    const zip = await JSZipLib.loadAsync(sourceBuffer);
    const wordEntries = Object.keys(zip.files).filter((name) => /^word\/.*\.xml$/i.test(name));

    await Promise.all(
      wordEntries.map(async (entry) => {
        const xml = await zip.file(entry).async("string");
        let next = xml;
        if (kind === "fijo") {
          next = replaceHardcodedSalarySentence(next, salaryNumber, salaryWords);
        }
        mergeEntries.forEach(([key, val]) => {
          if (!PLATFORM_MERGE_KEYS.has(key)) return;
          const escaped = escapeXml(val);
          next = applyMergeEntryStrict(next, key, escaped);
        });
        next = replaceConstanciaParagraphs(next, ciudadFirma, input.signDate || "");
        next = injectCedulaAfterCcRuns(next, cedulaVal);
        next = stripWordHighlightFormatting(next);
        zip.file(entry, next);
      })
    );

    const output = await zip.generateAsync({ type: "blob" });
    const nombreSafe = mergeEntries.find((x) => x[0] === "nombre_empleado")?.[1] || "empleado";
    const safeName = String(nombreSafe).replace(/[^a-z0-9]+/gi, "_");
    const fileName = `contrato_${kind}_${safeName}.docx`;
    const url = URL.createObjectURL(output);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return fileName;
  }

  window.RecruitmentDomain = window.RecruitmentDomain || {};
  window.RecruitmentDomain.TEMPLATE_FILE_BY_KIND = TEMPLATE_FILE_BY_KIND;
  window.RecruitmentDomain.TEMPLATE_LABEL_BY_KIND = TEMPLATE_LABEL_BY_KIND;
  window.RecruitmentDomain.TEMPLATE_BY_KIND = TEMPLATE_BY_KIND;
  window.RecruitmentDomain.PLATFORM_MERGE_KEYS = PLATFORM_MERGE_KEYS;
  window.RecruitmentDomain.inferTemplateKind = inferTemplateKind;
  window.RecruitmentDomain.toWordsEs = toWordsEs;
  window.RecruitmentDomain.formatSalarioLetrasPesos = formatSalarioLetrasPesos;
  window.RecruitmentDomain.buildContractDocxMergeEntries = buildContractDocxMergeEntries;
  window.RecruitmentDomain.ensureJsZip = ensureJsZip;
  window.RecruitmentDomain.generateEmployeeContractDocx = generateEmployeeContractDocx;
})();
