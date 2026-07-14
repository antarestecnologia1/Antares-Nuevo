-- Actualización de vigencias SST / conductores
-- Generado desde actulizacion/empleados_nomina_rows.sql
-- Reglas aplicadas:
--   Examen ocupacional periódico: vencimiento = fecha examen + 1 año
--   Examen instruvial: vencimiento = fecha examen + 2 años
--   Licencia: se conserva fecha_vencimiento_licencia del origen (RUNT)
-- Empleados con datos de cumplimiento: 44 de 45 registros exportados

BEGIN;

-- 1. LUIS MIGUEL GIRALDO GOMEZ (1036254990)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-05-29'::date,
  fecha_vencimiento_examen_ocupacional = '2027-05-29'::date,
  fecha_examen_instruvial = '2024-06-18'::date,
  fecha_vencimiento_examen_instruvial = '2026-06-18'::date,
  numero_licencia = '1036254990',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2029-05-09'::date,
  fecha_actualizacion = now()
WHERE id = '0493aca4-e730-457b-bc6b-7e5885160171'::uuid;

-- 2. WILLIAN DAVID BEDOYA OCAMPO (1040046659)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2025-08-29'::date,
  fecha_vencimiento_examen_ocupacional = '2026-08-29'::date,
  fecha_examen_instruvial = '2025-08-29'::date,
  fecha_vencimiento_examen_instruvial = '2027-08-29'::date,
  numero_licencia = '1040046659',
  categoria_licencia = 'C1',
  fecha_vencimiento_licencia = '2028-09-01'::date,
  fecha_actualizacion = now()
WHERE id = '0a019932-ae31-496e-80d0-74be92062d03'::uuid;

-- 3. MAURICIO ANTONIO SANCHEZ ROMAN (15386494)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-03-11'::date,
  fecha_vencimiento_examen_ocupacional = '2027-03-11'::date,
  fecha_examen_instruvial = '2023-10-24'::date,
  fecha_vencimiento_examen_instruvial = '2025-10-24'::date,
  numero_licencia = '15386494',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2026-08-06'::date,
  fecha_actualizacion = now()
WHERE id = '0f12f936-e664-4ed4-927d-f0f5e15449f8'::uuid;

-- 4. LEIDI CATALINA ALZATE MOLINA (39457520)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2024-10-17'::date,
  fecha_vencimiento_examen_ocupacional = '2025-10-17'::date,
  fecha_actualizacion = now()
WHERE id = '0fa62dcb-e085-4f36-b6cd-27d70ccb2a5f'::uuid;

-- 5. FREY ANTONIO VILLADA BEDOYA (15383835)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2024-11-12'::date,
  fecha_vencimiento_examen_ocupacional = '2025-11-12'::date,
  numero_licencia = '15383835',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2028-08-19'::date,
  fecha_actualizacion = now()
WHERE id = '16af724c-646a-47df-a2de-3e4148b644e6'::uuid;

-- 6. JUAN CAMILO OSORIO ECHEVERRY (1007170678)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2025-09-01'::date,
  fecha_vencimiento_examen_ocupacional = '2026-09-01'::date,
  fecha_examen_instruvial = '2025-09-01'::date,
  fecha_vencimiento_examen_instruvial = '2027-09-01'::date,
  numero_licencia = '1007170678',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2026-09-15'::date,
  fecha_actualizacion = now()
WHERE id = '18a3a77f-2ace-49b9-ac5f-6c2bcccaa74b'::uuid;

-- 7. JHONATAN DE JESUS RIOS TABARES (1040041290)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-06-09'::date,
  fecha_vencimiento_examen_ocupacional = '2027-06-09'::date,
  fecha_examen_instruvial = '2024-11-16'::date,
  fecha_vencimiento_examen_instruvial = '2026-11-16'::date,
  numero_licencia = '1040041290',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2027-11-05'::date,
  fecha_actualizacion = now()
WHERE id = '190f45ef-d3dd-4b9c-b23c-8aa6b78a24a5'::uuid;

