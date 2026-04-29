# TODO - Alineacion de tarjetas por modulo

Objetivo: mantener altura y estructura visual consistente de tarjetas en todos los modulos del portal.

## Dashboard
- [x] Unificar estiramiento de tarjetas en `dash-grid`.
- [ ] Validar visualmente KPIs y cards en resoluciones desktop/tablet/mobile.

## Solicitudes
- [x] Alinear tarjetas `p-card` dentro de contenedores de modulo.
- [ ] Revisar formularios colapsables abiertos/cerrados para confirmar alturas.

## Transporte
- [x] Aplicar altura consistente en cards de grillas operativas.
- [ ] Validar tarjetas de Viajes, Conductores, Vehiculos y Calendario.

## RRHH (Nomina y Contratacion)
- [x] Igualar comportamiento de altura en `hiring-actions-grid`, `hiring-data-grid` y `payroll-data-grid`.
- [x] Mantener KPIs (`hr-kpi-card`, `payroll-kpi-card`) al mismo alto por fila.
- [ ] Revisar estados vacios y tablas largas.

## Usuarios
- [x] Forzar altura uniforme para `user-card` en `user-grid` y `user-grid-pending`.
- [x] Mantener consistencia de `users-stat-card` por fila.
- [ ] Validar tarjetas con nombres largos y muchos permisos.

## Autorizaciones
- [x] Heredar reglas globales de estiramiento para cards del modulo.
- [ ] Confirmar que las tarjetas de aprobacion no rompan alineacion con contenido variable.

## Perfil
- [x] Heredar reglas globales de consistencia de alto para tarjetas del modulo.
- [ ] Verificar tarjetas de resumen/perfil con contenido extenso.

## Notificaciones
- [x] Heredar reglas de layout uniforme para cards del modulo.
- [ ] Revisar visualmente lista de notificaciones leidas/no leidas en diferentes anchos.

## Cierre general
- [ ] Ejecutar recorrido completo por todos los modulos con datos reales.
- [ ] Ajustar casos puntuales detectados en QA visual.
