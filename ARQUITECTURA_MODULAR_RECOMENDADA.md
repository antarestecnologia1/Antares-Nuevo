# Arquitectura modular recomendada

Objetivo: dejar de depender de un `app.js` monolítico y editar cada dominio sin tocar toda la app.

## Estructura sugerida

```text
Antares Nuevo/
  apps/
    web/
      src/
        core/
          state.js
          storage.js
          router.js
          notifications.js
          auth.js
          constants.js
        modules/
          solicitudes/
            view.js
            events.js
            service.js
            validators.js
          transporte/
            viajes.view.js
            asignacion.service.js
            flota.view.js
            conductores.view.js
          rrhh/
            candidatos.view.js
            contratacion.view.js
            nomina.view.js
            nomina.service.js
          usuarios/
            view.js
            approvals.js
          perfil/
            view.js
        ui/
          modal.js
          toasts.js
          table.js
          badges.js
        app.js
      index.html
      styles.css
    api/
      prisma/
        schema.prisma
```

## Criterio de separación por módulo

- `view.js`: HTML y componentes de presentación.
- `events.js`: listeners y binding del módulo.
- `service.js`: reglas de negocio y cálculos.
- `validators.js`: validaciones del módulo.

## Flujo humano/contratación recomendado (Colombia)

1. Candidato entra a pipeline.
2. Entrevista y estado `Contratado`.
3. Generación de contrato con `workerRole` (`empleado` o `conductor`).
4. Alta automática en `payrollEmployees`.
5. Si rol conductor, alta automática en `drivers`.
6. En nómina, deducciones automáticas:
   - Salud empleado: 4%
   - Pensión empleado: 4%
   - Fondo solidaridad: 1% (si IBC > 4 SMMLV)

## Plan de migración sin romper producción

1. Crear `apps/web/src/core` con utilidades compartidas.
2. Extraer primero módulo `solicitudes` (vista + eventos + validaciones).
3. Extraer `transporte` (asignación y viajes).
4. Extraer `rrhh` (candidatos, contratación, nómina).
5. Dejar `app.js` solo como orquestador.
6. Añadir pruebas de humo por módulo:
   - crear solicitud
   - aprobar/asignar viaje
   - contratar empleado/conductor
   - generar nómina

## Convenciones recomendadas

- Un archivo por responsabilidad.
- Sin `alert/prompt/confirm`; usar `modal/toast`.
- Nombres de funciones por dominio (`createTripFromRequest`, `calculatePayrollDeduction`).
- Validaciones en archivos dedicados, no mezcladas con render.