-- 8. MATEO GIRALDO VILLA (1040033159)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2025-12-09'::date,
  fecha_vencimiento_examen_ocupacional = '2026-12-09'::date,
  fecha_examen_instruvial = '2025-12-10'::date,
  fecha_vencimiento_examen_instruvial = '2027-12-10'::date,
  numero_licencia = '1040033159',
  categoria_licencia = 'C1',
  fecha_vencimiento_licencia = '2028-09-24'::date,
  fecha_actualizacion = now()
WHERE id = '2007e5c4-f800-43fb-9c02-4c57e40c5523'::uuid;

-- 9. JUAN ESTEBAN CAICEDO MONSALVE (1039886049)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-02-23'::date,
  fecha_vencimiento_examen_ocupacional = '2027-02-23'::date,
  numero_licencia = '1039886049',
  categoria_licencia = 'B2',
  fecha_vencimiento_licencia = '2031-10-08'::date,
  fecha_actualizacion = now()
WHERE id = '22a9b3ac-fb73-4155-b17a-2bca36fb22f0'::uuid;

-- 10. JORGE IVAN BECERRA GRAJALES (15385024)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2025-04-05'::date,
  fecha_vencimiento_examen_ocupacional = '2026-04-05'::date,
  numero_licencia = '15385024',
  categoria_licencia = 'C3',
  fecha_vencimiento_licencia = '2026-07-11'::date,
  fecha_actualizacion = now()
WHERE id = '2453594b-9d69-4a24-9f53-f37c455c2751'::uuid;

-- 11. JUAN MANUEL ARROYAVE ARROYAVE (15383140)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-05-25'::date,
  fecha_vencimiento_examen_ocupacional = '2027-05-25'::date,
  fecha_examen_instruvial = '2026-05-25'::date,
  fecha_vencimiento_examen_instruvial = '2028-05-25'::date,
  numero_licencia = '15383140',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2029-05-21'::date,
  fecha_actualizacion = now()
WHERE id = '292b22aa-5a91-469d-b097-0025c2524556'::uuid;

-- 12. JUAN CAMILO DAVILA SERNA (1000307990)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-04-24'::date,
  fecha_vencimiento_examen_ocupacional = '2027-04-24'::date,
  fecha_examen_instruvial = '2026-04-24'::date,
  fecha_vencimiento_examen_instruvial = '2028-04-24'::date,
  numero_licencia = '1000307990',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2029-04-23'::date,
  fecha_actualizacion = now()
WHERE id = '2da6fb36-5fd0-4f5a-bb3e-90e01d7f4c42'::uuid;

-- 13. YUDIER MAURICIO CASTANO GIRALDO (1007285704)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-03-12'::date,
  fecha_vencimiento_examen_ocupacional = '2027-03-12'::date,
  fecha_examen_instruvial = '2022-07-26'::date,
  fecha_vencimiento_examen_instruvial = '2024-07-26'::date,
  numero_licencia = '1007285704',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2026-07-14'::date,
  fecha_actualizacion = now()
WHERE id = '313658ce-ed02-467a-aa94-4364f70090d2'::uuid;

-- 14. CESAR CASTRO RIOS (15444753)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-06-16'::date,
  fecha_vencimiento_examen_ocupacional = '2027-06-16'::date,
  fecha_examen_instruvial = '2026-06-17'::date,
  fecha_vencimiento_examen_instruvial = '2028-06-17'::date,
  numero_licencia = '15444753',
  categoria_licencia = 'B2',
  fecha_vencimiento_licencia = '2032-10-12'::date,
  fecha_actualizacion = now()
WHERE id = '35774206-20b4-41a2-9241-51c5f4d48cfd'::uuid;

-- 15. JHONATAN ALEXANDER CHICA CASTRO (1040049665)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-02-24'::date,
  fecha_vencimiento_examen_ocupacional = '2027-02-24'::date,
  fecha_examen_instruvial = '2023-10-24'::date,
  fecha_vencimiento_examen_instruvial = '2025-10-24'::date,
  numero_licencia = '1040049665',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2027-04-17'::date,
  fecha_actualizacion = now()
