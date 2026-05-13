import "./bootstrap-dns";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NextFunction, Request, Response } from "express";
import { AppModule } from "./app.module";

function buildCorsOriginHandler(config: ConfigService) {
  const raw = config.get<string>("CORS_ORIGINS") ?? "";
  const explicit = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  /** Render inyecta RENDER=true; sin esto NODE_ENV a veces no es "production" y CORS queda solo en localhost. */
  const isProd =
    config.get<string>("NODE_ENV") === "production" || process.env.RENDER === "true";

  /** Solo HTTP localhost típicos para desarrollo cuando no hay lista explícita. */
  const devFallback = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080"
  ];

  const prodFallback = [
    "https://app.transportesantares.co",
    "https://transportesantares.co",
    "https://www.transportesantares.co",
    "*.vercel.app",
    "*.pages.dev"
  ];
  /** En producción: dominios por defecto + los de CORS_ORIGINS (no reemplazan el resto). */
  const allowed = !isProd
    ? explicit.length
      ? [...new Set([...devFallback, ...explicit])]
      : devFallback
    : [...new Set([...prodFallback, ...explicit])];
  const exactAllowed = allowed.filter((entry) => !entry.startsWith("*."));
  const wildcardAllowed = allowed
    .filter((entry) => entry.startsWith("*."))
    .map((entry) => entry.slice(1).toLowerCase());

  return (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (exactAllowed.includes(origin)) {
      callback(null, true);
      return;
    }
    const normalizedOrigin = String(origin || "").toLowerCase();
    if (wildcardAllowed.some((suffix) => normalizedOrigin.endsWith(suffix))) {
      callback(null, true);
      return;
    }
    callback(null, false);
  };
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  app.setGlobalPrefix("api");
  app.useBodyParser("json", { limit: "25mb" });
  app.useBodyParser("urlencoded", { extended: true, limit: "25mb" });
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
  app.enableCors({
    origin: buildCorsOriginHandler(config),
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"]
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );
  const port = Number(process.env.PORT || 4000);
  await app.listen(port);
}

void bootstrap();
