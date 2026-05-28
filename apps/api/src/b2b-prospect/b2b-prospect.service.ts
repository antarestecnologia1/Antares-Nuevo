import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import type { Express } from "express";
import type { Pool } from "pg";
import { PG_POOL } from "../database/database.module";
import { CreateB2bProspectDto } from "./dto/create-b2b-prospect.dto";
import { CreateJobApplicationDto } from "./dto/create-job-application.dto";
import { R2Service } from "../uploads/r2.service";
import { bogotaCalendarYmdFromDate } from "../common/colombia-time";
import {
  normalizeCatalogTextFromUnknown,
  normalizeDbTextUpperFromUnknown,
  normalizeEmailFromUnknown
} from "../common/normalize-db-text";

const JOB_CV_MIME_ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

/** Windows / algunos navegadores envían `application/octet-stream`; inferimos por extensión. */
const CV_FILENAME_EXT_TO_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif"
};

/** Sin R2, el archivo se guarda en adjuntos_json (base64) — tamaño máximo servidor. */
const MAX_CV_INLINE_STORE_BYTES = 1_500_000;

@Injectable()
export class B2bProspectService {
  private readonly logger = new Logger(B2bProspectService.name);

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly r2: R2Service
  ) {}

  /**
   * Valida y normaliza teléfono del formulario B2B (coincide con el cliente: +57 opcional en Colombia).
   * Colombia: 10 dígitos nacionales empezando en 3; se acepta prefijo 57.
   * Otros países: 8–15 dígitos.
   */
  private normalizePhone(raw: string): { ok: boolean; formatted: string } {
    const digits = String(raw || "").replace(/\D/g, "");
    if (!digits) {
      return { ok: false, formatted: "" };
    }

    if (digits.startsWith("57")) {
      const national = digits.slice(2);
      if (national.length === 10 && national.startsWith("3")) {
        return { ok: true, formatted: national };
      }
      if (national.length >= 8 && national.length <= 15) {
        return { ok: true, formatted: national };
      }
      return { ok: false, formatted: digits };
    }

    if (digits.length === 10 && digits.startsWith("3")) {
      return { ok: true, formatted: digits };
    }

    if (digits.length >= 8 && digits.length <= 15) {
      return { ok: true, formatted: digits };
    }

    return { ok: false, formatted: digits };
  }

  private normalizePhoneFlexible(raw: string): string {
    return String(raw || "").replace(/\D/g, "");
  }

  /** Valida fecha y edad para postular (empleo formal). Devuelve YYYY-MM-DD. */
  private assertApplicantBirthDate(birthRaw: string): string {
    const s = String(birthRaw || "")
      .trim()
      .slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      throw new BadRequestException("Fecha de nacimiento invalida.");
    }
    const [y, mo, d] = s.split("-").map((x) => Number(x));
    const birth = new Date(y, mo - 1, d);
    if (birth.getFullYear() !== y || birth.getMonth() !== mo - 1 || birth.getDate() !== d) {
      throw new BadRequestException("Fecha de nacimiento invalida.");
    }
    const todayYmd = bogotaCalendarYmdFromDate();
    const b0Ymd = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (b0Ymd > todayYmd) {
      throw new BadRequestException("La fecha de nacimiento no puede ser futura.");
    }
    const [ty, tmo, td] = todayYmd.split("-").map((x) => Number(x));
    let age = ty - y;
    const md = tmo - mo;
    if (md < 0 || (md === 0 && td < d)) {
      age -= 1;
    }
    if (age < 18) {
      throw new BadRequestException("Debe tener al menos 18 años para postularse.");
    }
    if (age > 95) {
      throw new BadRequestException("Revise la fecha de nacimiento ingresada.");
    }
    return s;
  }

  /** Vacantes publicadas y vigentes (sitio público, sin JWT). */
  async listPublishedVacancies() {
    const r = await this.pool.query<{
      id: string;
      titulo: string;
      departamento: string | null;
      ciudad: string;
      fecha_limite_postulacion: Date;
      salario_oferta: string;
      requisitos: string | null;
      estado: string;
      nombre_cargo_denorm: string | null;
      fecha_publicacion_desde: Date | null;
    }>(
      `SELECT id::text, titulo, departamento, ciudad, fecha_limite_postulacion,
              salario_oferta::text, requisitos, estado::text AS estado, nombre_cargo_denorm,
              fecha_publicacion_desde
       FROM vacantes
       WHERE estado = 'Publicada'::estado_vacante
         AND fecha_limite_postulacion >= CURRENT_DATE
         AND (fecha_publicacion_desde IS NULL OR fecha_publicacion_desde <= CURRENT_DATE)
       ORDER BY fecha_creacion DESC`
    );
    return r.rows.map((v) => {
      const d = v.fecha_limite_postulacion;
      const deadline =
        d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
      const pub = v.fecha_publicacion_desde;
      const publishedFrom =
        pub == null
          ? null
          : pub instanceof Date
            ? pub.toISOString().slice(0, 10)
            : String(pub).slice(0, 10);
      return {
        id: v.id,
        title: v.titulo,
        department: v.departamento,
        city: v.ciudad,
        deadline,
        publishedFrom,
        salaryOffer: Number(v.salario_oferta),
        requirements: v.requisitos,
        status: v.estado,
        positionName: v.nombre_cargo_denorm
      };
    });
  }

  /**
   * Agregados anónimos para la landing: ciudades con más apariciones (origen+destino) y corredores
   * **no dirigidos** (A→B y B→A suman en un solo bucket). Excluye canceladas/rechazadas.
   *
   * @param periodMonths ventana hacia atrás (3–36), por defecto 24.
   */
  async getTransportRequestCoverageStats(periodMonthsRaw?: number) {
    const periodMonths = Math.min(36, Math.max(3, Math.floor(Number(periodMonthsRaw) || 24)));
    const hubLimit = 10;
    const corridorLimit = 10;

    const countR = await this.pool.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c
       FROM solicitudes_transporte
       WHERE estado NOT IN ('Rechazada'::estado_solicitud_transporte, 'Cancelada'::estado_solicitud_transporte)
         AND fecha_creacion >= now() - ($1::numeric * interval '1 month')
         AND length(trim(ciudad_origen)) > 0
         AND length(trim(ciudad_destino)) > 0`,
      [periodMonths]
    );
    const totalRequestsAnalyzed = Number(countR.rows[0]?.c || 0) || 0;

    const hubs = await this.pool.query<{
      city: string;
      department: string | null;
      requestCount: string;
    }>(
      `WITH base AS (
         SELECT ciudad_origen, departamento_origen, ciudad_destino, departamento_destino
         FROM solicitudes_transporte
         WHERE estado NOT IN ('Rechazada'::estado_solicitud_transporte, 'Cancelada'::estado_solicitud_transporte)
           AND fecha_creacion >= now() - ($1::numeric * interval '1 month')
           AND length(trim(ciudad_origen)) > 0
           AND length(trim(ciudad_destino)) > 0
       ),
       cities AS (
         SELECT lower(trim(ciudad_origen)) AS k,
                trim(ciudad_origen) AS city_label,
                NULLIF(trim(COALESCE(departamento_origen, '')), '') AS department_label
         FROM base
         UNION ALL
         SELECT lower(trim(ciudad_destino)) AS k,
                trim(ciudad_destino) AS city_label,
                NULLIF(trim(COALESCE(departamento_destino, '')), '') AS department_label
         FROM base
       )
       SELECT MAX(city_label) AS city,
              MAX(department_label) AS department,
              COUNT(*)::text AS "requestCount"
       FROM cities
       WHERE k <> ''
       GROUP BY k
       ORDER BY COUNT(*) DESC, MAX(city_label) ASC
       LIMIT $2::int`,
      [periodMonths, hubLimit]
    );

    const corridors = await this.pool.query<{
      cityA: string;
      departmentA: string | null;
      cityB: string;
      departmentB: string | null;
      requestCount: string;
    }>(
      `WITH norm AS (
         SELECT lower(trim(ciudad_origen)) AS o_k,
                trim(ciudad_origen) AS o_c,
                NULLIF(trim(COALESCE(departamento_origen, '')), '') AS o_d,
                lower(trim(ciudad_destino)) AS d_k,
                trim(ciudad_destino) AS d_c,
                NULLIF(trim(COALESCE(departamento_destino, '')), '') AS d_d
         FROM solicitudes_transporte
         WHERE estado NOT IN ('Rechazada'::estado_solicitud_transporte, 'Cancelada'::estado_solicitud_transporte)
           AND fecha_creacion >= now() - ($1::numeric * interval '1 month')
           AND length(trim(ciudad_origen)) > 0
           AND length(trim(ciudad_destino)) > 0
           AND lower(trim(ciudad_origen)) <> lower(trim(ciudad_destino))
       ),
       pairs AS (
         SELECT CASE WHEN o_k <= d_k THEN o_k ELSE d_k END AS ka,
                CASE WHEN o_k <= d_k THEN d_k ELSE o_k END AS kb,
                CASE WHEN o_k <= d_k THEN o_c ELSE d_c END AS "cityA",
                CASE WHEN o_k <= d_k THEN o_d ELSE d_d END AS "departmentA",
                CASE WHEN o_k <= d_k THEN d_c ELSE o_c END AS "cityB",
                CASE WHEN o_k <= d_k THEN d_d ELSE o_d END AS "departmentB"
         FROM norm
       )
       SELECT MAX("cityA") AS "cityA",
              MAX("departmentA") AS "departmentA",
              MAX("cityB") AS "cityB",
              MAX("departmentB") AS "departmentB",
              COUNT(*)::text AS "requestCount"
       FROM pairs
       GROUP BY ka, kb
       ORDER BY COUNT(*) DESC, MAX("cityA") ASC, MAX("cityB") ASC
       LIMIT $2::int`,
      [periodMonths, corridorLimit]
    );

    return {
      periodMonths,
      corridorAggregation: "undirected" as const,
      totalRequestsAnalyzed,
      topHubs: hubs.rows.map((row) => ({
        city: row.city,
        department: row.department,
        requestCount: Number(row.requestCount) || 0
      })),
      topCorridors: corridors.rows.map((row) => ({
        cityA: row.cityA,
        departmentA: row.departmentA,
        cityB: row.cityB,
        departmentB: row.departmentB,
        requestCount: Number(row.requestCount) || 0
      }))
    };
  }

  /** Postulación anónima persistida en tabla candidatos (`multipart/form-data`, campo archivo `attachment`). */
  async createJobApplication(dto: CreateJobApplicationDto, attachment?: Express.Multer.File) {
    const phone = this.normalizePhoneFlexible(dto.phone);
    if (phone.length < 7 || phone.length > 32) {
      throw new BadRequestException("Telefono invalido.");
    }

    const email = normalizeEmailFromUnknown(dto.email) ?? "";
    const idDoc = String(dto.idDoc || "")
      .trim()
      .replace(/\s+/g, "");

    const birthSql = this.assertApplicantBirthDate(dto.birthDate);
    const expYears = Math.min(65, Math.max(0, Number(dto.experienceYears)));
    if (!Number.isFinite(expYears)) {
      throw new BadRequestException("Años de experiencia invalidos.");
    }

    const pre = await this.pool.query<{
      titulo: string;
      estado: string;
      lim: Date;
      fecha_publicacion_desde: Date | null;
    }>(
      `SELECT titulo, estado::text, fecha_limite_postulacion AS lim, fecha_publicacion_desde
       FROM vacantes
       WHERE id = $1::uuid`,
      [dto.vacancyId]
    );
    this.assertVacancyAcceptsPublicApplications(pre.rows[0]);

    const expNotes = String(dto.experience ?? "").trim();
    const adjuntos: Record<string, unknown>[] = [];
    if (expNotes) {
      adjuntos.push({ kind: "experience_notes", text: normalizeDbTextUpperFromUnknown(expNotes) });
    }
    await this.attachJobApplicationCvJson(adjuntos, dto, attachment);

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const vac = await client.query<{
        titulo: string;
        estado: string;
        lim: Date;
        fecha_publicacion_desde: Date | null;
      }>(
        `SELECT titulo, estado::text, fecha_limite_postulacion AS lim, fecha_publicacion_desde
         FROM vacantes
         WHERE id = $1::uuid
         FOR UPDATE`,
        [dto.vacancyId]
      );
      const tituloVacante = this.assertVacancyAcceptsPublicApplications(vac.rows[0]);

      const ins = await client.query<{ id: string }>(
        `INSERT INTO candidatos (
          id_vacante, nombre_completo, correo_electronico, telefono, tipo_documento, numero_documento,
          ciudad, direccion, fecha_nacimiento, anios_experiencia, aspiracion_salarial, fecha_disponible_ingreso,
          titulo_vacante_denorm, etapa_proceso, adjuntos_json, origen
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9::date, $10::numeric, 0, CURRENT_DATE,
          $11, 'Recibido', $12::jsonb, 'Sitio web'
        )
        RETURNING id::text AS id`,
        [
          dto.vacancyId,
          normalizeDbTextUpperFromUnknown(dto.name),
          email,
          phone,
          String(dto.documentType || "").trim().toUpperCase(),
          idDoc,
          normalizeCatalogTextFromUnknown(dto.city) ?? dto.city.trim(),
          normalizeDbTextUpperFromUnknown(dto.address),
          birthSql,
          expYears,
          normalizeDbTextUpperFromUnknown(tituloVacante),
          JSON.stringify(adjuntos)
        ]
      );

      const id = ins.rows[0]?.id;
      const ack = JSON.stringify({
        id,
        vacancyId: dto.vacancyId,
        applicant: dto.name.trim(),
        email
      });
      await client.query(
        `INSERT INTO correos_salida (direccion_destino, asunto, cuerpo)
         VALUES ($1, $2, $3)`,
        [email, "Postulacion recibida - Antares", ack]
      );

      await client.query("COMMIT");
      return { ok: true, id };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  private assertVacancyAcceptsPublicApplications(
    row: { titulo: string; estado: string; lim: Date; fecha_publicacion_desde?: Date | null } | undefined
  ): string {
    if (!row) {
      throw new NotFoundException("La vacante no existe.");
    }
    if (row.estado !== "Publicada") {
      throw new BadRequestException("Esta vacante ya no acepta postulaciones.");
    }
    const today = bogotaCalendarYmdFromDate();
    const vd = row.fecha_publicacion_desde;
    if (vd != null) {
      const vs =
        vd instanceof Date
          ? bogotaCalendarYmdFromDate(vd)
          : String(vd).trim().slice(0, 10);
      if (today < vs) {
        throw new BadRequestException("Esta vacante aun no esta abierta a postulaciones en linea.");
      }
    }
    const lim =
      row.lim instanceof Date ? bogotaCalendarYmdFromDate(row.lim) : String(row.lim).trim().slice(0, 10);
    if (lim < today) {
      throw new BadRequestException("La fecha limite de postulacion ya vencio.");
    }
    return String(row.titulo || "").trim();
  }

  /** MIME declarado o inferido por nombre (p. ej. octet-stream + .pdf). */
  private resolveCvMimeOrThrow(file: Express.Multer.File): string {
    const raw = String(file.mimetype || "")
      .split(";")[0]
      ?.trim()
      .toLowerCase();
    if (raw && JOB_CV_MIME_ALLOWED.has(raw)) {
      return raw;
    }
    const loose = raw === "application/octet-stream" || raw === "binary/octet-stream" || raw === "";
    if (loose) {
      const lower = String(file.originalname || "").toLowerCase();
      const dot = lower.lastIndexOf(".");
      const ext = dot >= 0 ? lower.slice(dot) : "";
      const mapped = CV_FILENAME_EXT_TO_MIME[ext];
      if (mapped) {
        return mapped;
      }
    }
    throw new BadRequestException(
      "Formato de archivo no permitido. Use PDF, Word (doc/docx) o imagen (jpeg, png, webp o gif)."
    );
  }

  private async attachJobApplicationCvJson(
    adjuntos: Record<string, unknown>[],
    dto: CreateJobApplicationDto,
    attachment?: Express.Multer.File
  ) {
    if (attachment?.buffer && attachment.buffer.length > 0) {
      const mime = this.resolveCvMimeOrThrow(attachment);
      const origRaw = String(attachment.originalname || "hoja-de-vida").trim().slice(0, 240);
      const safeTail = origRaw.replace(/[^\w.\-\sÁÉÍÓÚáéíóúñÑ]+/g, "_").replace(/\s+/g, "_");
      const fileLabel = safeTail.length ? safeTail : "hoja-de-vida";

      if (this.r2.hasUploadsClient()) {
        const key = `job-applications/${randomUUID()}/${Date.now()}-${fileLabel}`;
        await this.r2.putJobCv(key, attachment.buffer, mime);
        const url = this.r2.publicUrl(key);
        adjuntos.push({
          kind: "cv_file",
          name: origRaw || fileLabel,
          mime,
          ...(url ? { url } : {}),
          storageKey: key
        });
        return;
      }

      const size = attachment.size ?? attachment.buffer.length;
      if (size > MAX_CV_INLINE_STORE_BYTES) {
        throw new BadRequestException(
          `Sin almacenamiento R2 configurado solo se pueden adjuntar archivos hasta ${Math.round(MAX_CV_INLINE_STORE_BYTES / 1024 / 1024)} MB (configura CF_R2_* en la API para archivos hasta 6 MB).`
        );
      }
      adjuntos.push({
        kind: "cv_blob",
        name: origRaw || fileLabel,
        mime,
        data: attachment.buffer.toString("base64")
      });
      return;
    }

    const fname = String(dto.attachmentFileName || "").trim();
    if (fname) {
      adjuntos.push({ kind: "cv_filename", name: fname });
      return;
    }

    throw new BadRequestException("Debe adjuntar la hoja de vida (PDF, Word o imagen).");
  }

  async create(dto: CreateB2bProspectDto) {
    const phoneCheck = this.normalizePhone(dto.phone);
    if (!phoneCheck.ok) {
      throw new BadRequestException(
        "Telefono invalido. Colombia: celular 10 digitos que empiezan por 3 (puede incluir +57). Otros paises: entre 8 y 15 digitos."
      );
    }

    const msg = String(dto.message || "").trim();
    if (msg.length < 30) {
      throw new BadRequestException("El mensaje debe tener al menos 30 caracteres.");
    }

    const email = normalizeEmailFromUnknown(dto.email) ?? "";

    const ins = await this.pool.query<{ id: string }>(
      `INSERT INTO prospectos_contacto_b2b (
          nombre_contacto, nombre_empresa, nit, cargo_contacto, telefono, correo_electronico,
          tipo_servicio, tipo_operacion, frecuencia_operacion, ventana_inicio_servicio, mensaje
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id::text AS id`,
      [
        normalizeDbTextUpperFromUnknown(dto.name),
        normalizeDbTextUpperFromUnknown(dto.company),
        dto.taxId.trim(),
        normalizeDbTextUpperFromUnknown(dto.position),
        phoneCheck.formatted,
        email,
        normalizeDbTextUpperFromUnknown(dto.serviceType),
        normalizeDbTextUpperFromUnknown(dto.operationType),
        normalizeDbTextUpperFromUnknown(dto.operationFrequency),
        normalizeDbTextUpperFromUnknown(dto.startWindow),
        normalizeDbTextUpperFromUnknown(msg)
      ]
    );

    const id = ins.rows[0]?.id;
    const bodyJson = JSON.stringify({
      id,
      ...dto,
      email,
      phone: phoneCheck.formatted,
      message: msg
    });

    /** No bloquea la respuesta HTTP: la cola de correo es secundaria al registro del prospecto. */
    void this.pool
      .query(`INSERT INTO correos_salida (direccion_destino, asunto, cuerpo) VALUES ($1, $2, $3)`, [
        "comercial@antarescargo.com",
        "Nuevo lead B2B",
        bodyJson
      ])
      .catch((e: unknown) => {
        const detail = String(e instanceof Error ? e.message : e || "")
          .replace(/\s+/g, " ")
          .trim();
        this.logger.warn(
          `No se pudo encolar correo B2B para prospecto ${id}: ${detail ? detail.slice(0, 160) : "sin detalle"}`
        );
      });

    return { ok: true, id };
  }
}
