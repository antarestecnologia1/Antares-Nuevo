import { Module, forwardRef } from "@nestjs/common";
import { R2Service } from "./r2.service";
import { UploadsController } from "./uploads.controller";
import { PortalModule } from "../portal/portal.module";

@Module({
  imports: [forwardRef(() => PortalModule)],
  controllers: [UploadsController],
  providers: [R2Service],
  exports: [R2Service]
})
export class UploadsModule {}
