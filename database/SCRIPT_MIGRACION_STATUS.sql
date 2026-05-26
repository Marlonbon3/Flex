-- ====================================================================
-- SCRIPT DE MIGRACIÓN - Agregar campos Status a ContenedoresPaso1
-- Ejecutar en SQL Server Management Studio
-- ====================================================================

USE FlexWebApp;
GO

-- 1. Agregar columna Status a ContenedoresPaso1
ALTER TABLE ContenedoresPaso1
ADD Status NVARCHAR(50) DEFAULT 'En proceso';

-- 2. Agregar columna FechaCompletado
ALTER TABLE ContenedoresPaso1
ADD FechaCompletado DATETIME NULL;

-- 3. Crear índice en Status para búsquedas rápidas
CREATE INDEX idx_Paso1_Status ON ContenedoresPaso1(Status);

-- 4. Actualizar índices si es necesario
CREATE INDEX idx_Paso1_Activo ON ContenedoresPaso1(Activo);

-- ====================================================================
-- OPCIONAL: Simplificar ContenedoresPaso3
-- Si deseas eliminar los campos no usados en Paso 3:
-- ====================================================================

-- Comentario: Estas líneas son OPCIONALES. Solo ejecutar si quieres limpiar la tabla.
/*
-- Hacer backup de los datos primero
SELECT * INTO ContenedoresPaso3_backup FROM ContenedoresPaso3;

-- Eliminar columnas no usadas
ALTER TABLE ContenedoresPaso3 DROP COLUMN InformacionAdicional;
ALTER TABLE ContenedoresPaso3 DROP COLUMN DescargaCompleta;
ALTER TABLE ContenedoresPaso3 DROP COLUMN FechaDescarga;
ALTER TABLE ContenedoresPaso3 DROP COLUMN HoraDescarga;
ALTER TABLE ContenedoresPaso3 DROP COLUMN UsuarioResponsableID;
ALTER TABLE ContenedoresPaso3 DROP COLUMN ObservacionesFinales;

-- Agregar restricción de unicidad en Paso1ID
ALTER TABLE ContenedoresPaso3
ADD CONSTRAINT UQ_Paso3_Paso1ID UNIQUE (Paso1ID);

-- Agregar campos de control de Paso 3
ALTER TABLE ContenedoresPaso3 ADD CantidadArchivos INT DEFAULT 0;
ALTER TABLE ContenedoresPaso3 ADD TamanioTotal BIGINT DEFAULT 0;
*/

-- ====================================================================
-- VERIFICAR CAMBIOS
-- ====================================================================

-- Ver estructura actualizada de ContenedoresPaso1
EXEC sp_help 'ContenedoresPaso1';

-- Ver estructura de ContenedoresPaso3
EXEC sp_help 'ContenedoresPaso3';

-- Ver registros existentes (debería mostrar Status='En proceso' por defecto)
SELECT 
  Paso1ID, 
  TrailerNo, 
  Status, 
  FechaCompletado, 
  Activo,
  FechaCreacion
FROM ContenedoresPaso1
ORDER BY FechaCreacion DESC;

PRINT '✓ Migración completada exitosamente';
PRINT '✓ Nuevas columnas: Status, FechaCompletado';
PRINT '✓ Los registros existentes tienen Status = ''En proceso'' por defecto';
PRINT '✓ Cuando se complete Paso 3, Status cambiará automáticamente a ''Completado''';
