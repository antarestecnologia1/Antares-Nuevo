/**
 * Genera un .sql por tabla desde 03–06 (ejecutar una vez tras editar módulos).
 * node BD/postgres/tablas/generar-desde-modulos.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTGRES = path.join(__dirname, "..");

const mod03 = readFileSync(path.join(POSTGRES, "03_nucleo_empresa_usuarios.sql"), "utf8");
const mod04 = readFileSync(path.join(POSTGRES, "04_transporte.sql"), "utf8");
const mod05 = readFileSync(path.join(POSTGRES, "05_rrhh.sql"), "utf8");
const mod06 = readFileSync(path.join(POSTGRES, "06_sistema.sql"), "utf8");

const INDEX_BY_TABLE = {
  empresas: ["uq_empresas_una_sola_propia"],
  usuarios: [
    "idx_usuarios_id_empresa",
    "idx_usuarios_correo_lower",
    "idx_usuarios_rol_estado",
    "uq_usuarios_documento_personal"
  ],
  prospectos_contacto_b2b: [
    "idx_prospectos_contacto_b2b_fecha_creacion_desc",
    "idx_prospectos_contacto_b2b_correo"
  ],
  solicitudes_transporte: [
    "idx_solicitudes_id_empresa_cliente",
    "idx_solicitudes_id_usuario",
    "idx_solicitudes_estado",
    "idx_solicitudes_fecha_creacion",
    "idx_solicitudes_transporte_cobertura_publica"
  ],
  tarifas_trayecto: ["idx_tarifas_trayecto_origen_destino", "idx_tarifas_trayecto_ruta"],
  viajes_transporte: [
    "idx_viajes_id_vehiculo",
    "idx_viajes_id_conductor",
    "idx_viajes_transporte_recogida_programada",
    "idx_viajes_transporte_entrega_programada"
  ],
  notificaciones: ["idx_notificaciones_usuario_no_leida"],
  solicitudes_autorizacion: ["idx_autorizaciones_estado_fecha"],
  empleados_nomina: ["idx_empleados_id_empresa"],
  liquidaciones_nomina: ["idx_liquidaciones_periodo", "idx_liquidaciones_pendiente_pago"],
  candidatos: ["idx_candidatos_id_vacante", "idx_candidatos_etapa"],
  registros_combustible: [
    "idx_combustible_conductor_fecha",
    "idx_combustible_vehiculo_fecha",
    "idx_combustible_usuario_registro"
  ],
  registros_mantenimiento_vehiculo: [
    "idx_mantenimiento_vehiculo_fecha",
    "idx_mantenimiento_usuario_registro"
  ],
  auditoria_viajes_eliminados: ["idx_aud_viajes_elim_en"],
  auditoria_solicitudes_eliminadas: ["idx_aud_sol_elim_en"],
  ausencias_laborales: ["idx_ausencias_empleado"],
  registros_cumplimiento_sst: ["idx_sst_empleado", "idx_sst_vencimiento"]
};

const mod07 = readFileSync(path.join(POSTGRES, "07_indices.sql"), "utf8");

function extractIndexBlocks(sql, indexNames) {
  if (!indexNames?.length) return "";
  const blocks = [];
  for (const name of indexNames) {
    const re = new RegExp(
      `CREATE (?:UNIQUE )?INDEX ${name}[\\s\\S]*?;`,
      "i"
    );
    const m = sql.match(re);
    if (m) blocks.push(m[0]);
  }
  return blocks.length ? "\n\n-- Índices\n\n" + blocks.join("\n\n") + "\n" : "";
}

function extractCreateAndComments(sql, table) {
  const start = `CREATE TABLE ${table}`;
  const i = sql.indexOf(start);
  if (i < 0) throw new Error(`CREATE TABLE ${table} no encontrado`);
  let depth = 0;
  let j = i;
  for (; j < sql.length; j++) {
    const c = sql[j];
    if (c === "(") depth++;
    else if (c === ")") {
      depth--;
      if (depth === 0) {
        j++;
        while (j < sql.length && sql[j] !== ";") j++;
        j++;
        break;
      }
    }
  }
  let out = sql.slice(i, j).trim();
  for (const comment of extractCommentsForTable(sql, table)) {
    out += `\n\n${comment}`;
  }
  return out;
}

/** COMMENT ON … IS '…'; (soporta comillas y punto y coma dentro del literal). */
function extractCommentsForTable(sql, table) {
  const results = [];
  const prefixes = [
    `COMMENT ON TABLE ${table} `,
    `COMMENT ON COLUMN ${table}.`,
    `COMMENT ON CONSTRAINT `
  ];
  let pos = 0;
  while (pos < sql.length) {
    const idx = sql.indexOf("COMMENT ON ", pos);
    if (idx < 0) break;
    const head = sql.slice(idx, idx + 200);
    const isTableComment =
      head.startsWith(`COMMENT ON TABLE ${table} `) ||
      head.startsWith(`COMMENT ON COLUMN ${table}.`) ||
      (head.startsWith("COMMENT ON CONSTRAINT ") && head.includes(` ON ${table} `));
    if (!isTableComment) {
      pos = idx + 11;
      continue;
    }
    const isPos = sql.indexOf(" IS '", idx);
    if (isPos < 0) {
      pos = idx + 11;
      continue;
    }
    let j = isPos + 5;
    while (j < sql.length) {
      if (sql[j] === "'" && sql[j + 1] === "'") {
        j += 2;
        continue;
      }
      if (sql[j] === "'") {
        j++;
        if (sql[j] === ";") {
          j++;
          break;
        }
      } else {
        j++;
      }
    }
    results.push(sql.slice(idx, j).trim());
    pos = j;
  }
  return results;
}

