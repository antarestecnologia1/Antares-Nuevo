-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Índice parcial para agregados públicos de cobertura (últimos meses, solicitudes válidas).
-- Instalación nueva: índice ya en 07_indices.sql.
-- Usado por GET /api/public/transport-request-coverage-stats.
CREATE INDEX IF NOT EXISTS idx_solicitudes_transporte_cobertura_publica
  ON solicitudes_transporte (fecha_creacion DESC)
  WHERE estado NOT IN ('Rechazada'::estado_solicitud_transporte, 'Cancelada'::estado_solicitud_transporte);
