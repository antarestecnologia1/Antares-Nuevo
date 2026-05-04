import * as dns from "node:dns";
import { Logger } from "@nestjs/common";
import { Pool, PoolConfig } from "pg";

const log = new Logger("PgPool");

/** Parse mínimo postgresql:// para poder resolver IPv4 sin romper contraseñas codificadas en la URI. */
export function parsePostgresConnectionUrl(connectionString: string): {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
} | null {
  try {
    const u = new URL(connectionString.trim().replace(/^postgresql:/i, "http:"));
    if (!u.hostname) return null;
    return {
      user: decodeURIComponent(u.username || ""),
      password: decodeURIComponent(u.password || ""),
      host: u.hostname,
      port: u.port ? parseInt(u.port, 10) : 5432,
      database: (u.pathname || "/postgres").replace(/^\//, "") || "postgres"
    };
  } catch {
    return null;
  }
}

function sslForDatabaseUrl(url: string | undefined): boolean | { rejectUnauthorized: boolean; servername?: string } {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (
    lower.includes("supabase.co") ||
    lower.includes("pooler.supabase.com") ||
    lower.includes("pooler.supabase.co")
  ) {
    return { rejectUnauthorized: false };
  }
  if (lower.includes(".render.com") || lower.includes("neon.tech") || lower.includes(".amazonaws.com")) {
    return { rejectUnauthorized: false };
  }
  if (lower.includes("sslmode=require") || lower.includes("sslmode=no-verify")) {
    return { rejectUnauthorized: false };
  }
  return false;
}

const sharedPoolOptions: Pick<
  PoolConfig,
  "max" | "application_name" | "connectionTimeoutMillis" | "idleTimeoutMillis" | "allowExitOnIdle"
> = {
  max: 10,
  application_name: "antares-api",
  connectionTimeoutMillis: 25_000,
  idleTimeoutMillis: 30_000,
  allowExitOnIdle: false
};

/**
 * En Render, la ruta IPv6 a Supabase a veces devuelve ENETUNREACH; conectar al IPv4 explícito + SNI resuelve el caso.
 */
export async function createPgPoolFromEnv(connectionString: string): Promise<Pool> {
  if (!connectionString) {
    return new Pool({ connectionString: "postgresql://127.0.0.1:5432/postgres", ...sharedPoolOptions });
  }

  const parsed = parsePostgresConnectionUrl(connectionString);
  /** Solo Supabase: Render ↔ ENETUNREACH IPv6; otros hosts siguen con URI tal cual. */
  const hostNeedsIpv4 = parsed && /supabase/i.test(parsed.host);

  if (!parsed || !hostNeedsIpv4) {
    return new Pool({
      connectionString,
      ssl: sslForDatabaseUrl(connectionString),
      ...sharedPoolOptions
    });
  }

  try {
    const { address } = await dns.promises.lookup(parsed.host, { family: 4 });
    const baseSsl = sslForDatabaseUrl(connectionString);
    const ssl =
      baseSsl && typeof baseSsl === "object"
        ? { ...baseSsl, servername: parsed.host }
        : baseSsl;

    log.log(`Postgres: resuelto ${parsed.host} -> IPv4 ${address} (TLS SNI ${parsed.host})`);

    return new Pool({
      host: address,
      port: parsed.port,
      user: parsed.user,
      password: parsed.password,
      database: parsed.database,
      ssl,
      ...sharedPoolOptions
    });
  } catch (e) {
    log.warn(`Postgres: lookup IPv4 falló para ${parsed.host}, usando URI original: ${String(e)}`);
    return new Pool({
      connectionString,
      ssl: sslForDatabaseUrl(connectionString),
      ...sharedPoolOptions
    });
  }
}
