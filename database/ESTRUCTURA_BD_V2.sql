-- ====================================================================
-- ESTRUCTURA DE BASE DE DATOS - FLEX-WEBAPP v2.0
-- FLUJO: Paso 1 → Paso 2 → Paso 3 (Documentos) → Auto-completado → Archivo
-- ====================================================================

-- ────────────────────────────────────────────────────────────────────
-- 0. TABLA: Usuarios (Autenticación)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE Usuarios (
    UsuarioID INT PRIMARY KEY IDENTITY(1,1),
    NombreCompleto NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    Contraseña NVARCHAR(255) NOT NULL,
    Rol NVARCHAR(50) DEFAULT 'Usuario', -- 'Admin', 'Inspector', 'Usuario', etc.
    Activo BIT DEFAULT 1,
    FechaCreacion DATETIME DEFAULT GETDATE(),
    UltimoAcceso DATETIME NULL
);

-- Insertar usuario de prueba (cambiar contraseña en producción)
INSERT INTO Usuarios (NombreCompleto, Email, Contraseña, Rol, Activo)
VALUES 
    ('Administrador', 'admin@flex.com', 'Admin@2026', 'Admin', 1),
    ('Inspector', 'inspector@flex.com', 'Inspector@2026', 'Inspector', 1),
    ('Usuario Regular', 'usuario@flex.com', 'Usuario@2026', 'Usuario', 1);

-- ────────────────────────────────────────────────────────────────────
-- 1. TABLA: ContenedoresPaso1 (Información Básica)
-- CAMBIOS: Agregado Status y FechaCompletado
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE ContenedoresPaso1 (
    Paso1ID INT PRIMARY KEY IDENTITY(1,1),
    TrailerNo NVARCHAR(50) NOT NULL,
    TrailerType NVARCHAR(100),
    SeaContainerType NVARCHAR(100),
    UsoEmbarques NVARCHAR(100),
    PortOfEntry NVARCHAR(100),
    Comments NVARCHAR(MAX),
    QtyPallets INT,
    EmptyDate DATE,
    SealSanLuis NVARCHAR(100),
    DepartureDate DATE,
    SealYuma NVARCHAR(100),
    AgingA NVARCHAR(100),
    ActualDate DATE,
    ItemType NVARCHAR(100),
    Aging NVARCHAR(100),
    BookingNo NVARCHAR(100),
    DateExitPort DATE,
    PoNo NVARCHAR(100),
    UsuarioCreadorID INT,
    -- Status de progreso (En proceso | Completado)
    Status NVARCHAR(50) DEFAULT 'En proceso',
    -- Activo=1 (en proceso), Activo=0 (archivado/completado)
    FechaCreacion DATETIME DEFAULT GETDATE(),
    FechaCompletado DATETIME NULL,
    Activo BIT DEFAULT 1
);

-- ────────────────────────────────────────────────────────────────────
-- 2. TABLA: ContenedoresPaso2 (Inspección de Trailer/Contenedor)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE ContenedoresPaso2 (
    Paso2ID INT PRIMARY KEY IDENTITY(1,1),
    Paso1ID INT NOT NULL,
    CajaTrailer NVARCHAR(100),
    Placas NVARCHAR(50),
    Estado NVARCHAR(50),
    FechaLlegada DATE,
    Turno NVARCHAR(50),
    Sellos NVARCHAR(100),
    Rampa NVARCHAR(100),
    HoraRegistro TIME,
    TotalPallets INT,
    LongitudContenedor NVARCHAR(100),
    Origen NVARCHAR(100),
    Empresas NVARCHAR(MAX), -- JSON array
    ResponsableDescarga NVARCHAR(100),
    FirmaResponsable NVARCHAR(MAX), -- Base64 de imagen
    -- Condiciones (8 checkboxes)
    Cond1 BIT,
    Cond2 BIT,
    Cond3 BIT,
    Cond4 BIT,
    Cond5 BIT,
    Cond6 BIT,
    Cond7 BIT,
    Cond8 BIT,
    UsuarioInspectorID INT,
    FechaCreacion DATETIME DEFAULT GETDATE(),
    Activo BIT DEFAULT 1,
    FOREIGN KEY (Paso1ID) REFERENCES ContenedoresPaso1(Paso1ID)
);

-- ────────────────────────────────────────────────────────────────────
-- 3. TABLA: ContenedoresPaso3 (Paso 3 - Documentos/Archivos)
-- SIMPLIFICADO: Solo guarda que Paso 3 fue completado
-- Los archivos se almacenan en la tabla Archivos
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE ContenedoresPaso3 (
    Paso3ID INT PRIMARY KEY IDENTITY(1,1),
    Paso1ID INT NOT NULL UNIQUE, -- Un paso 3 por contenedor
    Paso2ID INT,
    CantidadArchivos INT DEFAULT 0,
    TamanioTotal BIGINT DEFAULT 0, -- En bytes
    FechaCompletado DATETIME DEFAULT GETDATE(),
    UsuarioResponsableID INT,
    Activo BIT DEFAULT 1,
    FOREIGN KEY (Paso1ID) REFERENCES ContenedoresPaso1(Paso1ID),
    FOREIGN KEY (Paso2ID) REFERENCES ContenedoresPaso2(Paso2ID)
);