WHERE id = '3caec55f-da14-4ddf-a1ca-943c39f5cf44'::uuid;

-- 16. JUAN DIEGO CHICA PATINO (1047973361)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2025-08-15'::date,
  fecha_vencimiento_examen_ocupacional = '2026-08-15'::date,
  fecha_examen_instruvial = '2025-08-19'::date,
  fecha_vencimiento_examen_instruvial = '2027-08-19'::date,
  numero_licencia = '1047973361',
  categoria_licencia = 'C3',
  fecha_vencimiento_licencia = '2027-03-13'::date,
  fecha_actualizacion = now()
WHERE id = '3e99a6c4-8d4f-4324-9edf-90c5ad7d9160'::uuid;

-- 17. JHON FREDY CHAVARRIA CORREA (8157663)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2025-09-15'::date,
  fecha_vencimiento_examen_ocupacional = '2026-09-15'::date,
  fecha_examen_instruvial = '2025-11-11'::date,
  fecha_vencimiento_examen_instruvial = '2027-11-11'::date,
  numero_licencia = '8157663',
  categoria_licencia = 'C3',
  fecha_vencimiento_licencia = '2028-09-09'::date,
  fecha_actualizacion = now()
WHERE id = '405535cc-ca9a-4a4c-91d2-3fd93878ee9b'::uuid;

-- 18. LUIS ALBERTO OROZCO BLANDON (71117026)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-05-12'::date,
  fecha_vencimiento_examen_ocupacional = '2027-05-12'::date,
  numero_licencia = '71117026',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2026-08-05'::date,
  fecha_actualizacion = now()
WHERE id = '56eab5a0-6b22-4630-8f07-c7c0f82a8673'::uuid;

-- 19. DEINER ARLEX GARZON ARCILA (1015216703)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-01-27'::date,
  fecha_vencimiento_examen_ocupacional = '2027-01-27'::date,
  numero_licencia = '1015216703',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2029-01-05'::date,
  fecha_actualizacion = now()
WHERE id = '57603eab-314e-407d-822c-633c8702b766'::uuid;

-- 20. MIGUEL ANGEL BETANCUR OSORIO (1017925284)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-04-07'::date,
  fecha_vencimiento_examen_ocupacional = '2027-04-07'::date,
  fecha_examen_instruvial = '2026-04-08'::date,
  fecha_vencimiento_examen_instruvial = '2028-04-08'::date,
  numero_licencia = '1017925284',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2029-03-24'::date,
  fecha_actualizacion = now()
WHERE id = '5ed13d53-398d-4dcb-94f8-a360f54efda4'::uuid;

-- 21. CARLOS JOSE CABALLERO BARRIOS (3014198026)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-04-30'::date,
  fecha_vencimiento_examen_ocupacional = '2027-04-30'::date,
  fecha_examen_instruvial = '2015-11-11'::date,
  fecha_vencimiento_examen_instruvial = '2017-11-11'::date,
  numero_licencia = '000000000',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2026-06-30'::date,
  fecha_actualizacion = now()
WHERE id = '687928c7-4965-41bf-9816-3eae0f41ae90'::uuid;

-- 22. SANTIAGO ROJAS CANO (1000443464)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-01-05'::date,
  fecha_vencimiento_examen_ocupacional = '2027-01-05'::date,
  fecha_examen_instruvial = '2026-01-05'::date,
  fecha_vencimiento_examen_instruvial = '2028-01-05'::date,
  numero_licencia = '1000443464',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2028-11-04'::date,
  fecha_actualizacion = now()
WHERE id = '70f0ba2e-3f5c-423e-8b9f-eb291711dba4'::uuid;

-- 23. DANIELA RIOS BUITRAGO (1040046090)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-02-14'::date,
  fecha_vencimiento_examen_ocupacional = '2027-02-14'::date,
  fecha_actualizacion = now()
