-- Prestación de servicios (conductores): tipo_registro y origen en liquidaciones_nomina.

COMMENT ON COLUMN public.liquidaciones_nomina.tipo_registro IS
  'mensual | quincenal | catorcenal | semanal | terminacion | prestacion_viajes → app payrollKind';

COMMENT ON COLUMN public.liquidaciones_nomina.origen_liquidacion IS
  'manual | automatica | masiva | vinculada | prestacion_viajes — quién disparó la liquidación';

ALTER TABLE public.liquidaciones_nomina
  DROP CONSTRAINT IF EXISTS chk_liquidaciones_tipo_registro;

ALTER TABLE public.liquidaciones_nomina
  ADD CONSTRAINT chk_liquidaciones_tipo_registro
  CHECK (
    tipo_registro IN (
      'mensual',
      'quincenal',
      'catorcenal',
      'semanal',
      'terminacion',
      'prestacion_viajes'
    )
  );

ALTER TABLE public.liquidaciones_nomina
  DROP CONSTRAINT IF EXISTS chk_liquidaciones_origen;

ALTER TABLE public.liquidaciones_nomina
  ADD CONSTRAINT chk_liquidaciones_origen
  CHECK (
    origen_liquidacion IN (
      'manual',
      'automatica',
      'automatico',
      'masiva',
      'vinculada',
      'prestacion_viajes'
    )
  );
