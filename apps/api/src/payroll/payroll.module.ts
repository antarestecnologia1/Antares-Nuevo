import { Module } from "@nestjs/common";
import { PortalModule } from "../portal/portal.module";
import { PayrollAutomationService } from "./payroll-automation.service";
import { PayrollController } from "./payroll.controller";
import { PayrollService } from "./payroll.service";

@Module({
  imports: [PortalModule],
  providers: [PayrollService, PayrollAutomationService],
  controllers: [PayrollController]
})
export class PayrollModule {}
