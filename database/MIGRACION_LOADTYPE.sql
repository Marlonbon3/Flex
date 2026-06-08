-- ============================================================
-- MIGRACIÓN: Columna LoadType + Catálogos adicionales
-- Ejecutar sobre FlexWebApp DESPUÉS de MIGRACION_CATALOGOS.sql
-- ============================================================

-- 1. Agregar columna LoadType a ContenedoresPaso1
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_NAME = 'ContenedoresPaso1' AND COLUMN_NAME = 'LoadType')
BEGIN
  ALTER TABLE ContenedoresPaso1 ADD LoadType NVARCHAR(200) NULL
  PRINT 'Columna LoadType agregada a ContenedoresPaso1'
END
ELSE
  PRINT 'Columna LoadType ya existe'

-- 2. Insertar catálogos nuevos (solo si no existen aún)

-- Port Of Entry
IF NOT EXISTS (SELECT 1 FROM CatalogosListas WHERE NombreLista = 'portOfEntry')
BEGIN
  INSERT INTO CatalogosListas (NombreLista, Valor, Etiqueta, Orden) VALUES
  ('portOfEntry', 'San Luis Rio Colorado', 'San Luis Rio Colorado', 1),
  ('portOfEntry', 'Nogales',               'Nogales',               2),
  ('portOfEntry', 'Tijuana',               'Tijuana',               3),
  ('portOfEntry', 'El Paso',               'El Paso',               4),
  ('portOfEntry', 'Laredo',                'Laredo',                5),
  ('portOfEntry', 'Yuma',                  'Yuma',                  6)
  PRINT 'Catálogo portOfEntry insertado'
END

-- Load Type
IF NOT EXISTS (SELECT 1 FROM CatalogosListas WHERE NombreLista = 'loadType')
BEGIN
  INSERT INTO CatalogosListas (NombreLista, Valor, Etiqueta, Orden) VALUES
  ('loadType', 'FCL',       'FCL - Full Container Load',        1),
  ('loadType', 'LCL',       'LCL - Less than Container Load',   2),
  ('loadType', 'FTL',       'FTL - Full Truck Load',            3),
  ('loadType', 'LTL',       'LTL - Less than Truck Load',       4),
  ('loadType', 'crossdock', 'Cross-Dock',                       5),
  ('loadType', 'import',    'Importación',                      6),
  ('loadType', 'export',    'Exportación',                      7)
  PRINT 'Catálogo loadType insertado'
END

-- Responsable (empleados/supervisores - agregar desde Administración)
IF NOT EXISTS (SELECT 1 FROM CatalogosListas WHERE NombreLista = 'responsable')
BEGIN
  PRINT 'Catálogo responsable creado vacío - agregar nombres desde panel Admin'
END

-- P.O. # (números de orden - agregar desde Administración)
IF NOT EXISTS (SELECT 1 FROM CatalogosListas WHERE NombreLista = 'poNo')
BEGIN
  PRINT 'Catálogo poNo creado vacío - agregar POs desde panel Admin'
END

PRINT '=== MIGRACION_LOADTYPE completada ==='
