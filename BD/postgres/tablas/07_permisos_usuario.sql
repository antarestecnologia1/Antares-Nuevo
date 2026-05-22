-- Tabla: permisos_usuario
-- Ejecutar después de ../02_enums.sql y tablas previas en orden_ejecucion.txt

CREATE TABLE permisos_usuario (
  id_usuario    UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  permiso       VARCHAR(64) NOT NULL,
  PRIMARY KEY (id_usuario, permiso)
);

COMMENT ON TABLE permisos_usuario IS 'Permisos granulares (PERMISSIONS en app); coherentes con rol.';
