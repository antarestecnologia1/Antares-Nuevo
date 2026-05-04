import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createPgPoolFromEnv } from "./create-pg-pool";
import {
  databaseUrlLikelyHasUnencodedPasswordAt,
  normalizeDatabaseUrl,
  supabasePoolerUrlUsesBarePostgresUser,
  SUPABASE_POOLER_TENANT_ERROR_HELP
} from "./normalize-database-url";

export const PG_POOL = "PG_POOL";

const dbLogger = new Logger("DatabaseModule");

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const connectionString = normalizeDatabaseUrl(config.get<string>("DATABASE_URL") ?? "");
        if (!connectionString) {
          dbLogger.error("DATABASE_URL está vacío: la API arrancará pero auth y portal fallarán hasta configurarla.");
        } else {
          if (databaseUrlLikelyHasUnencodedPasswordAt(connectionString)) {
            dbLogger.warn(
              "DATABASE_URL tiene varios '@' tras el protocolo: si la contraseña contiene @, codifíquela como %40 o use el parámetro [YOUR-PASSWORD] del panel Supabase al copiar la URI."
            );
          }
          if (supabasePoolerUrlUsesBarePostgresUser(connectionString)) {
            dbLogger.error(
              `DATABASE_URL: pooler de Supabase con usuario incorrecto (falta postgres.PROJECT_REF). ${SUPABASE_POOLER_TENANT_ERROR_HELP}`
            );
          } else if (/pooler\.supabase\.com/i.test(connectionString) && /:6543\b/.test(connectionString)) {
            dbLogger.warn(
              "DATABASE_URL apunta al pooler transaccional (6543). Si ve «Tenant or user not found», copie la URI completa del panel o use conexión directa db.xxx.supabase.co:5432."
            );
          }
        }
        return createPgPoolFromEnv(connectionString);
      }
    }
  ],
  exports: [PG_POOL]
})
export class DatabaseModule {}
