import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import { monthUtcBounds } from "./colombian-monthly-payroll";
import { PortalService } from "../portal/portal.service";

@Injectable()
export class PayrollAutomationService {
  private readonly logger = new Logger(PayrollAutomationService.name);

  constructor(
    private readonly portal: PortalService,
    private readonly config: ConfigService
  ) {}

  /**
   * Diario 07:00 America/Bogotá: cada empleado se liquida si **hoy** es día de cierre de su periodicidad
   * (quincena, catorcena, fin de mes, fin de intervalo semanal del mes).
   */
  @Cron("0 7 * * *", { name: "payrollAutomaticDaily", timeZone: "America/Bogota" })
  async cronLiquidacionPorPeriodicidad(): Promise<void> {
    const off = String(this.config.get("PAYROLL_AUTOGENERATE_DISABLED") ?? "").toLowerCase() === "true";
    if (off) {
      this.logger.debug("Liquidación automática: deshabilitada (PAYROLL_AUTOGENERATE_DISABLED).");
      return;
    }
    try {
      const result = await this.portal.generateAutomaticLiquidacionesForReferenceDate(new Date());
      this.logger.log(
        `Nómina auto (fecha ref. servidor → calendario Bogotá en motor): +${result.created} / omitidas ${result.skipped}. ` +
          (result.messages.length ? result.messages.join(" | ").slice(0, 800) : "")
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error(`Liquidación automática diaria falló: ${msg}`);
    }
  }

  /**
   * `fechaReferencia` = día civil Colombia `YYYY-MM-DD` (medianoche efectiva −05:00).
   * `periodoYm` = último día de ese mes (útil cerrar sólo mensuales sobre todo).
   * Sin cuerpo: **hoy** (instante servidor interpretado como calendario Bogotá dentro del portal).
   */
  async triggerAutogeneration(body?: { fechaReferencia?: string; periodoYm?: string }) {
    const fr = body?.fechaReferencia?.trim();
    if (typeof fr === "string" && fr !== "") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fr)) throw new BadRequestException("fechaReferencia debe ser YYYY-MM-DD");
      const d = new Date(`${fr}T12:00:00-05:00`);
      if (Number.isNaN(d.getTime())) throw new BadRequestException("fechaReferencia inválida");
      return this.portal.generateAutomaticLiquidacionesForReferenceDate(d);
    }
    const ym = body?.periodoYm?.trim();
    if (typeof ym === "string" && ym !== "") {
      if (!/^(\d{4})-(0[1-9]|1[0-2])$/.test(ym)) throw new BadRequestException("periodoYm debe ser YYYY-MM");
      const b = monthUtcBounds(ym);
      if (!b) throw new BadRequestException("periodoYm inválido");
      return this.portal.generateAutomaticLiquidacionesForReferenceDate(b.monthEnd);
    }
    return this.portal.generateAutomaticLiquidacionesForReferenceDate(new Date());
  }
}