WHERE id = '71c07cbe-7a24-4edf-8afb-4b9f7949a22c'::uuid;

-- 24. FRANKLIN GARZON ROJAS (1015216671)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2025-12-19'::date,
  fecha_vencimiento_examen_ocupacional = '2026-12-19'::date,
  fecha_examen_instruvial = '2026-05-12'::date,
  fecha_vencimiento_examen_instruvial = '2028-05-12'::date,
  numero_licencia = '1015216671',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2028-04-03'::date,
  fecha_actualizacion = now()
WHERE id = '75c51210-3c7a-4c32-ab42-acdf5ff12af6'::uuid;

-- 25. CRISTIAN CAMILO ECHEVERRY CASTANEDA (1001470840)
UPDATE public.empleados_nomina
SET
  numero_licencia = '15355468',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2026-06-30'::date,
  fecha_actualizacion = now()
WHERE id = '862aa9bc-5659-4feb-9e5f-de670aa45b86'::uuid;

-- 26. EDISON ANDRES DAVILA SERNA (70787132)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2025-06-13'::date,
  fecha_vencimiento_examen_ocupacional = '2026-06-13'::date,
  fecha_examen_instruvial = '2023-10-18'::date,
  fecha_vencimiento_examen_instruvial = '2025-10-18'::date,
  numero_licencia = '70787132',
  categoria_licencia = 'B2',
  fecha_vencimiento_licencia = '2030-12-04'::date,
  fecha_actualizacion = now()
WHERE id = '8cfc77b9-130f-4375-af7b-07a61a2244d7'::uuid;

-- 27. JHN FREDY ARISTIZABAL AGUIRRE (15384148)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2025-06-25'::date,
  fecha_vencimiento_examen_ocupacional = '2026-06-25'::date,
  numero_licencia = '15384148',
  categoria_licencia = 'C3',
  fecha_vencimiento_licencia = '2026-06-29'::date,
  fecha_actualizacion = now()
WHERE id = '8de4ee82-ff61-4481-98b7-c9d87377e674'::uuid;

-- 28. MILTON OROZCO RAVE (1001723966)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-03-09'::date,
  fecha_vencimiento_examen_ocupacional = '2027-03-09'::date,
  fecha_examen_instruvial = '2026-03-10'::date,
  fecha_vencimiento_examen_instruvial = '2028-03-10'::date,
  numero_licencia = '1001723966',
  categoria_licencia = 'C1',
  fecha_vencimiento_licencia = '2027-05-19'::date,
  fecha_actualizacion = now()
WHERE id = '919e7c7f-a698-4e9b-9011-a1bb533017fa'::uuid;

-- 29. JUAN PABLO CARDONA MARTINEZ (1193542603)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-03-11'::date,
  fecha_vencimiento_examen_ocupacional = '2027-03-11'::date,
  fecha_examen_instruvial = '2024-07-04'::date,
  fecha_vencimiento_examen_instruvial = '2026-07-04'::date,
  numero_licencia = '1193542603',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2027-03-18'::date,
  fecha_actualizacion = now()
WHERE id = 'a021f762-1675-467b-8a87-e276d67b395f'::uuid;

-- 30. WILSON ARLEY BLANDON BEDOYA (1040047065)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-02-25'::date,
  fecha_vencimiento_examen_ocupacional = '2027-02-25'::date,
  fecha_examen_instruvial = '2021-03-11'::date,
  fecha_vencimiento_examen_instruvial = '2023-03-11'::date,
  numero_licencia = '1040047065',
  categoria_licencia = 'B1',
  fecha_vencimiento_licencia = '2029-08-21'::date,
  fecha_actualizacion = now()
WHERE id = 'a2841e59-901c-454d-a6ee-11b42e0094ac'::uuid;

