import { Controller, Get } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";

/**
 * Sonda pública y barata (sin base de datos) para el ping que mantiene despierto el servicio.
 *
 * Render suspende las instancias sin tráfico y el siguiente request paga el arranque completo
 * (~50 s medidos), que el visitante ve como "Cargando vacantes…". Un cron externo
 * (cron-job.org, GitHub Actions, UptimeRobot) contra `GET /api/health` cada 10 minutos lo evita.
 * Límite alto porque el cron y los chequeos de la plataforma comparten IP de salida.
 */
@Controller("health")
export class HealthController {
  @Throttle({ default: { ttl: 60_000, limit: 60 } })
  @Get()
  check() {
    return { status: "ok", uptimeSeconds: Math.round(process.uptime()) };
  }
}
