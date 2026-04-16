# Arquitectura sugerida

## Vista general

Arquitectura modular orientada a dominio:

- **Frontend web:** SPA/PWA con diseño responsive y accesible.
- **API backend:** servicios REST con control RBAC y validaciones.
- **Base de datos relacional:** persistencia transaccional.
- **Cola de trabajos:** autoaprobación de solicitudes a los 10 minutos.
- **Notificaciones:** email e in-app.
- **Auditoría:** trazabilidad de acciones administrativas.

## Módulos funcionales

1. **Sitio público**
   - Contenido comercial.
   - Formulario de contacto B2B (persistencia + envío de email).
2. **Identidad y acceso**
   - Registro cliente.
   - Login.
   - Recuperación de contraseña.
   - Gestión de sesión y refresh.
3. **Solicitudes y viajes**
   - CRUD de solicitudes con reglas por estado.
   - Flujo de aprobación manual/automático.
   - Asignación de vehículo y conductor.
   - Seguimiento de estados: Pendiente, Aprobada, En tránsito, Completada, Cancelada, Rechazada.
4. **Administración operativa**
   - Bandeja de pendientes con temporizador.
   - Gestión de flota y conductores.
   - Historial y reportes.
5. **Nómina**
   - Empleados.
   - Liquidación mensual.
   - Desprendible PDF.
   - Exportación Excel/CSV.
6. **Contratación**
   - Vacantes.
   - Pipeline.
   - Entrevistas.
   - Contrato desde plantilla.

## Modelo de datos (alto nivel)

- `users`: id, email, password_hash, role, status.
- `companies`: id, name, nit, phone, address.
- `clients`: id, user_id, company_id.
- `contact_requests`: datos del formulario B2B.
- `vehicles`: plate, type, capacity_kg, refrigerated, availability.
- `drivers`: name, phone, license, availability.
- `trip_requests`: datos de origen/destino/carga/temperatura/adjuntos.
- `trips`: trip_number, request_id, vehicle_id, driver_id, route, eta_pickup, eta_delivery, status.
- `notifications`: channel, subject, payload, sent_at, read_at.
- `employees`, `payroll_runs`, `payroll_items`.
- `vacancies`, `candidates`, `interviews`, `contracts`.
- `audit_logs`: actor, action, entity, before, after, timestamp.

## Reglas clave de negocio

- Cliente solo edita/cancela cuando `status = Pendiente`.
- Admin puede editar/eliminar en cualquier estado.
- Autoaprobación:
  - Al crear solicitud se programa job a `created_at + 10 minutos`.
  - Si sigue pendiente, se aprueba y asigna activo más adecuado.
- Aprobación/rechazo generan notificación in-app + correo.

## Seguridad

- RBAC por middleware.
- Validación de entradas en frontend/backend.
- Protección de endpoints críticos con rate limiting.
- Hash de contraseñas y tokens de recuperación con expiración.
- Registro de auditoría en acciones sensibles.

## Stack productivo recomendado

- Frontend: Next.js + TypeScript + Tailwind.
- Backend: Node.js + NestJS.
- DB: PostgreSQL + Prisma.
- Jobs: BullMQ + Redis.
- Archivos: S3/Supabase.
- Email: Resend.
- PDF/Excel: Puppeteer + SheetJS.

## Stack de esta entrega (MVP ejecutable inmediato)

Para acelerar validación funcional:

- `index.html` + `styles.css` + `app.js`.
- Persistencia en `localStorage`.
- Flujo de autoaprobación simulado por temporizador en cliente.
- Exportación CSV y generación textual de contrato.

Este MVP cubre reglas y UX requeridas; la arquitectura productiva queda definida para siguiente iteración.
