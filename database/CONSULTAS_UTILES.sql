-- ====================================================================
-- CONSULTAS SQL ÚTILES PARA FLEX-WEBAPP
-- Ejecutar en SSMS contra la BD FlexWebApp
-- ====================================================================

USE FlexWebApp;
GO

-- ====================================================================
-- 1. CONSULTAS BÁSICAS
-- ====================================================================

-- Ver todos los contenedores
SELECT 
    ContenedorID,
    TrailerNo,
    TrailerType,
    Estado,
    FechaCreacion,
    PoNo
FROM Contenedores
ORDER BY FechaCreacion DESC;

-- Ver contenedores con detalles completos
SELECT 
    c.ContenedorID,
    c.TrailerNo,
    c.Estado,
    c.FechaCreacion,
    u.NombreCompleto as CreatedBy,
    (SELECT COUNT(*) FROM InspeccionesTrailer WHERE ContenedorID = c.ContenedorID) as NumInspecciones,
    (SELECT COUNT(*) FROM Documentos WHERE ContenedorID = c.ContenedorID) as NumDocumentos
FROM Contenedores c
LEFT JOIN Usuarios u ON c.UsuarioCreadorID = u.UsuarioID
ORDER BY c.FechaCreacion DESC;

-- Ver inspecciones de un contenedor específico
SELECT 
    InspeccionID,
    ContenedorID,
    CajaTrailer,
    ResponsableDescarga,
    FechaInspeccion,
    Turno,
    Origen
FROM InspeccionesTrailer
WHERE ContenedorID = 1;  -- Cambiar número

-- Ver documentos subidos
SELECT 
    DocumentoID,
    ContenedorID,
    NombreArchivo,
    TipoArchivo,
    TamañoKB,
    FechaSubida,
    u.NombreCompleto as SubidoPor
FROM Documentos d
LEFT JOIN Usuarios u ON d.UsuarioSubidaID = u.UsuarioID
ORDER BY FechaSubida DESC;

-- ====================================================================
-- 2. BÚSQUEDAS AVANZADAS
-- ====================================================================

-- Buscar contenedor por TrailerNo
SELECT * FROM Contenedores
WHERE TrailerNo LIKE '%2194580%';

-- Buscar contenedores por estado
SELECT * FROM Contenedores
WHERE Estado = 'En Progreso'
ORDER BY FechaCreacion DESC;

-- Contenedores sin inspección
SELECT 
    c.ContenedorID,
    c.TrailerNo,
    c.Estado
FROM Contenedores c
LEFT JOIN InspeccionesTrailer i ON c.ContenedorID = i.ContenedorID
WHERE i.InspeccionID IS NULL;

-- Inspecciones por fecha rango
SELECT 
    InspeccionID,
    CajaTrailer,
    FechaInspeccion,
    ResponsableDescarga
FROM InspeccionesTrailer
WHERE FechaInspeccion BETWEEN '2026-05-01' AND '2026-05-31'
ORDER BY FechaInspeccion DESC;

-- Documentos por contenedor
SELECT 
    DocumentoID,
    NombreArchivo,
    TamañoKB,
    FechaSubida
FROM Documentos
WHERE ContenedorID = 1  -- Cambiar número
ORDER BY FechaSubida DESC;

-- ====================================================================
-- 3. ESTADÍSTICAS Y REPORTES
-- ====================================================================

-- Resumen por estado
SELECT 
    Estado,
    COUNT(*) as Total,
    MAX(FechaCreacion) as UltimaActualizacion
FROM Contenedores
GROUP BY Estado
ORDER BY Total DESC;

-- Contenedores por usuario
SELECT 
    u.NombreCompleto,
    COUNT(c.ContenedorID) as TotalContenedores,
    COUNT(DISTINCT i.InspeccionID) as InspeccionesCompletadas
FROM Usuarios u
LEFT JOIN Contenedores c ON u.UsuarioID = c.UsuarioCreadorID
LEFT JOIN InspeccionesTrailer i ON c.ContenedorID = i.ContenedorID
GROUP BY u.UsuarioID, u.NombreCompleto
ORDER BY TotalContenedores DESC;

-- Documentos por tipo
SELECT 
    TipoArchivo,
    COUNT(*) as Total,
    SUM(TamañoKB) as TamañoTotalKB,
    SUM(TamañoKB) / 1024.0 as TamañoTotalMB
