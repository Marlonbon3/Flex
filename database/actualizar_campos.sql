-- ====================================================================
-- ACTUALIZAR ESQUEMA - Agregar campos para Archivar/Eliminar
-- ====================================================================

-- Agregar campo Archivado a tabla Contenedores (si no existe)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_NAME = 'Contenedores' AND COLUMN_NAME = 'Archivado')
BEGIN
    ALTER TABLE Contenedores
    ADD Archivado BIT DEFAULT 0;
    PRINT '✓ Campo Archivado agregado a Contenedores';
END
ELSE
BEGIN
    PRINT '✓ Campo Archivado ya existe en Contenedores';
END;

-- Agregar campo EstatusPasos para trackear si paso 2 y 3 están completos
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_NAME = 'Contenedores' AND COLUMN_NAME = 'Paso2Completado')
BEGIN
    ALTER TABLE Contenedores
    ADD Paso2Completado BIT DEFAULT 0,
        Paso3Completado BIT DEFAULT 0;
    PRINT '✓ Campos de pasos agregados a Contenedores';
END
ELSE
BEGIN
    PRINT '✓ Campos de pasos ya existen en Contenedores';
END;

-- Verificar estructura
SELECT 'Estructura de Contenedores:' as Verificacion;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Contenedores'
ORDER BY ORDINAL_POSITION;
