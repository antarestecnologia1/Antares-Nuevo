import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { UploadsModule } from "../uploads/uploads.module";
import { B2bProspectController } from "./b2b-prospect.controller";
import { B2bProspectService } from "./b2b-prospect.service";

@Module({
  imports: [DatabaseModule, UploadsModule],
  controllers: [B2bProspectController],
  providers: [B2bProspectService]
})
export class B2bProspectModule {}