FROM Documentos
GROUP BY TipoArchivo
ORDER BY Total DESC;

-- Resumen diario de actividad
SELECT 
    CAST(FechaCreacion AS DATE) as Fecha,
    COUNT(DISTINCT ContenedorID) as ContenedoresCreados,
    COUNT(DISTINCT UsuarioCreadorID) as UsuariosActivos
FROM Contenedores
GROUP BY CAST(FechaCreacion AS DATE)
ORDER BY Fecha DESC;

-- Inspecciones con condiciones incompletas
SELECT 
    InspeccionID,
    ContenedorID,
    CajaTrailer,
    (CAST(Cond1 AS INT) + CAST(Cond2 AS INT) + CAST(Cond3 AS INT) + 
     CAST(Cond4 AS INT) + CAST(Cond5 AS INT) + CAST(Cond6 AS INT) + 
     CAST(Cond7 AS INT) + CAST(Cond8 AS INT)) as CondicionesCompletadas
FROM InspeccionesTrailer
WHERE (CAST(Cond1 AS INT) + CAST(Cond2 AS INT) + CAST(Cond3 AS INT) + 
       CAST(Cond4 AS INT) + CAST(Cond5 AS INT) + CAST(Cond6 AS INT) + 
       CAST(Cond7 AS INT) + CAST(Cond8 AS INT)) < 8;

-- ====================================================================
-- 4. MANTENIMIENTO Y LIMPIEZA
-- ====================================================================

-- Ver espacio usado por tablas
SELECT 
    t.NAME AS TableName,
    SUM(s.used_page_count) * 8 / 1024 AS UsedSpaceMB
FROM sys.dm_db_partition_stats s
INNER JOIN sys.tables t ON s.object_id = t.object_id
WHERE database_id = DB_ID()
GROUP BY t.NAME
ORDER BY UsedSpaceMB DESC;

-- Limpiar contenedores cancelados más antiguos de 90 días
-- PRECAUCIÓN: Ejecutar solo con confirmación
SELECT COUNT(*) FROM Contenedores
WHERE Estado = 'Cancelado' 
  AND DATEDIFF(DAY, FechaCreacion, GETDATE()) > 90;

-- Limpiar sin cascada (primero borrar detalles)
DELETE FROM Documentos
WHERE ContenedorID IN (
    SELECT ContenedorID FROM Contenedores
    WHERE Estado = 'Cancelado' 
      AND DATEDIFF(DAY, FechaCreacion, GETDATE()) > 90
);

DELETE FROM InspeccionesTrailer
WHERE ContenedorID IN (
    SELECT ContenedorID FROM Contenedores
    WHERE Estado = 'Cancelado' 
      AND DATEDIFF(DAY, FechaCreacion, GETDATE()) > 90
);

DELETE FROM ContenedoresPasos
WHERE ContenedorID IN (
    SELECT ContenedorID FROM Contenedores
    WHERE Estado = 'Cancelado' 
      AND DATEDIFF(DAY, FechaCreacion, GETDATE()) > 90
);

DELETE FROM Contenedores
WHERE Estado = 'Cancelado' 
  AND DATEDIFF(DAY, FechaCreacion, GETDATE()) > 90;

-- ====================================================================
-- 5. AUDITORÍA
-- ====================================================================

-- Ver historial de cambios
SELECT 
    HistorialID,
    ContenedorID,
    TipoOperacion,
    CampoModificado,
    ValorAnterior,
    ValorNuevo,
    u.NombreCompleto,
    FechaCambio
FROM HistorialCambios h
LEFT JOIN Usuarios u ON h.UsuarioID = u.UsuarioID
ORDER BY FechaCambio DESC;

-- Cambios en último día
SELECT 
    ContenedorID,
    COUNT(*) as NumCambios,
    MAX(FechaCambio) as UltimoCambio
FROM HistorialCambios
WHERE FechaCambio >= DATEADD(DAY, -1, GETDATE())
GROUP BY ContenedorID
ORDER BY NumCambios DESC;

-- ====================================================================
-- 6. CONSULTAS PARA DASHBOARDS
-- ====================================================================

