import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { normalizeSupabaseProjectUrl } from "../common/normalize-supabase-url";
import { normalizeDatabaseUrl } from "../database/normalize-database-url";

type ProbeResult = {
  ok: boolean;
  status: number;
  detail: string;
};

function sanitizeProbeDetail(raw: unknown, maxLength = 120): string {
  const text = String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "sin detalle";
  const clean = text
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[jwt]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/https?:\/\/\S+/gi, "[url]");
  if (clean.length > maxLength) return `${clean.slice(0, maxLength - 1)}…`;
  return clean;
}

@Injectable()
export class SupabaseReadinessService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseReadinessService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    void this.reportReadiness();
  }

  private async reportReadiness() {
    const url = normalizeSupabaseProjectUrl(this.config.get<string>("SUPABASE_URL"));
    const serviceKey = String(this.config.get<string>("SUPABASE_SERVICE_ROLE_KEY") ?? "").trim();
    const anonKey = String(
      this.config.get<string>("SUPABASE_ANON_KEY") ??
        this.config.get<string>("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
        ""
    ).trim();
    const databaseUrl = normalizeDatabaseUrl(this.config.get<string>("DATABASE_URL") ?? "");

    if (!url) {
      this.logger.warn("Supabase: SUPABASE_URL no configurada. Se omiten verificaciones remotas.");
      return;
    }

    const notes: string[] = [];

    if (serviceKey) {
      const restProbe = await this.probe(
        `${url}/rest/v1/empresas?select=id&limit=1`,
        {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`
        }
      );
      if (restProbe.ok) notes.push("REST service role OK");
      else this.logger.warn(`Supabase REST no respondió correctamente: ${restProbe.detail}`);
    } else {
      this.logger.warn("Supabase: falta SUPABASE_SERVICE_ROLE_KEY. Auth admin, Storage y validaciones servidor quedarán limitadas.");
    }

    if (anonKey) {
      const authProbe = await this.probe(`${url}/auth/v1/settings`, {
        apikey: anonKey
      });
      if (authProbe.ok) notes.push("anon key OK");
      else this.logger.warn(`Supabase Auth (anon) no respondió correctamente: ${authProbe.detail}`);
    } else {
      this.logger.warn("Supabase: falta SUPABASE_ANON_KEY. El flujo browser/magic-link no se podrá validar completamente.");
    }

    if (databaseUrl) notes.push("DATABASE_URL presente");
    else {
      this.logger.warn(
        "Supabase remoto está configurado, pero falta DATABASE_URL. La API podrá validar Supabase/Auth/Storage, pero Portal/Auth/PG no quedarán completos hasta configurar Postgres."
      );
    }

    if (notes.length) {
      this.logger.log(`Supabase listo: ${notes.join(" · ")}.`);
    }
  }

  private async probe(url: string, headers: Record<string, string>): Promise<ProbeResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal
      });
      await response.text().catch(() => "");
      return {
        ok: response.ok,
        status: response.status,
        detail: `HTTP ${response.status}`
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        detail: sanitizeProbeDetail(error instanceof Error ? error.message : String(error))
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
