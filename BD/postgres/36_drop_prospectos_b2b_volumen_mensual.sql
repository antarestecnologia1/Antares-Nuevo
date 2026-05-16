-- Elimina volumen mensual del formulario B2B (ya no se solicita en index.html).

ALTER TABLE public.prospectos_contacto_b2b
  DROP COLUMN IF EXISTS volumen_mensual_aprox_kg;
