import { Module, forwardRef } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { MailModule } from "../mail/mail.module";
import { UploadsModule } from "../uploads/uploads.module";
import { PortalController } from "./portal.controller";
import { PortalService } from "./portal.service";

@Module({
  imports: [DatabaseModule, MailModule, forwardRef(() => UploadsModule)],
  controllers: [PortalController],
  providers: [PortalService],
  exports: [PortalService]
})
export class PortalModule {}
