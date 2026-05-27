import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { PayrollAutomationService } from "./payroll-automation.service";
import { GenerateSlipDto } from "./dto/generate-slip.dto";
import { PayrollService } from "./payroll.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("payroll")
export class PayrollController {
  constructor(
    private readonly payroll: PayrollService,
    private readonly automation: PayrollAutomationService
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
    @Body() body: { fechaReferencia?: string; periodoYm?: string; force?: boolean }
  ) {
    return this.automation.triggerAutogeneration(body);
  }
}
