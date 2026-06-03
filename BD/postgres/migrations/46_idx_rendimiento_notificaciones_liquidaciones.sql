-- LEGACY/idempotente: solo bases existentes. Instalación nueva -> índices ya en
-- ../tablas/22_notificaciones.sql y ../tablas/19_liquidaciones_nomina.sql.
--
-- Rendimiento de lectura del bootstrap y del endpoint liviano de notificaciones:
--  - notificaciones: el portal ordena por fecha_creacion DESC, tanto global (admin)
--    como por usuario (GET /portal/notifications y bootstrap no-admin).
--  - liquidaciones_nomina: el bootstrap ordena por fecha_creacion DESC y los borrados
--    en cascada / consultas por empleado filtran por id_empleado (FK sin índice).

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_fecha
  ON notificaciones (id_usuario, fecha_creacion DESC);

CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha
  ON notificaciones (fecha_creacion DESC);

CREATE INDEX IF NOT EXISTS idx_liquidaciones_empleado
  ON liquidaciones_nomina (id_empleado);

CREATE INDEX IF NOT EXISTS idx_liquidaciones_fecha
  ON liquidaciones_nomina (fecha_creacion DESC);
