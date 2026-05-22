-- LEGACY: solo bases existentes. Instalacion nueva -> ../01..10 (CREATE completo).
-- Flota: credenciales de acceso al panel del proveedor de rastreo satelital (texto plano).
-- Instalación nueva: columnas ya en 04_transporte.sql (vehiculos.usuario/password_proveedor_satelite).
-- Sustituye nombre_propietario / nit_cedula_propietario.

ALTER TABLE vehiculos
  ADD COLUMN IF NOT EXISTS usuario_proveedor_satelite VARCHAR(255),
  ADD COLUMN IF NOT EXISTS password_proveedor_satelite TEXT;

ALTER TABLE vehiculos
  DROP COLUMN IF EXISTS nombre_propietario,
  DROP COLUMN IF EXISTS nit_cedula_propietario;

COMMENT ON COLUMN vehiculos.usuario_proveedor_satelite IS 'Usuario en el proveedor de rastreo satelital (portal del GPS).';
COMMENT ON COLUMN vehiculos.password_proveedor_satelite IS 'Contraseña en el proveedor de rastreo satelital; almacenada como texto.';
