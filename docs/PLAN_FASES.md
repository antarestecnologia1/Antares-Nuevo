# Plan de desarrollo por fases

## Fase 0 - Descubrimiento y alcance (1 semana)
- Levantamiento detallado de procesos de transporte de flor, RRHH y contratación.
- Definición de KPIs: tiempos de aprobación, viajes completados, ocupación de flota, costo de nómina.
- Inventario de integraciones externas (correo, almacenamiento, facturación, ERP si existe).
- Mapa de riesgos y plan de mitigación.

## Fase 1 - UX/UI y prototipado (1-2 semanas)
- Sistema de diseño con paleta corporativa:
  - Primary: `#42A5F5`
  - Dark: `#1976D2`
  - Light: `#E3F2FD`
  - White: `#FFFFFF`
- Definición de componentes reutilizables (botones, inputs, tablas, modales, badges de estado).
- Wireframes responsive (mobile, tablet, desktop).
- Prototipo navegable con flujos críticos:
  - Contacto B2B
  - Registro/Login/Recuperación
  - Solicitud de viaje
  - Aprobación admin + autoaprobación 10 min
  - Nómina y contratación

## Fase 2 - Plataforma base (2 semanas)
- Setup frontend, backend, base de datos, autenticación y RBAC.
- Módulo público:
  - Home con hero, servicios, flota, cobertura, contacto B2B.
- Módulo de autenticación:
  - Registro cliente, login, recuperación de contraseña.
- Módulo de solicitudes (cliente):
  - Crear, listar, editar/cancelar en estado pendiente.

## Fase 3 - Operación logística (2-3 semanas)
- Panel administrador:
  - Bandeja de pendientes con temporizador visible.
  - Aprobar/rechazar/editar/eliminar solicitudes.
  - Gestión de flota y conductores.
- Orquestación de autoaprobación:
  - Job a 10 minutos por solicitud.
  - Selección automática de vehículo disponible más adecuado.
- Notificaciones:
  - In-app y por correo para cliente y administrador.

## Fase 4 - Módulos internos (2 semanas)
- Nómina:
  - Registro de empleados.
  - Liquidación mensual.
  - Historial y alertas.
  - Exportación Excel y desprendible PDF.
- Contratación:
  - Vacantes.
  - Pipeline de candidatos.
  - Entrevistas.
  - Generación de contrato por plantilla.

## Fase 5 - Analítica, seguridad y hardening (1-2 semanas)
- Reportería operativa y métricas en dashboard.
- Auditoría de acciones administrativas.
- Rate limiting, validaciones de entrada y controles de acceso por rol.
- Pruebas:
  - Unitarias, integración y E2E.
  - Accesibilidad (WCAG 2.1 AA).
  - Performance y carga.

## Fase 6 - Salida a producción (1 semana)
- CI/CD, variables seguras, HTTPS y dominios.
- Estrategia de despliegue blue/green o rolling.
- Monitoreo y alertamiento.
- Capacitación de usuarios clave y plan de soporte post-lanzamiento.
