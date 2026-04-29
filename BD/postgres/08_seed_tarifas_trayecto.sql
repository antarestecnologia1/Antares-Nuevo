-- Datos iniciales de tarifas por trayecto (COP, valores orientativos para demo — ajustar en producción).
-- Ejecutar después de `07_indices.sql`.
-- Departamentos y ciudades deben coincidir con COLOMBIA_LOCATIONS en app.js (clave exacta).

INSERT INTO tarifas_trayecto (
  departamento_origen,
  ciudad_origen,
  departamento_destino,
  ciudad_destino,
  valor_tarifa_cop,
  activo
)
VALUES
  -- Bogotá ↔ ciudades principales
  ('Bogota', 'Bogota D.C.', 'Antioquia', 'Medellin', 4200000.00, true),
  ('Antioquia', 'Medellin', 'Bogota', 'Bogota D.C.', 4200000.00, true),
  ('Bogota', 'Bogota D.C.', 'ValleDelCauca', 'Cali', 3800000.00, true),
  ('ValleDelCauca', 'Cali', 'Bogota', 'Bogota D.C.', 3800000.00, true),
  ('Bogota', 'Bogota D.C.', 'Atlantico', 'Barranquilla', 7200000.00, true),
  ('Atlantico', 'Barranquilla', 'Bogota', 'Bogota D.C.', 7200000.00, true),
  ('Bogota', 'Bogota D.C.', 'Bolivar', 'Cartagena', 6800000.00, true),
  ('Bolivar', 'Cartagena', 'Bogota', 'Bogota D.C.', 6800000.00, true),
  ('Bogota', 'Bogota D.C.', 'Magdalena', 'Santa Marta', 7500000.00, true),
  ('Magdalena', 'Santa Marta', 'Bogota', 'Bogota D.C.', 7500000.00, true),
  ('Bogota', 'Bogota D.C.', 'Meta', 'Villavicencio', 1800000.00, true),
  ('Meta', 'Villavicencio', 'Bogota', 'Bogota D.C.', 1800000.00, true),
  ('Bogota', 'Bogota D.C.', 'Santander', 'Bucaramanga', 3200000.00, true),
  ('Santander', 'Bucaramanga', 'Bogota', 'Bogota D.C.', 3200000.00, true),
  ('Bogota', 'Bogota D.C.', 'Boyaca', 'Tunja', 1400000.00, true),
  ('Boyaca', 'Tunja', 'Bogota', 'Bogota D.C.', 1400000.00, true),
  -- Eje cafetero y ciudades cercanas
  ('Antioquia', 'Medellin', 'Quindio', 'Armenia', 1600000.00, true),
  ('Quindio', 'Armenia', 'Antioquia', 'Medellin', 1600000.00, true),
  ('Antioquia', 'Medellin', 'Risaralda', 'Pereira', 1500000.00, true),
  ('Risaralda', 'Pereira', 'Antioquia', 'Medellin', 1500000.00, true),
  ('Antioquia', 'Medellin', 'Caldas', 'Manizales', 1700000.00, true),
  ('Caldas', 'Manizales', 'Antioquia', 'Medellin', 1700000.00, true),
  ('ValleDelCauca', 'Cali', 'Quindio', 'Armenia', 1400000.00, true),
  ('Quindio', 'Armenia', 'ValleDelCauca', 'Cali', 1400000.00, true),
  -- Costa / Caribe
  ('Atlantico', 'Barranquilla', 'Bolivar', 'Cartagena', 950000.00, true),
  ('Bolivar', 'Cartagena', 'Atlantico', 'Barranquilla', 950000.00, true),
  ('Atlantico', 'Barranquilla', 'Magdalena', 'Santa Marta', 1100000.00, true),
  ('Magdalena', 'Santa Marta', 'Atlantico', 'Barranquilla', 1100000.00, true),
  -- Otros trayectos frecuentes
  ('Bogota', 'Bogota D.C.', 'Narino', 'Pasto', 5800000.00, true),
  ('Narino', 'Pasto', 'Bogota', 'Bogota D.C.', 5800000.00, true),
  ('Bogota', 'Bogota D.C.', 'Cauca', 'Popayan', 4800000.00, true),
  ('Cauca', 'Popayan', 'Bogota', 'Bogota D.C.', 4800000.00, true),
  ('Bogota', 'Bogota D.C.', 'Cordoba', 'Monteria', 6200000.00, true),
  ('Cordoba', 'Monteria', 'Bogota', 'Bogota D.C.', 6200000.00, true),
  ('Bogota', 'Bogota D.C.', 'LaGuajira', 'Riohacha', 7800000.00, true),
  ('LaGuajira', 'Riohacha', 'Bogota', 'Bogota D.C.', 7800000.00, true),
  -- Sabana Cundinamarca ↔ Bogotá (rutas cortas)
  ('Cundinamarca', 'Chia', 'Bogota', 'Bogota D.C.', 650000.00, true),
  ('Bogota', 'Bogota D.C.', 'Cundinamarca', 'Chia', 650000.00, true),
  ('Cundinamarca', 'Soacha', 'Bogota', 'Bogota D.C.', 750000.00, true),
  ('Bogota', 'Bogota D.C.', 'Cundinamarca', 'Soacha', 750000.00, true)
ON CONFLICT (
  departamento_origen,
  ciudad_origen,
  departamento_destino,
  ciudad_destino
)
DO UPDATE SET
  valor_tarifa_cop = EXCLUDED.valor_tarifa_cop,
  activo = EXCLUDED.activo,
  fecha_actualizacion = now();
