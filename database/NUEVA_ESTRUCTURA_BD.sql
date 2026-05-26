-- ====================================================================
-- NUEVA ESTRUCTURA DE BASE DE DATOS - FLEX-WEBAPP
-- ====================================================================

-- ────────────────────────────────────────────────────────────────────
-- 1. TABLA: ContenedoresPaso1 (Información Básica)
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
    FechaCreacion DATETIME DEFAULT GETDATE(),
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
    -- Condiciones
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
-- 3. TABLA: ContenedoresPaso3 (Información Adicional / Descarga)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE ContenedoresPaso3 (
    Paso3ID INT PRIMARY KEY IDENTITY(1,1),
    Paso1ID INT NOT NULL,
    Paso2ID INT,
    -- Agregar aquí los campos que necesitas para Paso 3
    InformacionAdicional NVARCHAR(MAX),
    DescargaCompleta BIT DEFAULT 0,
    FechaDescarga DATE,
    HoraDescarga TIME,
    UsuarioResponsableID INT,
    ObservacionesFinales NVARCHAR(MAX),
    FechaCreacion DATETIME DEFAULT GETDATE(),
    Activo BIT DEFAULT 1,
    FOREIGN KEY (Paso1ID) REFERENCES ContenedoresPaso1(Paso1ID),
    FOREIGN KEY (Paso2ID) REFERENCES ContenedoresPaso2(Paso2ID)
);

-- ────────────────────────────────────────────────────────────────────
-- 4. TABLA: Archivos (Documentos, fotos, etc.)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE Archivos (
    ArchivoID INT PRIMARY KEY IDENTITY(1,1),
    Paso1ID INT NOT NULL,
    TipoArchivo NVARCHAR(50), -- 'foto', 'documento', 'reporte', etc.
    NombreArchivo NVARCHAR(255),
    RutaArchivo NVARCHAR(MAX),
    ContenidoBase64 NVARCHAR(MAX), -- Si almacenas en BD
    DescripcionArchivo NVARCHAR(MAX),
    UsuarioId INT,
    FechaCreacion DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (Paso1ID) REFERENCES ContenedoresPaso1(Paso1ID)
);

-- ────────────────────────────────────────────────────────────────────
-- 5. TABLA: Reportes
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE Reportes (
    ReporteID INT PRIMARY KEY IDENTITY(1,1),
    Paso1ID INT NOT NULL,
    TipoReporte NVARCHAR(100), -- 'inspección', 'descarga', 'final', etc.
    ContenidoReporte NVARCHAR(MAX),
    FechaGeneracion DATETIME DEFAULT GETDATE(),
    UsuarioGeneradorID INT,
    Estado NVARCHAR(50), -- 'borrador', 'completo', 'revisado'
    Activo BIT DEFAULT 1,
    FOREIGN KEY (Paso1ID) REFERENCES ContenedoresPaso1(Paso1ID)
);

-- ────────────────────────────────────────────────────────────────────
-- 6. TABLA: EntregaDeTurno (Traspaso de responsabilidad entre turnos)
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE EntregaDeTurno (
    EntregaID INT PRIMARY KEY IDENTITY(1,1),
    Paso1ID INT NOT NULL,
    TurnoOrigen NVARCHAR(50), -- '1er turno', '2do turno', '3er turno'
    TurnoDestino NVARCHAR(50),
    FechaEntrega DATETIME DEFAULT GETDATE(),
    HoraEntrega TIME,
    ResponsableEntrega INT,
    ResponsableRecibe INT,
    EstadoContenedor NVARCHAR(MAX), -- JSON con estado del contenedor
    FirmaEntrega NVARCHAR(MAX), -- Base64
    FirmaRecibe NVARCHAR(MAX), -- Base64
    Observaciones NVARCHAR(MAX),
    Activo BIT DEFAULT 1,
    FOREIGN KEY (Paso1ID) REFERENCES ContenedoresPaso1(Paso1ID)
);

-- ────────────────────────────────────────────────────────────────────
-- 7. ÍNDICES (Para optimizar búsquedas)
-- ────────────────────────────────────────────────────────────────────
CREATE INDEX idx_Paso1_TrailerNo ON ContenedoresPaso1(TrailerNo);
CREATE INDEX idx_Paso1_FechaCreacion ON ContenedoresPaso1(FechaCreacion);
CREATE INDEX idx_Paso2_Paso1ID ON ContenedoresPaso2(Paso1ID);
CREATE INDEX idx_Paso3_Paso1ID ON ContenedoresPaso3(Paso1ID);
CREATE INDEX idx_Archivos_Paso1ID ON Archivos(Paso1ID);
CREATE INDEX idx_Reportes_Paso1ID ON Reportes(Paso1ID);
CREATE INDEX idx_Entrega_Paso1ID ON EntregaDeTurno(Paso1ID);

-- ────────────────────────────────────────────────────────────────────
-- 8. BORRAR TABLAS ANTIGUAS (cuando estés seguro que todo funciona)
-- ────────────────────────────────────────────────────────────────────
-- DROP TABLE InspeccionesTrailer;
-- DROP TABLE ContenedoresPasos;
-- DROP TABLE Documentos;
-- DROP TABLE HistorialCambios;
-- DROP TABLE Contenedores;

PRINT '✓ Nueva estructura de BD creada exitosamente';
