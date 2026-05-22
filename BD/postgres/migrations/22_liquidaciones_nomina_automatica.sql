-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Origen de la liquidación (manual vs generación programada) y detalle JSON de novedades (ausencias/incap./vac.).
-- KEYS.payrollRuns: liquidacionOrigin, noveltiesDetail

ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS origen_liquidacion VARCHAR(32) NOT NULL DEFAULT 'manual';
ALTER TABLE public.liquidaciones_nomina ADD COLUMN IF NOT EXISTS novedades_liquidacion_json JSONB;

COMMENT ON COLUMN public.liquidaciones_nomina.origen_liquidacion IS 'manual | automatica · liquida quien disparó la fila.';
COMMENT ON COLUMN public.liquidaciones_nomina.novedades_liquidacion_json IS 'Resumen novedades (incap./vacaciones, proporcionalización, fecha ingreso) — orientativo junto contador.';

