import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Pool } from "pg";

export const PG_POOL = "PG_POOL";

function sslForDatabaseUrl(url: string | undefined): boolean | { rejectUnauthorized: boolean } {
  if (!url) return false;
  if (url.includes("supabase.co") || url.includes("pooler.supabase.com")) {
    return { rejectUnauthorized: false };
  }
  return false;
}

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const connectionString = config.get<string>("DATABASE_URL") ?? "";
        return new Pool({
          connectionString,
          max: 10,
          ssl: sslForDatabaseUrl(connectionString)
        });
      }
    }
  ],
  exports: [PG_POOL]
})
export class DatabaseModule {}
