-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Elimina adjuntos de solicitudes de transporte (ya no se usan en portal ni API).

ALTER TABLE public.solicitudes_transporte
  DROP COLUMN IF EXISTS adjuntos_nombres_json;
