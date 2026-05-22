-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Asociar tarifas por trayecto a uno o varios clientes (empresas).
-- NULL o ARRAY vacío = tarifa general para cualquier empresa (comportamiento anterior).
-- Instalación nueva: ids_empresas e idx_tarifas_trayecto_ruta ya en 04_transporte.sql / 07_indices.sql.

ALTER TABLE tarifas_trayecto
  DROP CONSTRAINT IF EXISTS uq_tarifas_trayecto_ruta;

ALTER TABLE tarifas_trayecto
  ADD COLUMN IF NOT EXISTS ids_empresas UUID[];

COMMENT ON COLUMN tarifas_trayecto.ids_empresas IS
  'Clientes a los que aplica la tarifa; NULL o {} = todos. Permite varias filas misma ruta con distintos clientes/precios.';

CREATE INDEX IF NOT EXISTS idx_tarifas_trayecto_ruta
  ON tarifas_trayecto (departamento_origen, ciudad_origen, departamento_destino, ciudad_destino);
