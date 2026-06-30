import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { PortalService } from "../portal/portal.service";
import { PayrollAutomationService } from "./payroll-automation.service";
import { GenerateSlipDto } from "./dto/generate-slip.dto";
import { PayrollService } from "./payroll.service";

type ReqUser = { userId: string; email: string; role: string };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("payroll")
export class PayrollController {
  constructor(
    private readonly payroll: PayrollService,
    private readonly automation: PayrollAutomationService,
    private readonly portal: PortalService
  ) {}

  @Roles("admin", "rrhh")
  @Post("slip")
  generateSlip(@Body() dto: GenerateSlipDto) {
    return this.payroll.generateSlipPayload(dto);
  }

  /**
   * Dispara liquidación según fecha civil CO (`fechaReferencia` YYYY-MM-DD) o cierre último día de `periodoYm`
   * o hoy Bogotá.
   */
  @Roles("admin", "rrhh")
  @Post("autogenerate-period")
  triggerAutogenerate(
    @Req() req: { user: ReqUser },
    @Body()
    body: {
      fechaReferencia?: string;
      periodoYm?: string;
      force?: boolean;
      /** `masiva` = disparada desde portal RRHH; omitido = cron / automática. */
      origin?: "automatica" | "masiva";
    }
  ) {
    return this.automation.triggerAutogeneration({ ...body, actorUserId: req.user.userId });
  }

  /**
   * Crea o actualiza borradores de liquidación del empleado según ausencias y demás novedades
   * en el rango indicado (o en liquidaciones pendientes de pago si no hay rango).
   */
  @Roles("admin", "rrhh")
  @Post("refresh-drafts")
  async refreshDrafts(
    @Req() req: { user: ReqUser },
    @Body()
    body: {
      employeeId: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    await this.portal.assertCanWritePayrollEmployee(req.user.userId, req.user.role, body.employeeId);
    return this.portal.refreshPayrollDraftsForEmployee(body.employeeId, {
      startDate: body.startDate,
      endDate: body.endDate
    });
  }

  /**
   * Prestación de servicios (conductores): calcula viajes/combustible del mes en servidor y persiste en liquidaciones_nomina.
   */
  @Roles("admin", "rrhh")
  @Post("driver-trip-payment")
  async upsertDriverTripPayment(
    @Req() req: { user: ReqUser },
    @Body()
    body: {
      employeeId: string;
      periodYm: string;
      travelAllowanceManualCop?: number;
      fuelReimbursementManualCop?: number;
    }
  ) {
    await this.portal.assertCanWritePayrollEmployee(req.user.userId, req.user.role, body.employeeId);
    return this.portal.upsertDriverTripPaymentDraft(body.employeeId, body.periodYm, {
      travelAllowanceManualCop: body.travelAllowanceManualCop,
      fuelReimbursementManualCop: body.fuelReimbursementManualCop
    }, req.user.userId);
  }
}
