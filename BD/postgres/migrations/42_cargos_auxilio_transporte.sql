-- Auxilio de transporte de referencia por cargo (contratación / nómina).

ALTER TABLE cargos
  ADD COLUMN IF NOT EXISTS auxilio_transporte NUMERIC(14,2);

COMMENT ON COLUMN cargos.auxilio_transporte IS
  'Auxilio legal mensual de referencia; 0 si el salario supera 2 SMMLV.';
