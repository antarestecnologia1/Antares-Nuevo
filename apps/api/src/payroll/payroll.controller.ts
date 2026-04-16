import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { GenerateSlipDto } from "./dto/generate-slip.dto";
import { PayrollService } from "./payroll.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("payroll")
export class PayrollController {
  constructor(private readonly payroll: PayrollService) {}

  @Roles("ADMIN", "RRHH")
  @Post("slip")
  generateSlip(@Body() dto: GenerateSlipDto) {
    return this.payroll.generateSlipPayload(dto);
  }
}
