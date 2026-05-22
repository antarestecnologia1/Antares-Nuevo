-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Índices para solape de agenda (POST /portal/transport-schedule-busy).
-- Instalación nueva: índices ya en 07_indices.sql.
-- No se usa GiST sobre tstzrange(): el constructor no es IMMUTABLE en PostgreSQL (42P17).
-- La API filtra con: recogida < fin_nuevo AND fin_programado > inicio_nuevo.

CREATE INDEX IF NOT EXISTS idx_viajes_transporte_recogida_programada
  ON viajes_transporte (fecha_hora_recogida_programada);

CREATE INDEX IF NOT EXISTS idx_viajes_transporte_entrega_programada
  ON viajes_transporte (fecha_hora_entrega_programada)
  WHERE fecha_hora_entrega_programada IS NOT NULL;