-- 31. CARLOS JOSE CABALLERO BARRIOS (1047464746)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-04-30'::date,
  fecha_vencimiento_examen_ocupacional = '2027-04-30'::date,
  numero_licencia = '1047464746',
  categoria_licencia = 'C1',
  fecha_vencimiento_licencia = '2026-06-26'::date,
  fecha_actualizacion = now()
WHERE id = 'a4e94a33-49aa-4222-b252-365f1edbaa8a'::uuid;

-- 32. DIEGO PABLO SANCHEZ RUIZ (1001724810)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-06-09'::date,
  fecha_vencimiento_examen_ocupacional = '2027-06-09'::date,
  fecha_examen_instruvial = '2022-05-27'::date,
  fecha_vencimiento_examen_instruvial = '2024-05-27'::date,
  numero_licencia = '1001724810',
  categoria_licencia = 'C1',
  fecha_vencimiento_licencia = '2026-08-04'::date,
  fecha_actualizacion = now()
WHERE id = 'bf754af7-796a-433a-a648-8262ad9a88bd'::uuid;

-- 33. JUAN CARLOS ALZATE RIOS (15438517)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-04-09'::date,
  fecha_vencimiento_examen_ocupacional = '2027-04-09'::date,
  fecha_examen_instruvial = '2026-04-08'::date,
  fecha_vencimiento_examen_instruvial = '2028-04-08'::date,
  numero_licencia = '15438517',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2029-01-19'::date,
  fecha_actualizacion = now()
WHERE id = 'c662f4aa-9388-4fd5-b35c-69f3c8497460'::uuid;

-- 34. OSCAR JAVIER CASTRO MORA (1007359273)
UPDATE public.empleados_nomina
SET
  numero_licencia = '1007359273',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2026-06-21'::date,
  fecha_actualizacion = now()
WHERE id = 'd56aff15-6df0-4968-beb2-3d43df9fc301'::uuid;

-- 35. LUIS FERNANDO PELAEZ CASTRO (15431817)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2023-10-19'::date,
  fecha_vencimiento_examen_ocupacional = '2024-10-19'::date,
  fecha_examen_instruvial = '2023-10-19'::date,
  fecha_vencimiento_examen_instruvial = '2025-10-19'::date,
  numero_licencia = '15431817',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2027-06-26'::date,
  fecha_actualizacion = now()
WHERE id = 'd586c400-b28c-4250-b621-c740d5cfacd6'::uuid;

-- 36. JUAN CAMILO TOBON VARGAS (1040051709)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2025-02-24'::date,
  fecha_vencimiento_examen_ocupacional = '2026-02-24'::date,
  numero_licencia = '1040051709',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2028-02-13'::date,
  fecha_actualizacion = now()
WHERE id = 'd955ed5d-8b35-4fdf-b0d8-878095b0b2ea'::uuid;

-- 37. DIEGO LEON ALZATE OSORIO (15353877)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2025-05-20'::date,
  fecha_vencimiento_examen_ocupacional = '2026-05-20'::date,
  numero_licencia = '15353877',
  categoria_licencia = 'B3',
  fecha_vencimiento_licencia = '2032-06-13'::date,
  fecha_actualizacion = now()
WHERE id = 'ea5f43fe-672f-4b86-806e-401581d4f050'::uuid;

-- 38. LAURA CAMILA HENAO CARDONA (1007429903)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-01-18'::date,
  fecha_vencimiento_examen_ocupacional = '2027-01-18'::date,
  fecha_actualizacion = now()
WHERE id = 'ecbee2ce-68fe-4250-b3b8-04bfc4d8efd9'::uuid;

-- 39. JUAN JOSE ROJO CALDERON (1040036548)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-01-07'::date,
  fecha_vencimiento_examen_ocupacional = '2027-01-07'::date,
  fecha_examen_instruvial = '2026-01-07'::date,
  fecha_vencimiento_examen_instruvial = '2028-01-07'::date,
  numero_licencia = '10400036548',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2029-01-05'::date,
  fecha_actualizacion = now()
