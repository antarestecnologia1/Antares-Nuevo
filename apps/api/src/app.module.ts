import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { BullModule } from "@nestjs/bull";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { RequestsModule } from "./requests/requests.module";
import { AuditModule } from "./audit/audit.module";
import { FilesModule } from "./files/files.module";
import { MailModule } from "./mail/mail.module";
import { PayrollModule } from "./payroll/payroll.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 80
      }
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>("REDIS_HOST"),
          port: Number(config.get<string>("REDIS_PORT"))
        }
      })
    }),
    PrismaModule,
    AuthModule,
    RequestsModule,
    AuditModule,
    FilesModule,
    MailModule,
    PayrollModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
