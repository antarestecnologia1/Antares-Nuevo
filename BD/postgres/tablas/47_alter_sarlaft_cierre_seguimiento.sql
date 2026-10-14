-- Bitácora y cierre formal de alertas / revisiones SARLAFT / PTE.
-- Idempotente. Complementa 42_sarlaft_pte.sql.

ALTER TABLE alertas_sarlaft ADD COLUMN IF NOT EXISTS seguimiento TEXT;
ALTER TABLE alertas_sarlaft ADD COLUMN IF NOT EXISTS decision_cierre VARCHAR(64);
ALTER TABLE alertas_sarlaft ADD COLUMN IF NOT EXISTS notas_cierre TEXT;

ALTER TABLE revisiones_sarlaft ADD COLUMN IF NOT EXISTS seguimiento TEXT;
ALTER TABLE revisiones_sarlaft ADD COLUMN IF NOT EXISTS decision_cierre VARCHAR(64);
ALTER TABLE revisiones_sarlaft ADD COLUMN IF NOT EXISTS notas_cierre TEXT;
ALTER TABLE revisiones_sarlaft ADD COLUMN IF NOT EXISTS fecha_cierre TIMESTAMPTZ;
ALTER TABLE revisiones_sarlaft ADD COLUMN IF NOT EXISTS cerrado_por VARCHAR(255);
