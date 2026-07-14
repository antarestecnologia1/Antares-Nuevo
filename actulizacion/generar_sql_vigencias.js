const fs = require("fs");
const path = require("path");

const srcPath = path.join(__dirname, "empleados_nomina_rows.sql");
const outPath = path.join(__dirname, "actualizar_vigencias_empleados.sql");
const raw = fs.readFileSync(srcPath, "utf8");

function addYears(ymd, years) {
  if (!ymd) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd).trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return null;
  d.setFullYear(d.getFullYear() + years);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function sqlDate(v) {
  return v ? `'${v}'::date` : "NULL";
}

function sqlText(v) {
  if (!v) return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}

const rowRe = /\('([0-9a-f-]{36})'[\s\S]*?\)(?=,\s*\(|\s*;)/gi;
const rows = [];
let m;
while ((m = rowRe.exec(raw)) !== null) rows.push(m[0]);

function parseRow(rowText) {
  const inner = rowText.replace(/^\(/, "").replace(/\)$/, "");
  const vals = [];
  let cur = "";
  let inStr = false;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === "'" && inner[i - 1] !== "\\") {
      inStr = !inStr;
      cur += ch;
      continue;
    }
    if (ch === "," && !inStr) {
      vals.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) vals.push(cur.trim());
  const unq = (v) => {
    const t = v.trim();
    if (t.toUpperCase() === "NULL") return null;
    if (t.startsWith("'") && t.endsWith("'")) return t.slice(1, -1).replace(/''/g, "'");
    return t;
  };
  return {
    id: unq(vals[0]),
    numero_documento: unq(vals[5]),
    nombre_completo: unq(vals[3]),
    rol_trabajador: unq(vals[38]),
    numero_licencia: unq(vals[39]),
    categoria_licencia: unq(vals[40]),
    fecha_vencimiento_licencia: unq(vals[41]),
    fecha_vencimiento_examen_ocupacional_src: unq(vals[42]),
    fecha_examen_ocupacional: unq(vals[52]),
    fecha_examen_instruvial: unq(vals[54]),
    fecha_vencimiento_examen_instruvial_src: unq(vals[55])
  };
}

const updates = [];
for (const rowText of rows) {
  const r = parseRow(rowText);
  const isConductor = String(r.rol_trabajador || "").toLowerCase() === "conductor";

  const occDate = r.fecha_examen_ocupacional;
  const occExpiry = occDate ? addYears(occDate, 1) : r.fecha_vencimiento_examen_ocupacional_src;

  const intraDate = r.fecha_examen_instruvial;
  const intraExpiry = intraDate ? addYears(intraDate, 2) : r.fecha_vencimiento_examen_instruvial_src;

  const hasOcc = Boolean(occDate || occExpiry);
  const hasIntra = Boolean(intraDate || intraExpiry);
  const hasLicense =
    isConductor && Boolean(r.numero_licencia || r.fecha_vencimiento_licencia || r.categoria_licencia);

  if (!hasOcc && !hasIntra && !hasLicense) continue;

  const sets = [];
  if (hasOcc) {
    if (occDate) sets.push(`fecha_examen_ocupacional = ${sqlDate(occDate)}`);
    if (occExpiry) sets.push(`fecha_vencimiento_examen_ocupacional = ${sqlDate(occExpiry)}`);
  }
  if (hasIntra) {
    if (intraDate) sets.push(`fecha_examen_instruvial = ${sqlDate(intraDate)}`);
    if (intraExpiry) sets.push(`fecha_vencimiento_examen_instruvial = ${sqlDate(intraExpiry)}`);
  }
  if (hasLicense) {
    if (r.numero_licencia) sets.push(`numero_licencia = ${sqlText(r.numero_licencia)}`);
    if (r.categoria_licencia) sets.push(`categoria_licencia = ${sqlText(r.categoria_licencia)}`);
    if (r.fecha_vencimiento_licencia) {
      sets.push(`fecha_vencimiento_licencia = ${sqlDate(r.fecha_vencimiento_licencia)}`);
    }
  }
  if (!sets.length) continue;

  updates.push({
    id: r.id,
    doc: r.numero_documento,
    name: r.nombre_completo,
    sql: `UPDATE public.empleados_nomina\nSET\n  ${sets.join(",\n  ")},\n  fecha_actualizacion = now()\nWHERE id = '${r.id}'::uuid;`
  });
}

const header = `-- Actualización de vigencias SST / conductores
-- Generado desde actulizacion/empleados_nomina_rows.sql
-- Reglas aplicadas:
--   Examen ocupacional periódico: vencimiento = fecha examen + 1 año
--   Examen instruvial: vencimiento = fecha examen + 2 años
--   Licencia: se conserva fecha_vencimiento_licencia del origen (RUNT)
-- Empleados con datos de cumplimiento: ${updates.length} de ${rows.length} registros exportados

BEGIN;

`;

const conductorSync = `

-- Sincronizar tabla conductores (mismo documento, rol conductor)
UPDATE public.conductores c
SET
  numero_licencia = e.numero_licencia,
  categoria_licencia = e.categoria_licencia,
  fecha_vencimiento_licencia = e.fecha_vencimiento_licencia,
  fecha_examen_ocupacional = e.fecha_examen_ocupacional,
  fecha_vencimiento_examen_ocupacional = e.fecha_vencimiento_examen_ocupacional,
  fecha_examen_instruvial = e.fecha_examen_instruvial,
  fecha_vencimiento_examen_instruvial = e.fecha_vencimiento_examen_instruvial,
  fecha_actualizacion = now()
FROM public.empleados_nomina e
WHERE trim(c.numero_documento) = trim(e.numero_documento)
  AND lower(trim(coalesce(e.rol_trabajador, ''))) = 'conductor'
  AND (
    e.numero_licencia IS NOT NULL
    OR e.fecha_vencimiento_licencia IS NOT NULL
    OR e.fecha_examen_ocupacional IS NOT NULL
    OR e.fecha_vencimiento_examen_ocupacional IS NOT NULL
    OR e.fecha_examen_instruvial IS NOT NULL
    OR e.fecha_vencimiento_examen_instruvial IS NOT NULL
  );

COMMIT;
`;

const body = updates
  .map((u, i) => `-- ${i + 1}. ${u.name} (${u.doc})\n${u.sql}`)
  .join("\n\n");

fs.writeFileSync(outPath, header + body + conductorSync, "utf8");
console.log(`Generado: ${outPath}`);
console.log(`UPDATE empleados_nomina: ${updates.length}`);
