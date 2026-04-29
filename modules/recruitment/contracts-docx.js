(() => {
  const TEMPLATE_BY_KIND = {
    oficina: "documentacion/CONTRATO_TRABAJO_PERSONAL_OFICINA.docx",
    fijo: "documentacion/CONTRATO_PERSONAL_TERMINO_FIJO.docx",
    prestacion: "documentacion/CONTRATO_PRESTACION_DE_SERVICIOS_CONDUCTORES.docx"
  };

  const JSZIP_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

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

  function loadScriptOnce(src) {
    if (typeof window.JSZip === "function") return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.async = true;
      s.crossOrigin = "anonymous";
      s.src = src;
      s.onload = () => {
        if (typeof window.JSZip === "function") resolve();
        else reject(new Error("JSZip no expuso el objeto global"));
      };
      s.onerror = () => reject(new Error("No se pudo cargar JSZip (compruebe conexion o CDN)"));
      document.head.appendChild(s);
    });
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
   * Rellena el parrafo tipo:
   * "en la ciudad de _____ ... a los ___ dias del mes de _____ de _____"
   * (guiones bajos o espacios en plantillas Word).
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
    const blank = "[\\s_\\u00a0]{2,}";

    out = out.replace(new RegExp(`(en la ciudad de\\s*)(${blank})`, "gi"), `$1${c}`);
    out = out.replace(new RegExp(`(a los\\s*)(${blank})(d[ií]as)`, "gi"), `$1${d} $3`);
    out = out.replace(new RegExp(`(mes de\\s*)(${blank})(\\s*de\\s*)(${blank})`, "gi"), `$1${m}$3${y}`);

    out = out.replace(new RegExp(`(de\\s*)(${blank})(\\s*</w:t>)`, "gi"), `$1${y}$3`);

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
    out = out.replace(/(<w:t[^>]*>)\s*Cc\.\s*<\/w:t>/gi, `$1Cc. ${esc}<\/w:t>`);
    out = out.replace(/(<w:t[^>]*>)\s*Cc\s*<\/w:t>/gi, (full, open) => {
      if (full.includes(`Cc. ${esc}`) || full.includes(esc)) return full;
      return `${open}Cc. ${esc}<\/w:t>`;
    });
    return out;
  }

  async function generateEmployeeContractDocx(input) {
    const JSZipLib = await ensureJsZip();

    let kind = String(input.contractTemplateKind || "").trim().toLowerCase();
    if (!TEMPLATE_BY_KIND[kind]) {
      kind = inferTemplateKind(input.contractType, input.workerRole);
    }
    const templatePath = TEMPLATE_BY_KIND[kind];
    if (!templatePath) throw new Error("No se encontro la plantilla de contrato seleccionada.");

    const response = await fetch(templatePath);
    if (!response.ok) throw new Error(`No fue posible leer la plantilla: ${templatePath}`);
    const sourceBuffer = await response.arrayBuffer();

    const salaryNumber = Number(input.salario || 0);
    const map = {
      nombre_empleado: String(input.nombre_empleado || ""),
      cedula_empleado: String(input.cedula_empleado || ""),
      ciudad_empleado: String(input.ciudad_empleado || ""),
      banco_cuenta_bancaria: String(input.banco_cuenta_bancaria || ""),
      salario: String(Math.round(salaryNumber)),
      salario_letras: String(input.salario_letras || toWordsEs(salaryNumber)),
      duracion_contrato: String(input.duracion_contrato || ""),
      cuenta_bancaria: String(input.cuenta_bancaria || ""),
      cargo_empleado: String(input.cargo_empleado || "")
    };

    const zip = await JSZipLib.loadAsync(sourceBuffer);
    const wordEntries = Object.keys(zip.files).filter((name) => /^word\/.*\.xml$/i.test(name));

    await Promise.all(
      wordEntries.map(async (entry) => {
        const xml = await zip.file(entry).async("string");
        let next = xml;
        Object.entries(map).forEach(([key, val]) => {
          const escaped = escapeXml(val);
          next = next.replace(new RegExp(key, "g"), escaped);
        });
        next = replaceDateSentence(next, map.ciudad_empleado, input.signDate || "");
        next = injectCedulaAfterCcRuns(next, map.cedula_empleado);
        zip.file(entry, next);
      })
    );

    const output = await zip.generateAsync({ type: "blob" });
    const safeName = String(map.nombre_empleado || "empleado").replace(/[^a-z0-9]+/gi, "_");
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
  window.RecruitmentDomain.ensureJsZip = ensureJsZip;
  window.RecruitmentDomain.generateEmployeeContractDocx = generateEmployeeContractDocx;
})();
