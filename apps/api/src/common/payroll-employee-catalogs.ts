/**
 * Catálogos de empleado (alineados con CO_CATALOGS en app.js).
 * En BD se guardan con la grafía del catálogo, no en MAYÚSCULAS.
 */

export const PAYROLL_EMPLOYEE_CATALOG = {
  eps: [
    "Sura",
    "Nueva EPS",
    "Sanitas",
    "Compensar",
    "Famisanar",
    "Salud Total",
    "Aliansalud",
    "Coosalud",
    "Mutual Ser",
    "S.O.S."
  ],
  arl: ["Sura", "Positiva", "Colmena", "Bolivar", "Alfa", "Equidad", "Mapfre"],
  pensionFunds: ["Colpensiones", "Porvenir", "Proteccion", "Colfondos", "Skandia"],
  severanceFunds: ["Porvenir", "Proteccion", "Colfondos", "Skandia", "FNA"],
  compensationFunds: [
    "Colsubsidio",
    "Cafam",
    "Compensar",
    "Comfama",
    "Comfandi",
    "Cafaba",
    "Comfenalco Antioquia",
    "Comfenalco Valle",
    "Cajacopi"
  ],
  banks: [
    "Bancolombia",
    "Davivienda",
    "BBVA",
    "Banco de Bogota",
    "Banco Popular",
    "Itau (Corpbanca)",
    "Banco Caja Social",
    "Banco AV Villas",
    "Banco Falabella",
    "Scotiabank Colpatria",
    "Banco Agrario",
    "Banco GNB Sudameris",
    "Nequi",
    "Daviplata"
  ],
  accountTypes: ["Ahorros", "Corriente"],
  contractTypes: [
    "Termino indefinido",
    "Termino fijo",
    "Obra o labor",
    "Prestacion de servicios",
    "Aprendizaje SENA"
  ],
  genders: ["Masculino", "Femenino", "Otro", "Prefiero no decirlo"],
  maritalStatus: ["Soltero(a)", "Casado(a)", "Union libre", "Separado(a)", "Divorciado(a)", "Viudo(a)"],
  educationLevel: ["Primaria", "Bachiller", "Tecnico", "Tecnologo", "Profesional", "Posgrado"],
  bloodTypes: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
  contributorTypes: [
    "Dependiente",
    "Independiente",
    "Aprendiz SENA lectivo",
    "Aprendiz SENA productivo",
    "Pensionado activo"
  ],
  arlRiskLevels: ["I", "II", "III", "IV", "V"],
  workSchedule: ["Diurna", "Nocturna", "Mixta"],
  licenseCategories: ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"]
} as const;

export function matchPayrollCatalogOption(
  catalog: readonly string[],
  raw: unknown
): string | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const exact = catalog.find((v) => v === s);
  if (exact) return exact;
  const lower = s.toLowerCase();
  const ci = catalog.find((v) => v.toLowerCase() === lower);
  return ci ?? null;
}

/** Clave de plantilla Word: oficina | fijo | prestacion (no mayúsculas). */
export function normalizeContractTemplateKindForDb(
  raw: unknown,
  contractType?: unknown,
  workerRole?: unknown
): string | null {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/^documentacion\//, "");
  const byFile: Record<string, string> = {
    "contrato_administrativo_oficina.docx": "oficina",
    contrato_administrativo_oficina: "oficina",
    "contrato_termino_fijo.docx": "fijo",
    contrato_termino_fijo: "fijo",
    "contrato_prestacion_de_servicios.docx": "prestacion",
    contrato_prestacion_de_servicios: "prestacion"
  };
  if (byFile[s]) return byFile[s];
  if (s === "oficina" || s === "fijo" || s === "prestacion") return s;
  if (s.includes("termino_fijo") || s.includes("término_fijo")) return "fijo";
  if (s.includes("prestacion")) return "prestacion";
  if (s.includes("oficina") || s.includes("administrativo")) return "oficina";
  const ct = String(contractType ?? "Termino indefinido").trim();
  const wr = String(workerRole ?? "empleado").toLowerCase();
  if (wr === "conductor") return "prestacion";
  if (ct === "Prestacion de servicios" || ct.toLowerCase().includes("prestacion")) return "prestacion";
  if (ct === "Termino fijo") return "fijo";
  return "oficina";
}
