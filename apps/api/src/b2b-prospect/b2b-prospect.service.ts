import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../database/database.module";
import { CreateB2bProspectDto } from "./dto/create-b2b-prospect.dto";

@Injectable()
export class B2bProspectService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  private normalizePhone(raw: string): { ok: boolean; formatted: string } {
    const digits = String(raw || "").replace(/\D/g, "");
    if (digits.length !== 10 || !digits.startsWith("3")) {
      return { ok: false, formatted: digits };
    }
    return { ok: true, formatted: digits };
  }

  async create(dto: CreateB2bProspectDto) {
    const phoneCheck = this.normalizePhone(dto.phone);
    if (!phoneCheck.ok) {
      throw new BadRequestException("Telefono celular colombiano invalido (10 digitos, inicia en 3).");
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
