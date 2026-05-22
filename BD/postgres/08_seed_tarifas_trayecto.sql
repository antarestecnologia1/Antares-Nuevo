-- Tarifas por trayecto (tabla `tarifas_trayecto`).
-- No se insertan valores de demostración: las tarifas se cargan desde el portal
-- (Transporte · Rutas y tarifas / sync) o mediante proceso propio de negocio.
--
-- Ejecutar después de `tablas/` (orden_ejecucion.txt).
--
-- Si una base ya fue poblada con el seed antiguo de prueba y desea vaciar la tabla:
--   DELETE FROM tarifas_trayecto;
-- (Revise antes si tiene tarifas reales mezcladas.)

SELECT 1;
