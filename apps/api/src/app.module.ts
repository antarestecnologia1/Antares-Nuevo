import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { FilesModule } from "./files/files.module";
import { MailModule } from "./mail/mail.module";
import { PayrollModule } from "./payroll/payroll.module";
import { PortalModule } from "./portal/portal.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    PortalModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
