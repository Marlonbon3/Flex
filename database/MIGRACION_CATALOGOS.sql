-- ============================================================
-- MIGRACIÓN: Catálogos configurables + limpieza ContenedoresPaso3
-- Ejecutar en SQL Server Management Studio sobre FlexWebApp
-- ============================================================

-- 1. Crear tabla CatalogosListas si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CatalogosListas' AND xtype='U')
BEGIN
  CREATE TABLE CatalogosListas (
    ListaID      INT IDENTITY(1,1) PRIMARY KEY,
    NombreLista  NVARCHAR(100) NOT NULL,
    Valor        NVARCHAR(200) NOT NULL,
    Etiqueta     NVARCHAR(200) NOT NULL,
    Activo       BIT DEFAULT 1,
    Orden        INT DEFAULT 0,
    FechaCreacion DATETIME DEFAULT GETDATE(),
    CONSTRAINT UQ_Lista_Valor UNIQUE (NombreLista, Valor)
  )
  PRINT 'Tabla CatalogosListas creada'
END
ELSE
  PRINT 'Tabla CatalogosListas ya existe - omitiendo creacion'

-- 2. Insertar valores por defecto (solo si la tabla estaba vacía)
IF NOT EXISTS (SELECT 1 FROM CatalogosListas)
BEGIN
  INSERT INTO CatalogosListas (NombreLista, Valor, Etiqueta, Orden) VALUES
  -- Trailer Type
  ('trailerType', 'flatbed',      'Flatbed',      1),
  ('trailerType', 'refrigerated', 'Refrigerated', 2),
  ('trailerType', 'tanker',       'Tanker',       3),
  ('trailerType', 'van',          'Van',          4),
  -- Uso Embarques
  ('usoEmbarques', 'export',  'Exportación',    1),
  ('usoEmbarques', 'import',  'Importación',    2),
  ('usoEmbarques', 'storage', 'Almacenamiento', 3),
  -- Empresas
  ('empresas', 'BOSE',   'BOSE',   1),
  ('empresas', 'DYSON',  'DYSON',  2),
  ('empresas', 'NESTLE', 'NESTLE', 3),
  -- Origen
  ('origen', 'Aire',        'Aire',        1),
  ('origen', 'Marítimo',    'Marítimo',    2),
  ('origen', 'Nacional',    'Nacional',    3),
  ('origen', 'Importación', 'Importación', 4),
  -- Longitud Contenedor
  ('longitudContenedor', '20''', '20''', 1),
  ('longitudContenedor', '40''', '40''', 2),
  ('longitudContenedor', '48''', '48''', 3),
  ('longitudContenedor', '53''', '53''', 4),
  ('longitudContenedor', 'Otro', 'Otro', 5)

  PRINT 'Valores por defecto insertados en CatalogosListas'
END

-- 3. Limpiar columnas obsoletas de ContenedoresPaso3
-- NOTA: Si hay constraints (FK, default), se eliminan primero

-- 3a. Paso2ID - puede tener FK a ContenedoresPaso2
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_NAME = 'ContenedoresPaso3' AND COLUMN_NAME = 'Paso2ID')
BEGIN
  DECLARE @constraint NVARCHAR(200)
  SELECT @constraint = tc.CONSTRAINT_NAME
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
  JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
    ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
  WHERE tc.TABLE_NAME = 'ContenedoresPaso3'
    AND kcu.COLUMN_NAME = 'Paso2ID'
    AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
  IF @constraint IS NOT NULL
    EXEC('ALTER TABLE ContenedoresPaso3 DROP CONSTRAINT ' + @constraint)
  ALTER TABLE ContenedoresPaso3 DROP COLUMN Paso2ID
  PRINT 'Paso2ID eliminado de ContenedoresPaso3'
END

-- Helper: elimina DEFAULT constraint de una columna si existe, luego dropa la columna
-- 3b. DescargaCompleta
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_NAME = 'ContenedoresPaso3' AND COLUMN_NAME = 'DescargaCompleta')
BEGIN
  DECLARE @df1 NVARCHAR(200)
  SELECT @df1 = dc.name
  FROM sys.default_constraints dc
  JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
  JOIN sys.tables t  ON c.object_id = t.object_id
  WHERE t.name = 'ContenedoresPaso3' AND c.name = 'DescargaCompleta'
  IF @df1 IS NOT NULL EXEC('ALTER TABLE ContenedoresPaso3 DROP CONSTRAINT ' + @df1)
  ALTER TABLE ContenedoresPaso3 DROP COLUMN DescargaCompleta
  PRINT 'DescargaCompleta eliminado'
END

-- 3c. FechaDescarga
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_NAME = 'ContenedoresPaso3' AND COLUMN_NAME = 'FechaDescarga')
BEGIN
  DECLARE @df2 NVARCHAR(200)
  SELECT @df2 = dc.name
  FROM sys.default_constraints dc
  JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
  JOIN sys.tables t  ON c.object_id = t.object_id
  WHERE t.name = 'ContenedoresPaso3' AND c.name = 'FechaDescarga'
  IF @df2 IS NOT NULL EXEC('ALTER TABLE ContenedoresPaso3 DROP CONSTRAINT ' + @df2)
  ALTER TABLE ContenedoresPaso3 DROP COLUMN FechaDescarga
  PRINT 'FechaDescarga eliminado'
END

-- 3d. HoraDescarga
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_NAME = 'ContenedoresPaso3' AND COLUMN_NAME = 'HoraDescarga')
BEGIN
  DECLARE @df3 NVARCHAR(200)
  SELECT @df3 = dc.name
  FROM sys.default_constraints dc
  JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
  JOIN sys.tables t  ON c.object_id = t.object_id
  WHERE t.name = 'ContenedoresPaso3' AND c.name = 'HoraDescarga'
  IF @df3 IS NOT NULL EXEC('ALTER TABLE ContenedoresPaso3 DROP CONSTRAINT ' + @df3)
  ALTER TABLE ContenedoresPaso3 DROP COLUMN HoraDescarga
  PRINT 'HoraDescarga eliminado'
END

-- 3e. InformacionAdicional
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_NAME = 'ContenedoresPaso3' AND COLUMN_NAME = 'InformacionAdicional')
BEGIN
  DECLARE @df4 NVARCHAR(200)
  SELECT @df4 = dc.name
  FROM sys.default_constraints dc
  JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
  JOIN sys.tables t  ON c.object_id = t.object_id
  WHERE t.name = 'ContenedoresPaso3' AND c.name = 'InformacionAdicional'
  IF @df4 IS NOT NULL EXEC('ALTER TABLE ContenedoresPaso3 DROP CONSTRAINT ' + @df4)
  ALTER TABLE ContenedoresPaso3 DROP COLUMN InformacionAdicional
  PRINT 'InformacionAdicional eliminado'
END

-- 3f. ObservacionesFinales
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_NAME = 'ContenedoresPaso3' AND COLUMN_NAME = 'ObservacionesFinales')
BEGIN
  DECLARE @df5 NVARCHAR(200)
  SELECT @df5 = dc.name
  FROM sys.default_constraints dc
  JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
  JOIN sys.tables t  ON c.object_id = t.object_id
  WHERE t.name = 'ContenedoresPaso3' AND c.name = 'ObservacionesFinales'
  IF @df5 IS NOT NULL EXEC('ALTER TABLE ContenedoresPaso3 DROP CONSTRAINT ' + @df5)
  ALTER TABLE ContenedoresPaso3 DROP COLUMN ObservacionesFinales
  PRINT 'ObservacionesFinales eliminado'
END

PRINT '=== Migración completada ==='
