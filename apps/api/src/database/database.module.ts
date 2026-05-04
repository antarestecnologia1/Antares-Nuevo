import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Pool } from "pg";

export const PG_POOL = "PG_POOL";

function sslForDatabaseUrl(url: string | undefined): boolean | { rejectUnauthorized: boolean } {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.includes("supabase.co") || lower.includes("pooler.supabase.com")) {
    return { rejectUnauthorized: false };
  }
  /** Render Postgres (*.render.com), Neon, RDS: TLS habitualmente requerido fuera de la red interna del proveedor. */
  if (
    lower.includes(".render.com") ||
    lower.includes("neon.tech") ||
    lower.includes(".amazonaws.com")
  ) {
    return { rejectUnauthorized: false };
  }
  if (lower.includes("sslmode=require") || lower.includes("sslmode=no-verify")) {
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
