-- ========================================
-- Script para agregar Status a ContenedoresPaso1
-- ========================================

USE FlexWebApp;
GO

-- Verificar si la columna Status ya existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_NAME = 'ContenedoresPaso1' AND COLUMN_NAME = 'Status')
BEGIN
    ALTER TABLE ContenedoresPaso1 
    ADD Status NVARCHAR(50) DEFAULT 'En proceso';
    PRINT 'Columna Status agregada a ContenedoresPaso1';
END
ELSE
BEGIN
    PRINT 'Columna Status ya existe en ContenedoresPaso1';
END

-- Verificar si la columna FechaCompletado ya existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_NAME = 'ContenedoresPaso1' AND COLUMN_NAME = 'FechaCompletado')
BEGIN
    ALTER TABLE ContenedoresPaso1 
    ADD FechaCompletado DATETIME NULL;
    PRINT 'Columna FechaCompletado agregada a ContenedoresPaso1';
END
ELSE
BEGIN
    PRINT 'Columna FechaCompletado ya existe en ContenedoresPaso1';
END

-- Actualizar registros antiguos a Status='Completado' (excepto el más reciente para prueba)
UPDATE ContenedoresPaso1
SET Status = 'Completado', Activo = 0, FechaCompletado = GETDATE()
WHERE Paso1ID < 7 AND (Status IS NULL OR Status = 'En proceso');

PRINT 'Registros antiguos (Paso1ID < 7) actualizados a Completado y archivados';

-- Verificar resultado
SELECT Paso1ID, TrailerNo, Status, Activo, FechaCompletado 
FROM ContenedoresPaso1
ORDER BY Paso1ID DESC;
