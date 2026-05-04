import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../database/database.module";
import { CreateB2bProspectDto } from "./dto/create-b2b-prospect.dto";
import { CreateJobApplicationDto } from "./dto/create-job-application.dto";

@Injectable()
export class B2bProspectService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

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

  /** Postulación anónima persistida en tabla candidatos. */
  async createJobApplication(dto: CreateJobApplicationDto) {
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

    const adjuntos = [
      { kind: "experience_notes", text: String(dto.experience || "").trim() },
      ...(dto.attachmentFileName
        ? [{ kind: "cv_filename", name: String(dto.attachmentFileName).trim() }]
        : [])
    ];

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
          ciudad, direccion, anios_experiencia, aspiracion_salarial, fecha_disponible_ingreso,
          titulo_vacante_denorm, etapa_proceso, adjuntos_json, origen
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, 0, 0, CURRENT_DATE,
          $9, 'Recibido', $10::jsonb, 'Sitio web'
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
