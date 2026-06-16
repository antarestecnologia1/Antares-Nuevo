-- Metadatos de notificación: categoría, deep link y entidad relacionada.
-- Ejecutar después de 31_notificaciones_audiencia.sql

ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS categoria VARCHAR(32);
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS deep_link VARCHAR(255);
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS tipo_entidad VARCHAR(32);
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS id_entidad VARCHAR(64);

COMMENT ON COLUMN notificaciones.categoria IS 'request | authorization | hr | system (opcional; el cliente puede inferir).';
COMMENT ON COLUMN notificaciones.deep_link IS 'Hash portal opcional, p. ej. #portal/requests';
COMMENT ON COLUMN notificaciones.tipo_entidad IS 'Tipo de entidad relacionada (request, trip, authorization, employee).';
COMMENT ON COLUMN notificaciones.id_entidad IS 'Identificador de la entidad relacionada (UUID o código de negocio).';

CREATE INDEX IF NOT EXISTS idx_notificaciones_categoria_fecha
  ON notificaciones (categoria, fecha_creacion DESC)
  WHERE categoria IS NOT NULL;
