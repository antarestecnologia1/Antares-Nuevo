import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

function buildCorsOriginHandler(config: ConfigService) {
  const raw = config.get<string>("CORS_ORIGINS") ?? "";
  const explicit = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isProd = config.get<string>("NODE_ENV") === "production";

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

  const allowed = explicit.length ? explicit : !isProd ? devFallback : [];

  return (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowed.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.setGlobalPrefix("api");
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
