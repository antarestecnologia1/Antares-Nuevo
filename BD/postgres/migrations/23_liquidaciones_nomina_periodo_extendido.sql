-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Ampliar periodo_mes para cortes quincenales / catorcenales / semanales (ej. 2026-05-Q1, 2026-05-S2).

ALTER TABLE public.liquidaciones_nomina
  ALTER COLUMN periodo_mes TYPE VARCHAR(32);

COMMENT ON COLUMN public.liquidaciones_nomina.periodo_mes IS
  'Período liquidado: YYYY-MM (mensual) o YYYY-MM-Q1|Q2 (quincenal), YYYY-MM-C1|C2 (catorcenal), YYYY-MM-Sn (semanal).';
