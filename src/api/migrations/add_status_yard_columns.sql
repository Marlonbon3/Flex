-- ====================================================================
-- MIGRACIÓN: Agregar columnas StatusContenedor y YardDestination
-- Tabla: ContenedoresPaso1
-- Ejecutar una sola vez en la base de datos
-- ====================================================================

USE FlexWebApp;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE Name = N'StatusContenedor'
  AND Object_ID = Object_ID(N'ContenedoresPaso1')
)
BEGIN
  ALTER TABLE ContenedoresPaso1 ADD StatusContenedor NVARCHAR(100) NULL;
  PRINT 'Columna StatusContenedor agregada.';
END
ELSE
  PRINT 'Columna StatusContenedor ya existe, omitiendo.';

IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE Name = N'YardDestination'
  AND Object_ID = Object_ID(N'ContenedoresPaso1')
)
BEGIN
  ALTER TABLE ContenedoresPaso1 ADD YardDestination NVARCHAR(100) NULL;
  PRINT 'Columna YardDestination agregada.';
END
ELSE
  PRINT 'Columna YardDestination ya existe, omitiendo.';

-- Opcional: seed inicial de opciones para Status
-- INSERT INTO CatalogosListas (NombreLista, Valor, Etiqueta, Orden) VALUES
--   ('statusContenedor', 'En patio',   'En patio',   1),
--   ('statusContenedor', 'En proceso', 'En proceso', 2),
--   ('statusContenedor', 'Descargado', 'Descargado', 3),
--   ('statusContenedor', 'Liberado',   'Liberado',   4);

-- Opcional: seed inicial de opciones para Yard/Destination
-- INSERT INTO CatalogosListas (NombreLista, Valor, Etiqueta, Orden) VALUES
--   ('yardDestination', 'Yard A', 'Yard A', 1),
--   ('yardDestination', 'Yard B', 'Yard B', 2);
