import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { FilesModule } from "./files/files.module";
import { MailModule } from "./mail/mail.module";
import { PayrollModule } from "./payroll/payroll.module";
import { PortalModule } from "./portal/portal.module";
import { B2bProspectModule } from "./b2b-prospect/b2b-prospect.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 80
      }
    ]),
    DatabaseModule,
    AuthModule,
    FilesModule,
    MailModule,
    PayrollModule,
    PortalModule,
    B2bProspectModule,
    UploadsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
