import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Pool } from "pg";
import { databaseUrlLikelyHasUnencodedPasswordAt, normalizeDatabaseUrl } from "./normalize-database-url";

export const PG_POOL = "PG_POOL";

const dbLogger = new Logger("DatabaseModule");

function sslForDatabaseUrl(url: string | undefined): boolean | { rejectUnauthorized: boolean } {
  if (!url) return false;
  const lower = url.toLowerCase();
  /** Host db.<ref>.supabase.co y poolers de Supabase exigen TLS. */
  if (
    lower.includes("supabase.co") ||
    lower.includes("pooler.supabase.com") ||
    lower.includes("pooler.supabase.co")
  ) {
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
        const connectionString = normalizeDatabaseUrl(config.get<string>("DATABASE_URL") ?? "");
        if (!connectionString) {
          dbLogger.error("DATABASE_URL está vacío: la API arrancará pero auth y portal fallarán hasta configurarla.");
        } else {
          if (databaseUrlLikelyHasUnencodedPasswordAt(connectionString)) {
            dbLogger.warn(
              "DATABASE_URL tiene varios '@' tras el protocolo: si la contraseña contiene @, codifíquela como %40 o use el parámetro [YOUR-PASSWORD] del panel Supabase al copiar la URI."
            );
          }
          if (/pooler\.supabase\.com/i.test(connectionString) && /:6543\b/.test(connectionString)) {
            dbLogger.warn(
              "DATABASE_URL apunta al pooler transaccional (6543). Si ve errores al registrar/iniciar sesión, use en Supabase la cadena Session pool o Direct connection."
            );
          }
        }
        return new Pool({
          connectionString,
          max: 10,
          application_name: "antares-api",
          ssl: sslForDatabaseUrl(connectionString),
          connectionTimeoutMillis: 25_000,
          idleTimeoutMillis: 30_000,
          allowExitOnIdle: false
        });
      }
    }
  ],
  exports: [PG_POOL]
})
export class DatabaseModule {}
