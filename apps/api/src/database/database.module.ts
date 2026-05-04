import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createPgPoolFromEnv } from "./create-pg-pool";
import { databaseUrlLikelyHasUnencodedPasswordAt, normalizeDatabaseUrl } from "./normalize-database-url";

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
          if (/pooler\.supabase\.com/i.test(connectionString) && /:6543\b/.test(connectionString)) {
            dbLogger.warn(
              "DATABASE_URL apunta al pooler transaccional (6543). Si ve errores al registrar/iniciar sesión, use en Supabase la cadena Session pool o Direct connection."
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
