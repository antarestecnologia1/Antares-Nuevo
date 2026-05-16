-- Solicitudes: tipo de camión requerido (columna existente) + fuelles opcionales (Turbo/Camión).
-- peso_kg se usa para peso declarado en Tractomula; Turbo/Camión sin peso operativo → 0.

ALTER TABLE solicitudes_transporte
  ADD COLUMN IF NOT EXISTS numero_fuelles INTEGER
  CHECK (numero_fuelles IS NULL OR numero_fuelles >= 0);

COMMENT ON COLUMN solicitudes_transporte.numero_fuelles IS
  'Cantidad de fuelles cuando tipo_vehiculo_solicitado es Turbo o Camión; NULL si no aplica.';

ALTER TABLE solicitudes_transporte
  ALTER COLUMN tipo_vehiculo_solicitado TYPE VARCHAR(64);
