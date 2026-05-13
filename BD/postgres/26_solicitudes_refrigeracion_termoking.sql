-- Solicitudes: modo de transporte en `tipo_servicio` (solo nacional / entre sedes)
-- y bandera explícita `refrigeracion_termoking` (sincronizada con el portal `refrigeracionTermoking`).

ALTER TABLE solicitudes_transporte
  ADD COLUMN IF NOT EXISTS refrigeracion_termoking BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN solicitudes_transporte.refrigeracion_termoking IS
  'Cliente requiere equipo refrigeración Termoking; independiente de tipo_servicio (modo de transporte).';

-- Retrocompatibilidad: inferir bandera desde textos legacy en tipo_servicio
UPDATE solicitudes_transporte
SET refrigeracion_termoking = CASE
  WHEN lower(btrim(coalesce(tipo_servicio, ''))) = 'refrigerated' THEN true
  WHEN lower(btrim(coalesce(tipo_servicio, ''))) = 'dry' THEN false
  WHEN lower(tipo_servicio) LIKE '%sin termoking%' THEN false
  WHEN lower(tipo_servicio) LIKE '%con termoking%' THEN true
  WHEN lower(tipo_servicio) LIKE '%termoking%'
       AND lower(tipo_servicio) NOT LIKE '%sin termoking%' THEN true
  WHEN lower(tipo_servicio) LIKE '%thermo king%' THEN true
  WHEN lower(tipo_servicio) LIKE '%refrigerada%' OR lower(tipo_servicio) LIKE '%refrigerado%' THEN true
  ELSE refrigeracion_termoking
END;

-- Normalizar modo (tipo_servicio) cuando venía combinado con Termoking
UPDATE solicitudes_transporte
SET tipo_servicio = 'Transporte nacional'
WHERE tipo_servicio IN (
  'Transporte nacional con termoking',
  'Transporte nacional sin termoking',
  'refrigerated',
  'dry'
);

UPDATE solicitudes_transporte
SET tipo_servicio = 'Transporte entre sedes del cliente'
WHERE lower(tipo_servicio) LIKE '%entre sedes%'
   OR lower(tipo_servicio) LIKE '%sedes del cliente%';