-- KPI: Contenedores por completar
SELECT 
    'Pendientes' as Categoria,
    COUNT(*) as Cantidad,
    'warning' as Tipo
FROM Contenedores
WHERE Estado IN ('Pendiente', 'En Progreso')

UNION ALL

SELECT 
    'Completados',
    COUNT(*),
    'success'
FROM Contenedores
WHERE Estado = 'Completado'

UNION ALL

SELECT 
    'Cancelados',
    COUNT(*),
    'danger'
FROM Contenedores
WHERE Estado = 'Cancelado';

-- Actividad de los últimos 7 días
SELECT 
    CAST(FechaCreacion AS DATE) as Fecha,
    COUNT(*) as ContenedoresCreados,
    SUM(CASE WHEN Estado = 'Completado' THEN 1 ELSE 0 END) as Completados,
    SUM(CASE WHEN Estado = 'Cancelado' THEN 1 ELSE 0 END) as Cancelados
FROM Contenedores
WHERE FechaCreacion >= DATEADD(DAY, -7, GETDATE())
GROUP BY CAST(FechaCreacion AS DATE)
ORDER BY Fecha DESC;

-- Responsables más frecuentes
SELECT TOP 10
    ResponsableDescarga,
    COUNT(*) as Inspecciones,
    MAX(FechaInspeccion) as UltimaInspeccion
FROM InspeccionesTrailer
WHERE ResponsableDescarga IS NOT NULL
GROUP BY ResponsableDescarga
ORDER BY Inspecciones DESC;

-- Origen de contenedores (estadísticas)
SELECT 
    Origen,
    COUNT(*) as Total,
    AVG(DATEDIFF(HOUR, FechaInspeccion, GETDATE())) as HorasPromedio
FROM InspeccionesTrailer
WHERE Origen IS NOT NULL
GROUP BY Origen
ORDER BY Total DESC;

-- ====================================================================
-- 7. EXPORTAR DATOS
-- ====================================================================

-- Exportar a CSV (copiar resultados)
SELECT 
    c.TrailerNo,
    c.TrailerType,
    c.Estado,
    c.PoNo,
    u.NombreCompleto,
    c.FechaCreacion
FROM Contenedores c
LEFT JOIN Usuarios u ON c.UsuarioCreadorID = u.UsuarioID
ORDER BY c.FechaCreacion DESC;

-- Reporte completo por contenedor
SELECT 
    c.ContenedorID,
    c.TrailerNo,
    c.PoNo,
    c.Estado,
    i.CajaTrailer,
    i.ResponsableDescarga,
    (SELECT COUNT(*) FROM Documentos WHERE ContenedorID = c.ContenedorID) as DocumentosCargados,
    c.FechaCreacion
FROM Contenedores c
LEFT JOIN InspeccionesTrailer i ON c.ContenedorID = i.ContenedorID
ORDER BY c.FechaCreacion DESC;

-- ====================================================================
-- 8. VERIFICACIÓN DE INTEGRIDAD
-- ====================================================================

-- Verificar foreign keys
SELECT 
    'Contenedores sin usuario' as Problema,
    COUNT(*) as Cantidad
FROM Contenedores
WHERE UsuarioCreadorID NOT IN (SELECT UsuarioID FROM Usuarios)

UNION ALL

SELECT 
    'Inspecciones sin contenedor',
    COUNT(*)
FROM InspeccionesTrailer
WHERE ContenedorID NOT IN (SELECT ContenedorID FROM Contenedores)

UNION ALL

SELECT 
    'Documentos sin contenedor',
    COUNT(*)
FROM Documentos
WHERE ContenedorID NOT IN (SELECT ContenedorID FROM Contenedores);

-- ====================================================================
-- TIPS
-- ====================================================================
-- 1. Usar CAST(fecha AS DATE) para comparar solo la fecha sin hora
-- 2. DATEDIFF(unit, startdate, enddate) para diferencias de tiempo
-- 3. LEFT JOIN para incluir registros sin coincidencia en tabla derecha
-- 4. TOP N para limitar resultados
-- 5. GROUP BY + HAVING para filtros en agregados
-- 6. Siempre hacer backup antes de DELETE
-- 7. Usar transacciones para operaciones críticas:
--    BEGIN TRANSACTION;
--    ... comandos ...
--    COMMIT; -- o ROLLBACK;
