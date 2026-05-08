import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import type { Express } from "express";
import type { Pool } from "pg";
import { PG_POOL } from "../database/database.module";
import { CreateB2bProspectDto } from "./dto/create-b2b-prospect.dto";
import { CreateJobApplicationDto } from "./dto/create-job-application.dto";
import { R2Service } from "../uploads/r2.service";

const JOB_CV_MIME_ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

/** Sin R2, el archivo se guarda en adjuntos_json (base64) — tamaño máximo servidor. */
const MAX_CV_INLINE_STORE_BYTES = 1_500_000;

@Injectable()
export class B2bProspectService {
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const b0 = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());
    if (b0.getTime() > today.getTime()) {
      throw new BadRequestException("La fecha de nacimiento no puede ser futura.");
    }
    let age = today.getFullYear() - y;
    const md = today.getMonth() - (mo - 1);
    if (md < 0 || (md === 0 && today.getDate() < d)) {
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
    }>(
      `SELECT id::text, titulo, departamento, ciudad, fecha_limite_postulacion,
              salario_oferta::text, requisitos, estado::text AS estado, nombre_cargo_denorm
       FROM vacantes
       WHERE estado = 'Publicada'::estado_vacante
         AND fecha_limite_postulacion >= CURRENT_DATE
       ORDER BY fecha_creacion DESC`
    );
    return r.rows.map((v) => {
      const d = v.fecha_limite_postulacion;
      const deadline =
        d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
      return {
        id: v.id,
        title: v.titulo,
        department: v.departamento,
        city: v.ciudad,
        deadline,
        salaryOffer: Number(v.salario_oferta),
        requirements: v.requisitos,
        status: v.estado,
        positionName: v.nombre_cargo_denorm
      };
    });
  }

  /** Postulación anónima persistida en tabla candidatos (`multipart/form-data`, campo archivo `attachment`). */
  async createJobApplication(dto: CreateJobApplicationDto, attachment?: Express.Multer.File) {
    const phone = this.normalizePhoneFlexible(dto.phone);
    if (phone.length < 7 || phone.length > 32) {
      throw new BadRequestException("Telefono invalido.");
    }

    const email = String(dto.email || "")
      .trim()
      .toLowerCase();
    const idDoc = String(dto.idDoc || "")
      .trim()
      .replace(/\s+/g, "");

    const birthSql = this.assertApplicantBirthDate(dto.birthDate);
    const expYears = Math.min(65, Math.max(0, Number(dto.experienceYears)));
    if (!Number.isFinite(expYears)) {
      throw new BadRequestException("Años de experiencia invalidos.");
    }

    const adjuntos: Record<string, unknown>[] = [{ kind: "experience_notes", text: String(dto.experience || "").trim() }];
    await this.attachJobApplicationCvJson(adjuntos, dto, attachment);

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const vac = await client.query<{
        id: string;
        titulo: string;
        estado: string;
        lim: Date;
      }>(
        `SELECT id::text, titulo, estado::text, fecha_limite_postulacion AS lim
         FROM vacantes
         WHERE id = $1::uuid
         FOR UPDATE`,
        [dto.vacancyId]
      );
      const row = vac.rows[0];
      if (!row) {
        throw new NotFoundException("La vacante no existe.");
      }
      if (row.estado !== "Publicada") {
        throw new BadRequestException("Esta vacante ya no acepta postulaciones.");
      }
      const lim = row.lim instanceof Date ? row.lim.toISOString().slice(0, 10) : String(row.lim).slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      if (lim < today) {
        throw new BadRequestException("La fecha limite de postulacion ya vencio.");
      }

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
          dto.name.trim(),
          email,
          phone,
          dto.documentType,
          idDoc,
          dto.city.trim(),
          dto.address.trim(),
          birthSql,
          expYears,
          row.titulo,
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

  private async attachJobApplicationCvJson(
    adjuntos: Record<string, unknown>[],
    dto: CreateJobApplicationDto,
    attachment?: Express.Multer.File
  ) {
    if (attachment?.buffer && attachment.buffer.length > 0) {
      const mime = String(attachment.mimetype || "")
        .split(";")[0]
        ?.trim()
        .toLowerCase();
      if (!mime || !JOB_CV_MIME_ALLOWED.has(mime)) {
        throw new BadRequestException(
          "Formato de archivo no permitido. Use PDF, Word (doc/docx) o imagen (jpeg, png, webp o gif)."
        );
      }
      const origRaw = String(attachment.originalname || "hoja-de-vida").trim().slice(0, 240);
      const safeTail = origRaw.replace(/[^\w.\-\sÁÉÍÓÚáéíóúñÑ]+/g, "_").replace(/\s+/g, "_");
      const fileLabel = safeTail.length ? safeTail : "hoja-de-vida";

      if (this.r2.isEnabled()) {
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

    const vol = Number(dto.monthlyVolumeKg);
    if (!Number.isFinite(vol) || vol < 100) {
      throw new BadRequestException("Volumen mensual debe ser al menos 100 kg.");
    }

    const msg = String(dto.message || "").trim();
    if (msg.length < 30) {
      throw new BadRequestException("El mensaje debe tener al menos 30 caracteres.");
    }

    const email = String(dto.email || "")
      .trim()
      .toLowerCase();

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const ins = await client.query<{ id: string }>(
        `INSERT INTO prospectos_contacto_b2b (
          nombre_contacto, nombre_empresa, nit, cargo_contacto, telefono, correo_electronico,
          tipo_servicio, tipo_operacion, frecuencia_operacion, ventana_inicio_servicio, volumen_mensual_aprox_kg, mensaje
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id::text AS id`,
        [
          dto.name.trim(),
          dto.company.trim(),
          dto.taxId.trim(),
          dto.position.trim(),
          phoneCheck.formatted,
          email,
          dto.serviceType.trim(),
          dto.operationType.trim(),
          dto.operationFrequency.trim(),
          dto.startWindow.trim(),
          vol,
          msg
        ]
      );

      const id = ins.rows[0]?.id;
      const bodyJson = JSON.stringify({
        id,
        ...dto,
        email,
        phone: phoneCheck.formatted,
        monthlyVolumeKg: vol,
        message: msg
      });

      await client.query(
        `INSERT INTO correos_salida (direccion_destino, asunto, cuerpo)
         VALUES ($1, $2, $3)`,
        ["comercial@antarescargo.com", "Nuevo lead B2B", bodyJson]
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
}
