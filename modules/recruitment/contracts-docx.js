(() => {
  /**
   * Plantillas oficiales en /documentacion (archivos físicos del repositorio).
   * Las rutas deben coincidir con los nombres bajo la carpeta documentacion/.
   */
  const TEMPLATE_BY_KIND = {
    oficina: "documentacion/CONTRATO_TRABAJO_PERSONAL_OFICINA.docx",
    fijo: "documentacion/CONTRATO_PERSONAL_TERMINO_FIJO.docx",
    prestacion: "documentacion/CONTRATO_PRESTACION_DE_SERVICIOS_CONDUCTORES.docx"
  };

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

  function replaceDateSentence(xml, city, dateValue) {
    const dt = dateValue ? new Date(`${dateValue}T12:00:00`) : new Date();
    const validDate = Number.isFinite(dt.getTime()) ? dt : new Date();
    const day = String(validDate.getDate());
    const month = MONTHS_ES[validDate.getMonth()];
    const year = String(validDate.getFullYear());

    let out = xml;
    out = out.replace(/(en la ciudad de\s*)(_+)/gi, `$1${escapeXml(city)}`);
    out = out.replace(/(a los\s*)(_+)/gi, `$1${escapeXml(day)}`);
    out = out.replace(/(mes de\s*)(_+)/gi, `$1${escapeXml(month)}`);
    out = out.replace(/(mes de\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s*)(_+)/gi, `$1${escapeXml(year)}`);
    return out;
  }

  async function generateEmployeeContractDocx(input) {
    if (!window.JSZip) throw new Error("JSZip no esta disponible en el navegador.");

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

    const zip = await JSZip.loadAsync(sourceBuffer);
    const wordEntries = Object.keys(zip.files).filter((name) => /^word\/.*\.xml$/i.test(name));

    await Promise.all(
      wordEntries.map(async (entry) => {
        const xml = await zip.file(entry).async("string");
        let next = xml;
        Object.entries(map).forEach(([key, val]) => {
          const escaped = escapeXml(val);
          const re = new RegExp(key, "g");
          next = next.replace(re, escaped);
        });
        next = replaceDateSentence(next, map.ciudad_empleado, input.signDate || "");
        next = next.replace(/>Cc\.<\/w:t>/g, `>Cc. ${escapeXml(map.cedula_empleado)}<\/w:t>`);
        next = next.replace(/>Cc<\/w:t>/g, `>Cc. ${escapeXml(map.cedula_empleado)}<\/w:t>`);
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
  window.RecruitmentDomain.generateEmployeeContractDocx = generateEmployeeContractDocx;
})();
