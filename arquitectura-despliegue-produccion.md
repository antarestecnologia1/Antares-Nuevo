# Arquitectura de Despliegue en Produccion

Documento de referencia para desplegar la aplicacion Antares en un entorno de produccion robusto, escalable y mantenible.

## 1) Arquitectura recomendada (alto nivel)

### Frontend
- Stack: Next.js + TypeScript.
- Separacion recomendada:
  - `web-public`: sitio corporativo/landing (SEO).
  - `web-portal`: portal autenticado (operacion interna y clientes).
- Hosting recomendado:
  - Vercel (ideal para Next.js), o
  - Cloudflare Pages (alternativa costo/beneficio).
- Autenticacion en frontend:
  - cookies HttpOnly, evitar tokens en localStorage.

### Backend (API)
- Stack recomendado: NestJS (alternativa: Express/Fastify).
- Dominio modular:
  - auth
  - users/roles/permissions
  - companies
  - requests/trips
  - vehicles/drivers
  - payroll
  - recruitment
  - files/contracts
  - notifications
- Deploy recomendado:
  - Railway / Render / Fly.io / ECS (segun presupuesto y escala).

### Base de datos
- Motor: PostgreSQL administrado.
- Proveedores sugeridos:
  - Neon, Supabase, AWS RDS.
- ORM recomendado: Prisma.
- Buenas practicas:
  - migraciones versionadas
  - indices por estado, fecha, cliente y rutas de consulta frecuente
  - soft-delete en entidades criticas
  - auditoria (tabla de logs de cambios)

### Cache y Jobs
- Redis para:
  - colas (BullMQ)
  - rate limiting distribuido
  - sesiones revocables
- Jobs de negocio:
  - auto-aprobacion de solicitudes en 10 minutos
  - envio de emails
  - recordatorios y alertas
  - procesos batch de reporteria

### Archivos y contratos
- Object storage:
  - AWS S3 o Cloudflare R2.
- Adjuntos y contratos mediante URLs firmadas.
- Generacion DOCX/PDF en backend (workers), no en frontend.

---

## 2) Seguridad (obligatorio)

- JWT de corta vida + refresh token rotativo (o sesiones firmadas).
- RBAC por middleware/guards (Admin, RRHH, Cliente, etc.).
- Validacion de entradas y salidas:
  - class-validator o Zod.
- Hardening API:
  - Helmet
  - CORS estricto
  - CSRF (si usas cookies de sesion)
  - rate limiting
- Secretos:
  - gestionados por secret manager
  - rotacion periodica de claves
- Auditoria:
  - bitacora de acciones administrativas y eventos sensibles.

---

## 3) Observabilidad

- Logs estructurados:
  - Pino + collector (Datadog/ELK/Loki).
- Errores:
  - Sentry.
- Metricas:
  - Prometheus/Grafana o Datadog.
- Endpoints operativos:
  - `/health`
  - `/ready`
- Alertas clave:
  - latencia alta API
  - errores 5xx
  - colas bloqueadas
  - conexiones DB saturadas

---

## 4) CI/CD recomendado

- GitHub Actions:
  - lint
  - test
  - build
  - migraciones controladas
  - deploy por ambiente
- Ambientes:
  - dev
  - staging
  - prod
- Gobierno de cambios:
  - proteccion de rama principal
  - PR obligatorio
  - rollback automatizado o guiado

---

## 5) Topologia minima recomendada (practica)

- Frontend publico y portal: Vercel.
- API backend: Render o Railway.
- PostgreSQL administrado: Neon/Supabase/RDS.
- Redis: Upstash o Redis Cloud.
- Storage: S3 o R2.
- DNS/SSL/WAF/CDN: Cloudflare.

---

## 6) Modelo de datos base (nucleo)

- `users`
- `roles`
- `permissions`
- `companies`
- `requests`
- `request_events`
- `trips`
- `trip_status_history`
- `vehicles`
- `drivers`
- `payroll_employees`
- `payroll_runs`
- `vacancies`
- `candidates`
- `candidate_stage_history`
- `contracts`
- `files`
- `notifications`
- `audit_logs`

---

## 7) Plan de migracion sugerido (desde estado actual)

### Fase 1
- Extraer backend de:
  - Auth
  - Users
  - Companies
  - Requests/Trips

### Fase 2
- Conectar frontend al backend real.
- Reducir dependencia de localStorage para datos criticos.

### Fase 3
- Integrar Redis + BullMQ para:
  - auto-aprobacion
  - notificaciones
  - tareas asincronas.

### Fase 4
- Migrar payroll/recruitment a backend persistente.
- Integrar storage real para adjuntos y contratos.

### Fase 5
- Hardening final:
  - seguridad
  - performance
  - observabilidad
  - plan de continuidad y recuperacion.

---

## 8) Checklist de salida a produccion

- [ ] Variables de entorno separadas por ambiente
- [ ] Migraciones aplicadas y verificadas
- [ ] Backups automaticos + prueba de restauracion
- [ ] Alertas configuradas
- [ ] HTTPS y dominios listos
- [ ] Politicas CORS/CSRF/rate limit activas
- [ ] Monitoreo y tracking de errores activos
- [ ] Pruebas funcionales smoke en staging y prod
- [ ] Plan de rollback documentado

---

## Nota final

Esta arquitectura permite crecer desde una version funcional hacia una plataforma empresarial con trazabilidad, seguridad y escalabilidad reales.
