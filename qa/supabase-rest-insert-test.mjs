/**
 * Smoke test Supabase/PostgREST para RRHH/Contratación.
 * Lee credenciales desde process.env y, si faltan, desde apps/api/.env.
 *
 * Inserta y borra filas temporales en:
 * - empresas
 * - cargos
 * - vacantes
 * - candidatos
 * - entrevistas
 * - empleados_nomina
 * - ausencias_laborales
 * - liquidaciones_nomina
 * - contratos
 *
 * Uso: node qa/supabase-rest-insert-test.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envCandidates = [
  join(__dirname, "..", "apps", "api", ".env"),
  join(process.cwd(), "apps", "api", ".env"),
  join(process.cwd(), ".env")
];

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

for (const candidate of envCandidates) loadEnvFile(candidate);

const baseUrl = `${String(process.env.SUPABASE_URL || "").replace(/\/+$/, "")}/rest/v1`;
const serviceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

function sanitizeCliError(raw, maxLength = 180) {
  const text = String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "sin detalle";
  const clean = text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted-email]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[jwt]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "[database-url]")
    .replace(/https?:\/\/\S+/gi, "[url]");
  return clean.length > maxLength ? `${clean.slice(0, maxLength - 1)}…` : clean;
}

function headers(extra = {}) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    ...extra
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: headers(options.headers || {})
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} -> ${response.status} ${typeof payload === "string" ? payload : JSON.stringify(payload)}`);
  }
  return payload;
}

async function remove(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "DELETE",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`
    }
  });
  if (!response.ok) {
    throw new Error(`DELETE ${path} -> ${response.status} ${await response.text()}`);
  }
}

async function main() {
  if (!baseUrl.startsWith("https://") || !serviceKey) {
    console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en process.env / apps/api/.env");
    process.exit(1);
  }

  const stamp = Date.now();
  const ids = {
    empresa: randomUUID(),
    cargo: randomUUID(),
    vacante: randomUUID(),
    candidato: randomUUID(),
    entrevista: randomUUID(),
    empleado: randomUUID(),
    ausencia: randomUUID(),
    nomina: randomUUID(),
    contrato: randomUUID()
  };
  const labels = [];
  const companyName = `QA Antares ${stamp}`;
  const positionName = `Cargo QA ${stamp}`;
  const candidateName = `Candidato QA ${stamp}`;
  const employeeName = `Empleado QA ${stamp}`;
  const employeeDoc = String(80000000 + (stamp % 1000000));
  const candidateDoc = String(70000000 + (stamp % 1000000));

  try {
    await request("/empresas", {
      method: "POST",
      body: JSON.stringify({
        id: ids.empresa,
        nombre: companyName,
        nit: `QA-${stamp}`,
        telefono: "3000000000"
      })
    });
    labels.push(["/empresas?id=eq." + ids.empresa, "empresa"]);

    await request("/cargos", {
      method: "POST",
      body: JSON.stringify({
        id: ids.cargo,
        nombre: positionName,
        rol_trabajador: "empleado",
        salario_base_mensual: 1800000,
        tipo_contrato_sugerido: "Termino indefinido",
        fundamento_legal: "QA",
        activo: true,
        jornada_referencia: "Diurna",
        nivel_riesgo_arl: "I",
        salario_integral: false
      })
    });
    labels.push(["/cargos?id=eq." + ids.cargo, "cargo"]);

    await request("/vacantes", {
      method: "POST",
      body: JSON.stringify({
        id: ids.vacante,
        id_cargo: ids.cargo,
        titulo: `Vacante QA ${stamp}`,
        departamento: "Cundinamarca",
        ciudad: "Bogota",
        modalidad: "Presencial",
        jornada_vacante: "Tiempo completo",
        fecha_limite_postulacion: "2026-12-31",
        fecha_publicacion_desde: "2026-05-26",
        cupos: 1,
        salario_oferta: 1800000,
        nombre_cargo_denorm: positionName,
        rol_trabajador: "empleado",
        tipo_contrato_predeterminado: "Termino indefinido",
        requisitos: "QA",
        estado: "Publicada"
      })
    });
    labels.push(["/vacantes?id=eq." + ids.vacante, "vacante"]);

    await request("/candidatos", {
      method: "POST",
      body: JSON.stringify({
        id: ids.candidato,
        id_vacante: ids.vacante,
        nombre_completo: candidateName,
        correo_electronico: `qa.candidato.${stamp}@example.com`,
        telefono: "3000000000",
        tipo_documento: "CC",
        numero_documento: candidateDoc,
        fecha_nacimiento: "1995-01-15",
        nivel_educativo: "Tecnico",
        departamento: "Cundinamarca",
        ciudad: "Bogota",
        direccion: "QA 123",
        anios_experiencia: 3,
        aspiracion_salarial: 1900000,
        fecha_disponible_ingreso: "2026-06-01",
        etapa_proceso: "Recibido",
        adjuntos_json: []
      })
    });
    labels.push(["/candidatos?id=eq." + ids.candidato, "candidato"]);

    await request("/entrevistas", {
      method: "POST",
      body: JSON.stringify({
        id: ids.entrevista,
        id_candidato: ids.candidato,
        nombre_candidato_denorm: candidateName,
        fecha_hora: "2026-06-10T15:00:00Z",
        entrevistador: "RRHH QA",
        modalidad: "Virtual",
        lugar_o_enlace: "https://meet.google.com/qa-test",
        notas: "Prueba QA"
      })
    });
    labels.push(["/entrevistas?id=eq." + ids.entrevista, "entrevista"]);

    await request("/empleados_nomina", {
      method: "POST",
      body: JSON.stringify({
        id: ids.empleado,
        id_empresa: ids.empresa,
        id_cargo: ids.cargo,
        nombre_completo: employeeName,
        tipo_documento: "CC",
        numero_documento: employeeDoc,
        fecha_nacimiento: "1990-02-20",
        genero: "Masculino",
        estado_civil: "Soltero",
        tipo_sangre: "O+",
        nivel_educativo: "Profesional",
        departamento: "Cundinamarca",
        ciudad: "Bogota",
        direccion: "Calle QA 456",
        telefono: "3000000001",
        correo_personal: `qa.empleado.${stamp}@example.com`,
        contacto_emergencia: "Contacto QA",
        telefono_emergencia: "3000000002",
        parentesco_emergencia: "Hermano",
        nombre_cargo_texto: positionName,
        tipo_contrato: "Termino indefinido",
        duracion_contrato_texto: null,
        fecha_ingreso: "2026-05-26",
        salario_base: 1800000,
        auxilio_transporte: 200000,
        periodicidad_pago: "Mensual",
        centro_costos: "QA",
        tipo_cotizante: "Dependiente",
        nivel_riesgo_arl: "I",
        tipo_plantilla_contrato: "oficina",
        eps: "Sura",
        fondo_pension: "Porvenir",
        arl: "Sura",
        fondo_cesantias: "Porvenir",
        caja_compensacion: "Compensar",
        banco: "Bancolombia",
        tipo_cuenta_bancaria: "Ahorros",
        numero_cuenta_bancaria: "1234567890",
        rol_trabajador: "empleado",
        jornada_laboral: "Diurna",
        tiene_condicion_medica: false,
        descripcion_condicion_medica: null
      })
    });
    labels.push(["/empleados_nomina?id=eq." + ids.empleado, "empleado"]);

    await request("/ausencias_laborales", {
      method: "POST",
      body: JSON.stringify({
        id: ids.ausencia,
        id_empleado: ids.empleado,
        nombre_empleado: employeeName,
        tipo_ausencia: "incapacidad",
        fecha_inicio: "2026-05-26",
        fecha_fin: "2026-05-27",
        dias_calendario: 2,
        numero_soporte: `QA-${stamp}`,
        entidad_eps: "Sura",
        observaciones: "Prueba QA"
      })
    });
    labels.push(["/ausencias_laborales?id=eq." + ids.ausencia, "ausencia"]);

    await request("/liquidaciones_nomina", {
      method: "POST",
      body: JSON.stringify({
        id: ids.nomina,
        id_empleado: ids.empleado,
        nombre_empleado: employeeName,
        periodo_mes: "2026-05",
        devengado_total: 1800000,
        base_cotizacion_ibc: 1800000,
        neto_a_pagar: 1656000
      })
    });
    labels.push(["/liquidaciones_nomina?id=eq." + ids.nomina, "nomina"]);

    await request("/contratos", {
      method: "POST",
      body: JSON.stringify({
        id: ids.contrato,
        etiqueta_origen: "QA REST",
        tipo_persona_origen: "Empleado",
        id_empleado: ids.empleado,
        nombre_empleado_denorm: employeeName,
        rol_trabajador: "empleado",
        id_cargo: ids.cargo,
        nombre_cargo_denorm: positionName,
        salario_pactado: 1800000,
        fecha_inicio: "2026-05-26",
        id_empresa: ids.empresa,
        nombre_empresa_denorm: companyName,
        tipo_contrato: "Termino indefinido",
        tipo_plantilla_word: "oficina",
        documento_identidad_snapshot: employeeDoc,
        eps: "Sura",
        fondo_pension: "Porvenir",
        arl: "Sura",
        jornada_turno: "Diurna",
        texto_contenido_resumen: "Prueba QA Supabase"
      })
    });
    labels.push(["/contratos?id=eq." + ids.contrato, "contrato"]);

    console.log(JSON.stringify({ ok: true, created: labels.map(([, label]) => label) }));
  } finally {
    for (const [path, label] of [...labels].reverse()) {
      try {
        await remove(path);
      } catch (error) {
        console.error(`cleanup:${label}:${sanitizeCliError(error instanceof Error ? error.message : String(error))}`);
      }
    }
  }
}

main().catch((error) => {
  console.error(sanitizeCliError(error instanceof Error ? error.message : String(error)));
  process.exit(1);
});
