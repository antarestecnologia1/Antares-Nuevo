-- Función auxiliar (trigger opcional en tablas con fecha_actualizacion)

CREATE OR REPLACE FUNCTION trg_marcar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
