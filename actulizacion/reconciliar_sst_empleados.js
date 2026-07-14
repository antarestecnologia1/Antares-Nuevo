/**
 * Informe offline de desincronización SST ↔ empleados_nomina.
 * Uso: node actulizacion/reconciliar_sst_empleados.js
 *
 * Espera exports JSON en actulizacion/ (opcional):
 *   - empleados_nomina_rows.json  (array de filas empleado)
 *   - sst_compliance_rows.json    (array de registros SST)
 *
 * Si no existen, imprime instrucciones para exportar desde el portal.
 */
const fs = require("fs");
const path = require("path");

const dir = __dirname;
const empPath = path.join(dir, "empleados_nomina_rows.json");
const sstPath = path.join(dir, "sst_compliance_rows.json");

function readJson(p) {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.error("No se pudo leer", p, e.message);
    return null;
  }
}

function normDate(v) {
  const s = String(v || "").trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}

function daysUntil(ymd) {
  if (!ymd) return -9999;
  const t = new Date(`${ymd}T12:00:00`).getTime();
  const n = new Date();
  n.setHours(0, 0, 0, 0);
  return Math.floor((t - n.getTime()) / 86400000);
}

function mapEmployee(row) {
  return {
    id: row.id || row.id_empleado,
    name: row.name || row.nombre_completo,
    idDoc: row.idDoc || row.numero_documento,
    eps: row.eps,
    pensionFund: row.pensionFund || row.fondo_pension,
    arl: row.arl,
    occupationalExamExpiry: normDate(row.occupationalExamExpiry || row.fecha_vencimiento_examen_ocupacional),
    instruvialExamExpiry: normDate(row.instruvialExamExpiry || row.fecha_vencimiento_examen_instruvial),
    licenseExpiry: normDate(row.licenseExpiry || row.fecha_vencimiento_licencia),
    workerRole: row.workerRole || row.rol_trabajador
  };
}

function mapSst(row) {
  return {
    id: row.id,
    employeeId: row.employeeId || row.id_empleado,
    employeeName: row.employeeName || row.nombre_empleado,
    recordType: row.recordType || row.tipo_registro,
    status: row.status || row.estado,
    completionDate: normDate(row.completionDate || row.fecha_realizacion),
    dueDate: normDate(row.dueDate || row.fecha_vencimiento_control)
  };
}

function resolveKey(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("instruvial")) return "instruvial";
  if (t.includes("licencia")) return "license";
  if (t.includes("ocupacional") || t.includes("medico")) return "occupational";
  if (t.includes("eps")) return "eps";
  if (t.includes("pension")) return "pension";
  if (t.includes("arl")) return "arl";
  return "";
}

function employeeIssue(emp, key) {
  if (key === "eps") return !String(emp.eps || "").trim();
  if (key === "pension") return !String(emp.pensionFund || "").trim();
  if (key === "arl") return !String(emp.arl || "").trim();
  if (key === "occupational") return !emp.occupationalExamExpiry || daysUntil(emp.occupationalExamExpiry) < 0;
  if (key === "instruvial") return !emp.instruvialExamExpiry || daysUntil(emp.instruvialExamExpiry) < 0;
  if (key === "license") return !emp.licenseExpiry || daysUntil(emp.licenseExpiry) < 0;
  return false;
}

function main() {
  const rawEmp = readJson(empPath);
  const rawSst = readJson(sstPath);
  if (!rawEmp || !rawSst) {
    console.log(`
Exporte desde el portal o PostgreSQL dos JSON en actulizacion/:
  - empleados_nomina_rows.json
  - sst_compliance_rows.json

Luego ejecute: node actulizacion/reconciliar_sst_empleados.js
`);
    process.exit(rawEmp && rawSst ? 0 : 1);
  }

  const employees = rawEmp.map(mapEmployee);
  const records = rawSst.map(mapSst);
  const issues = [];

  for (const record of records) {
    const st = String(record.status || "").toLowerCase();
    if (!st.startsWith("cumpl")) continue;
    const key = resolveKey(record.recordType);
    if (!key || !["occupational", "instruvial", "license", "eps", "pension", "arl"].includes(key)) continue;
    const emp = employees.find((e) => String(e.id) === String(record.employeeId));
    if (!emp || !employeeIssue(emp, key)) continue;
    issues.push({
      tipo: "desync",
      empleado: emp.name,
      documento: emp.idDoc,
      control: record.recordType,
      sstId: record.id,
      mensaje: "SST Cumplido pero ficha del empleado inválida"
    });
  }

  for (const emp of employees) {
    for (const [key, label] of [
      ["occupational", "Examen ocupacional"],
      ["instruvial", "Examen instruvial"],
      ["license", "Licencia"],
      ["eps", "EPS"],
      ["pension", "Pensión"],
      ["arl", "ARL"]
    ]) {
      if (key !== "occupational" && String(emp.workerRole || "").toLowerCase() !== "conductor") {
        if (["instruvial", "license"].includes(key)) continue;
      }
      if (!employeeIssue(emp, key)) continue;
      issues.push({
        tipo: "ficha",
        empleado: emp.name,
        documento: emp.idDoc,
        control: label,
        mensaje: "Vigencia faltante o vencida en empleados_nomina"
      });
    }
  }

  console.log(`\nInconsistencias encontradas: ${issues.length}\n`);
  issues.forEach((row, i) => {
    console.log(`${i + 1}. [${row.tipo}] ${row.empleado} (${row.documento || "—"}) · ${row.control}`);
    console.log(`   ${row.mensaje}${row.sstId ? ` · SST ${row.sstId}` : ""}`);
  });
  const outPath = path.join(dir, "reconciliacion_sst_informe.json");
  fs.writeFileSync(outPath, JSON.stringify(issues, null, 2), "utf8");
  console.log(`\nInforme guardado en ${outPath}`);
}

main();