const map = {
  empresas: mod03,
  usuarios: mod03,
  permisos_usuario: mod03,
  reglas_viatico_interdepartamental: mod03,
  parametros_sistema: mod03,
  vehiculos: mod04,
  conductores: mod04,
  tarifas_trayecto: mod04,
  solicitudes_transporte: mod04,
  viajes_transporte: mod04,
  registros_combustible: mod04,
  registros_mantenimiento_vehiculo: mod04,
  auditoria_viajes_eliminados: mod04,
  auditoria_solicitudes_eliminadas: mod04,
  cargos: mod05,
  vacantes: mod05,
  candidatos: mod05,
  entrevistas: mod05,
  contratos: mod05,
  empleados_nomina: mod05,
  liquidaciones_nomina: mod05,
  ausencias_laborales: mod05,
  registros_cumplimiento_sst: mod05,
  notificaciones: mod06,
  correos_salida: mod06,
  prospectos_contacto_b2b: mod06,
  contadores_secuencia: mod06,
  solicitudes_autorizacion: mod06,
  sesiones_usuario: mod06,
  preferencias_notificacion_usuario: mod06
};

const orden = readFileSync(path.join(__dirname, "orden_ejecucion.txt"), "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"));

for (const file of orden) {
  if (file === "00_funciones.sql") {
    const fnStart = mod03.indexOf("CREATE OR REPLACE FUNCTION trg_marcar_fecha_actualizacion");
    const fnEnd = mod03.indexOf("-- Opcional:", fnStart);
    const fn = mod03.slice(fnStart, fnEnd > 0 ? fnEnd : undefined).trim();
    writeFileSync(
      path.join(__dirname, file),
      `-- Función auxiliar (trigger opcional en tablas con fecha_actualizacion)\n\n${fn}\n`
    );
    console.log("OK", file);
    continue;
  }
  const table = file.replace(/^\d+_/, "").replace(/\.sql$/, "");
  const src = map[table];
  let body = extractCreateAndComments(src, table);
  if (table === "reglas_viatico_interdepartamental") {
    const ins = mod03.match(
      /INSERT INTO reglas_viatico_interdepartamental[^;]+;/
    );
    if (ins) body += `\n\n${ins[0]}`;
  }
  body += extractIndexBlocks(mod07, INDEX_BY_TABLE[table]);
  const header = `-- Tabla: ${table}\n-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt\n\n`;
  writeFileSync(path.join(__dirname, file), header + body + "\n");
  console.log("OK", file);
}

console.log(`Generados ${orden.length} archivos en tablas/`);