WHERE id = 'ede1b4f0-8f79-4fe0-bee5-5865ce573674'::uuid;

-- 40. JULIAN TOBON (1040046958)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-06-08'::date,
  fecha_vencimiento_examen_ocupacional = '2027-06-08'::date,
  fecha_examen_instruvial = '2026-06-01'::date,
  fecha_vencimiento_examen_instruvial = '2028-06-01'::date,
  numero_licencia = '1040046958',
  categoria_licencia = 'C3',
  fecha_vencimiento_licencia = '2026-06-30'::date,
  fecha_actualizacion = now()
WHERE id = 'f04daabd-7f1b-41e5-b751-c57529103bf8'::uuid;

-- 41. STIVEN ANDRES ZAPATA OSPINA (1036779230)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-03-19'::date,
  fecha_vencimiento_examen_ocupacional = '2027-03-19'::date,
  numero_licencia = '1036779230',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2029-03-04'::date,
  fecha_actualizacion = now()
WHERE id = 'f4ebb788-a2f8-412f-a49a-5fecd937a849'::uuid;

-- 42. CAMILO BETANCUR OSORIO (1039024796)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2026-04-14'::date,
  fecha_vencimiento_examen_ocupacional = '2027-04-14'::date,
  fecha_examen_instruvial = '2026-04-14'::date,
  fecha_vencimiento_examen_instruvial = '2028-04-14'::date,
  numero_licencia = '1039024796',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2026-08-17'::date,
  fecha_actualizacion = now()
WHERE id = 'f804f04b-1cca-44e5-a41e-cf844ec10cd2'::uuid;

-- 43. YEISON ANDRES HENAO SANTA (1000656483)
UPDATE public.empleados_nomina
SET
  fecha_examen_ocupacional = '2025-02-26'::date,
  fecha_vencimiento_examen_ocupacional = '2026-02-26'::date,
  fecha_examen_instruvial = '2023-12-07'::date,
  fecha_vencimiento_examen_instruvial = '2025-12-07'::date,
  numero_licencia = '1000656483',
  categoria_licencia = 'C2',
  fecha_vencimiento_licencia = '2028-08-13'::date,
  fecha_actualizacion = now()
WHERE id = 'f80919d7-c925-4586-aa87-c0984dced928'::uuid;

-- 44. ANDRES FELIPE BOTERO CASTRO (1036785371)
UPDATE public.empleados_nomina
SET
  numero_licencia = '1036785371',
  categoria_licencia = 'C3',
  fecha_vencimiento_licencia = '2026-07-23'::date,
  fecha_actualizacion = now()
WHERE id = 'fcaafdfc-92a3-4de3-b485-e63340049ee5'::uuid;

-- Sincronizar tabla conductores (mismo documento, rol conductor)
UPDATE public.conductores c
SET
  numero_licencia = e.numero_licencia,
  categoria_licencia = e.categoria_licencia,
  fecha_vencimiento_licencia = e.fecha_vencimiento_licencia,
  fecha_examen_ocupacional = e.fecha_examen_ocupacional,
  fecha_vencimiento_examen_ocupacional = e.fecha_vencimiento_examen_ocupacional,
  fecha_examen_instruvial = e.fecha_examen_instruvial,
  fecha_vencimiento_examen_instruvial = e.fecha_vencimiento_examen_instruvial,
  fecha_actualizacion = now()
FROM public.empleados_nomina e
WHERE trim(c.numero_documento) = trim(e.numero_documento)
  AND lower(trim(coalesce(e.rol_trabajador, ''))) = 'conductor'
  AND (
    e.numero_licencia IS NOT NULL
    OR e.fecha_vencimiento_licencia IS NOT NULL
    OR e.fecha_examen_ocupacional IS NOT NULL
    OR e.fecha_vencimiento_examen_ocupacional IS NOT NULL
    OR e.fecha_examen_instruvial IS NOT NULL
    OR e.fecha_vencimiento_examen_instruvial IS NOT NULL
  );

COMMIT;
