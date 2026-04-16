import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { RequestsService } from "./requests.service";
import { RequestsController } from "./requests.controller";
import { AutoApprovalProcessor } from "./workers/auto-approval.processor";
import { MailModule } from "../mail/mail.module";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "auto-approval"
    }),
    MailModule,
    AuditModule
  ],
  providers: [RequestsService, AutoApprovalProcessor],
  controllers: [RequestsController]
})
export class RequestsModule {}