-- ────────────────────────────────────────────────────────────────────
-- 4. TABLA: Archivos (Documentos, Fotos, Escaneos de Paso 3)
-- Guardados en Base64 para archivos pequeños (<5MB)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE Archivos (
    ArchivoID INT PRIMARY KEY IDENTITY(1,1),
    Paso1ID INT NOT NULL,
    TipoArchivo NVARCHAR(50), -- 'foto', 'pdf', 'documento', 'escaneo', etc.
    NombreArchivo NVARCHAR(255),
    RutaArchivo NVARCHAR(MAX),
    ContenidoBase64 NVARCHAR(MAX), -- Base64 del archivo
    Tamanio INT, -- En bytes
    DescripcionArchivo NVARCHAR(MAX),
    UsuarioId INT,
    FechaCreacion DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (Paso1ID) REFERENCES ContenedoresPaso1(Paso1ID)
);

-- ────────────────────────────────────────────────────────────────────
-- 5. TABLA: Reportes (Obsoleta, se mantiene para compatibilidad)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE Reportes (
    ReporteID INT PRIMARY KEY IDENTITY(1,1),
    Paso1ID INT NOT NULL,
    TipoReporte NVARCHAR(100),
    ContenidoReporte NVARCHAR(MAX),
    FechaGeneracion DATETIME DEFAULT GETDATE(),
    UsuarioGeneradorID INT,
    Estado NVARCHAR(50),
    Activo BIT DEFAULT 1,
    FOREIGN KEY (Paso1ID) REFERENCES ContenedoresPaso1(Paso1ID)
);

-- ────────────────────────────────────────────────────────────────────
-- 6. TABLA: EntregaDeTurno (Traspaso entre turnos)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE EntregaDeTurno (
    EntregaID INT PRIMARY KEY IDENTITY(1,1),
    Paso1ID INT NOT NULL,
    TurnoOrigen NVARCHAR(50),
    TurnoDestino NVARCHAR(50),
    FechaEntrega DATETIME DEFAULT GETDATE(),
    HoraEntrega TIME,
    ResponsableEntrega INT,
    ResponsableRecibe INT,
    EstadoContenedor NVARCHAR(MAX), -- JSON
    FirmaEntrega NVARCHAR(MAX), -- Base64
    FirmaRecibe NVARCHAR(MAX), -- Base64
    Observaciones NVARCHAR(MAX),
    Activo BIT DEFAULT 1,
    FOREIGN KEY (Paso1ID) REFERENCES ContenedoresPaso1(Paso1ID)
);

-- ────────────────────────────────────────────────────────────────────
-- 7. ÍNDICES (Optimización)
-- ────────────────────────────────────────────────────────────────────
CREATE INDEX idx_Paso1_TrailerNo ON ContenedoresPaso1(TrailerNo);
CREATE INDEX idx_Paso1_Status ON ContenedoresPaso1(Status);
CREATE INDEX idx_Paso1_Activo ON ContenedoresPaso1(Activo);
CREATE INDEX idx_Paso1_FechaCreacion ON ContenedoresPaso1(FechaCreacion);
CREATE INDEX idx_Paso2_Paso1ID ON ContenedoresPaso2(Paso1ID);
CREATE INDEX idx_Paso3_Paso1ID ON ContenedoresPaso3(Paso1ID);
CREATE INDEX idx_Archivos_Paso1ID ON Archivos(Paso1ID);
CREATE INDEX idx_Reportes_Paso1ID ON Reportes(Paso1ID);
CREATE INDEX idx_Entrega_Paso1ID ON EntregaDeTurno(Paso1ID);

-- ────────────────────────────────────────────────────────────────────
-- 8. MIGRACIÓN DE DATOS (Opcional - para actualizar tabla existente)
-- ────────────────────────────────────────────────────────────────────
-- Si la tabla ContenedoresPaso1 ya existe, agregamos las columnas nuevas:
/*
ALTER TABLE ContenedoresPaso1
ADD Status NVARCHAR(50) DEFAULT 'En proceso';

ALTER TABLE ContenedoresPaso1
ADD FechaCompletado DATETIME NULL;

ALTER TABLE ContenedoresPaso3
ALTER COLUMN Paso1ID INT NOT NULL;

ALTER TABLE ContenedoresPaso3
ADD CONSTRAINT UQ_Paso3_Paso1ID UNIQUE (Paso1ID);

-- Actualizar campos obsoletos en ContenedoresPaso3:
ALTER TABLE ContenedoresPaso3
DROP COLUMN InformacionAdicional;

ALTER TABLE ContenedoresPaso3
DROP COLUMN DescargaCompleta;

ALTER TABLE ContenedoresPaso3
DROP COLUMN FechaDescarga;

ALTER TABLE ContenedoresPaso3
DROP COLUMN HoraDescarga;

ALTER TABLE ContenedoresPaso3
DROP COLUMN ObservacionesFinales;

ALTER TABLE ContenedoresPaso3
ADD CantidadArchivos INT DEFAULT 0;

ALTER TABLE ContenedoresPaso3
ADD TamanioTotal BIGINT DEFAULT 0;
*/

PRINT '✓ Estructura v2.0 creada/actualizada exitosamente';
PRINT '✓ Status se gestiona automáticamente en la API';
PRINT '✓ Paso 3 completado = Status "Completado" + Activo = 0 + Pasa a Archivo';
