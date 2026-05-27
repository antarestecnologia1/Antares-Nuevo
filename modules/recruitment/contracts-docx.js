(() => {
  const TEMPLATE_BY_KIND = {
    oficina: "documentacion/CONTRATO_TRABAJO_PERSONAL_OFICINA.docx",
    fijo: "documentacion/CONTRATO_PERSONAL_TERMINO_FIJO.docx",
    prestacion: "documentacion/CONTRATO_PRESTACION_DE_SERVICIOS_CONDUCTORES.docx"
  };

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
    const pairs = [
      ["nombre_empleado", String(input.nombre_empleado || "").trim()],
      ["cedula_empleado", String(input.cedula_empleado || "").trim()],
      ["ciudad_empleado", String(input.ciudad_empleado || "").trim()],
      ["banco_cuenta_bancaria", String(input.banco_cuenta_bancaria || "").trim()],
      ["cuenta_bancaria", String(input.cuenta_bancaria || "").trim()],
      ["salario_letras", letters],
      ["duracion_contrato", String(input.duracion_contrato || "").trim()],
      ["cargo_empleado", String(input.cargo_empleado || "").trim()],
      ["salario", salFmt]
    ];
    return pairs.sort((a, b) => b[0].length - a[0].length);
  }

  /**
   * Rellena el parrafo tipo constancia:
   * "Para constancia se firma ... en la ciudad de _____ a los ___ dias del mes de _____ de _____"
   * Incluye tolerancia a saltos de linea Word y runs partidos (XML).
   */
  function replaceDateSentence(xml, city, dateValue) {
    const dt = dateValue ? new Date(`${dateValue}T12:00:00`) : new Date();
    const validDate = Number.isFinite(dt.getTime()) ? dt : new Date();
    const day = String(validDate.getDate());
    const month = MONTHS_ES[validDate.getMonth()];
    const year = String(validDate.getFullYear());
    const c = escapeXml(city);
    const d = escapeXml(day);
    const m = escapeXml(month);
    const y = escapeXml(year);

    let out = xml;
    const blank = "[\\s_\\u00a0]{1,}";

    out = out.replace(new RegExp(`(en la ciudad de\\s*)(${blank})`, "gi"), `$1${c}`);
    out = out.replace(new RegExp(`(a los\\s*)(${blank})(d[ií]as)`, "gi"), `$1${d} $3`);
    out = out.replace(new RegExp(`(mes de\\s*)(${blank})(\\s*de\\s*)(${blank})`, "gi"), `$1${m}$3${y}`);
    out = out.replace(new RegExp(`(de\\s*)(${blank})(\\s*</w:t>)`, "gi"), `$1${y}$3`);

    out = out.replace(
      /(en la ciudad de\s*)(<\/w:t><\/w:r>\s*<w:r[^>]*>\s*<w:t[^>]*>)([\s_]+)(<\/w:t>)/gi,
      `$1$2${c}$4`
    );
    out = out.replace(
      /(a los\s*)(<\/w:t><\/w:r>\s*<w:r[^>]*>\s*<w:t[^>]*>)([\s_]+)(<\/w:t>\s*<\/w:r>\s*<w:r[^>]*>\s*<w:t[^>]*>)(d[ií]as)/gi,
      `$1$2${d}$4$5`
    );

    return out;
  }

  /**
   * Completa el párrafo de constancia cuando Word parte runs (<w:t>…</w:t>) entre ciudad / día / mes-año.
   * También cubre la variante de prestación de servicios (una sola línea con día/mes/año).
   */
  function replaceConstanciaParagraphs(xml, city, dateValue) {
    let out = replaceDateSentence(xml, city, dateValue);

    const dt = dateValue ? new Date(`${dateValue}T12:00:00`) : new Date();
    const validDate = Number.isFinite(dt.getTime()) ? dt : new Date();
    const day = String(validDate.getDate());
    const monthWord = MONTHS_ES[validDate.getMonth()];
    const year = String(validDate.getFullYear());
    const c = escapeXml(city);
    const d = escapeXml(day);
    const m = escapeXml(monthWord);
    const y = escapeXml(year);

    /** Prestación de servicios / línea única: "Para constancia se firma el día … del mes de … del AAAA." */
    out = out.replace(
      /Para constancia se firma el d[ií]a[\s_\u00a0]+del mes de[\s_\u00a0]+del\s*\d{4}\./gi,
      `Para constancia se firma el día ${d} del mes de ${m} del ${y}.`
    );

    out = out.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/gi, (para) => {
      if (!para.includes("Para constancia")) return para;
      if (!para.includes("_")) return para;

      let p = para;
      p = p.replace(/en la ciudad de[\s_\u00a0]{6,}/gi, `en la ciudad de ${c} `);
      p = p.replace(/a los[\s_\u00a0]+d[ií]as/gi, `a los ${d} días`);
      p = p.replace(/del mes de[\s_\u00a0]{4,}(?=\s*<\/w:t>)/gi, `del mes de ${m} `);
      p = p.replace(/(<w:t[^>]*(?:xml:space="preserve")?>)(\s*[\s_\u00a0]{4,}\.)(<\/w:t>)/gi, (full, open, mid, close) => {
        if (!/_/i.test(mid)) return full;
        return `${open} ${y}.${close}`;
      });
      return p;
    });

    return out;
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
    const ciudadFirma = mergeEntries.find((x) => x[0] === "ciudad_empleado")?.[1] || "";
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
        next = replaceHardcodedSalarySentence(next, salaryNumber, salaryWords);
        mergeEntries.forEach(([key, val]) => {
          const escaped = escapeXml(val);
          next = applyMergeEntryStrict(next, key, escaped);
        });
        next = replaceConstanciaParagraphs(next, ciudadFirma, input.signDate || "");
        next = injectCedulaAfterCcRuns(next, cedulaVal);
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
  window.RecruitmentDomain.TEMPLATE_BY_KIND = TEMPLATE_BY_KIND;
  window.RecruitmentDomain.inferTemplateKind = inferTemplateKind;
  window.RecruitmentDomain.toWordsEs = toWordsEs;
  window.RecruitmentDomain.formatSalarioLetrasPesos = formatSalarioLetrasPesos;
  window.RecruitmentDomain.buildContractDocxMergeEntries = buildContractDocxMergeEntries;
  window.RecruitmentDomain.ensureJsZip = ensureJsZip;
  window.RecruitmentDomain.generateEmployeeContractDocx = generateEmployeeContractDocx;
})();
