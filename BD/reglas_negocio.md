# Reglas de negocio e integridad — Antares

Documento complementario a los scripts en `postgres/` (**tablas y columnas en español**). Conviene implementar parte en **CHECK / FK / triggers** y parte en **backend** (validaciones de transición, permisos, SMMLV actualizado).

---

## 1. General

| Regla | Detalle |
|--------|---------|
| **Multiempresa** | Usuarios cliente y datos operativos acotados por `id_empresa` / `id_empresa_cliente` donde aplique. |
| **Auditoría** | Campos `fecha_creacion`, `fecha_actualizacion`; opcional tabla de auditoría para cambios sensibles. |
| **Borrado** | Preferir borrado lógico (`fecha_eliminacion` / `activo`) en maestras; política clara antes de `ON DELETE CASCADE` en solicitudes/viajes. |

---

## 2. Usuarios y acceso

| Regla | Detalle |
|--------|---------|
| **Correo único** | Un correo por usuario: `UNIQUE` en `usuarios.correo_electronico`. |
| **Contraseña** | Nunca en claro; solo `hash_contrasena` (Argon2/bcrypt) + política en aplicación. |
| **Estado de cuenta** | Transiciones: `pendiente` → `aprobado` \| `rechazado` (`estado_cuenta_usuario`). |
| **Rol vs permisos** | `permisos_usuario` no debe contradecir `rol_usuario` sin política explícita. |
| **Cliente** | Solo ve solicitudes de su empresa (`id_empresa` del usuario / `id_empresa_cliente` en solicitud). |

---

## 3. Transporte y solicitudes

| Regla | Detalle |
|--------|---------|
| **Placa** | Formato Colombia típico AAA000; validar en app. |
| **Unicidad placa** | `vehiculos.placa` único (índice único parcial si hay borrado lógico). |
| **Conductor** | Documento válido; licencia no vencida para asignar a `viajes_transporte`. |
| **Fechas** | `fecha_hora_recogida` y política de “no pasado”; `fecha_hora_entrega_estimada` > recogida. |
| **Estados** | Valores = `estado_solicitud_transporte`, texto como en `STATUS` de `app.js`. Transiciones según `STATUS_TRANSITIONS`. |
| **Tarifa** | El cliente no fija la tarifa final; Antares asigna (`valor_tarifa_viaje`). |
| **Viaje** | `viajes_transporte` 1:1 con `solicitudes_transporte` cuando hay recurso; sin fila si solo está aprobada sin asignar. `numero_viaje` único. |
| **Ocupación** | `disponible` / `ocupado_por_sistema` en flota; coherencia con viajes activos en app. |

---

## 4. Nómina y recursos humanos (Colombia)

| Regla | Detalle |
|--------|---------|
| **Salario mínimo** | `empleados_nomina.salario_base` ≥ SMMLV (`parametros_sistema`). |
| **Auxilio de transporte** | Norma salario ≤ 2 SMMLV; validar en liquidación. |
| **Contratos** | Catálogo alineado a práctica colombiana. |
| **Seguridad social** | EPS, pensión y ARL en `empleados_nomina`; cumplimiento en `registros_cumplimiento_sst`. |
| **Liquidación** | `liquidaciones_nomina`: el prototipo permite varias filas por empleado/mes; opcional `UNIQUE (id_empleado, periodo_mes)` en producción. |
| **Pago** | `liquidacion_pagada` con autorización; `pago_aprobado_por` si aplica. |

---

## 5. Contratación

| Regla | Detalle |
|--------|---------|
| **Pipeline** | `candidatos.etapa_proceso` según flujo; no “Contratado” sin contrato si así lo define la política. |
| **Contrato** | Plantillas Word en almacenamiento; metadatos en `contratos`. |
| **Vinculación** | Al contratar: fila en `empleados_nomina` y, si aplica, `conductores`. |

---

## 6. Cumplimiento laboral y SST

| Regla | Detalle |
|--------|---------|
| **Vencimientos** | `registros_cumplimiento_sst.fecha_vencimiento_control`; alertas 30/60 días. |
| **Trazabilidad** | `codigo_documento` por tipo; evidencias externas con URL/hash. |

---

## 7. Autorizaciones

| Regla | Detalle |
|--------|---------|
| **Estado** | `estado_aprobacion`: `pendiente` → `aprobado` \| `rechazado`; si `rechazado`, `motivo_rechazo` obligatorio. |
| **Datos** | `datos_json` validado por `tipo_solicitud` en aplicación. |

---

## 8. Constraints sugeridos en SQL

- FK entre maestras (`empresas`, `usuarios`, `cargos`, …) y transaccionales.
- `CHECK` en montos no negativos y fechas coherentes (fin ≥ inicio en ausencias).
- `UNIQUE` en `vehiculos.placa`, `usuarios.correo_electronico`, `solicitudes_transporte.numero_solicitud`, `viajes_transporte.numero_viaje`, `(empleados_nomina.id_empresa, empleados_nomina.numero_documento)`.
- Autorizaciones: `solicitudes_autorizacion` (`tipo_solicitud`, `datos_json`, `estado_aprobacion`).

---

## 9. Parámetros legales variables

Tabla `parametros_sistema` (`clave`, `valor_numerico`, `valor_texto`, `vigente_desde`, `vigente_hasta`, `descripcion`) para SMMLV, auxilio transporte, UVT, topes, etc.
