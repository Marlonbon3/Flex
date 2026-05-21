-- ====================================================================
-- SCRIPT BASE DE DATOS FLEX - SISTEMA DE GESTIÓN DE CONTENEDORES
-- SQL Server Express
-- ====================================================================

-- Crear la base de datos
CREATE DATABASE FlexWebApp;
GO

-- Usar la base de datos
USE FlexWebApp;
GO

-- ====================================================================
-- TABLA 1: USUARIOS
-- ====================================================================
CREATE TABLE Usuarios (
    UsuarioID INT PRIMARY KEY IDENTITY(1,1),
    NombreCompleto NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) UNIQUE NOT NULL,
    Contraseña NVARCHAR(255) NOT NULL,
    Rol NVARCHAR(50) CHECK (Rol IN ('Admin', 'Supervisor', 'Operador')),
    Activo BIT DEFAULT 1,
    FechaCreacion DATETIME DEFAULT GETDATE(),
    UltimoAcceso DATETIME NULL
);

-- ====================================================================
-- TABLA 2: CONTENEDORES (Paso 1 - Información Básica + Adicional)
-- ====================================================================
CREATE TABLE Contenedores (
    ContenedorID INT PRIMARY KEY IDENTITY(1,1),
    
    -- Información Básica
    TrailerNo NVARCHAR(50) NOT NULL UNIQUE,
    TrailerType NVARCHAR(100),
    SeaContainerType NVARCHAR(100),
    UsoEmbarques NVARCHAR(100),
    PortOfEntry NVARCHAR(100),
    Comments NVARCHAR(MAX),
    
    -- Información Adicional
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
    PoNo NVARCHAR(100) NOT NULL,
    
    -- Metadatos
    UsuarioCreadorID INT NOT NULL,
    FechaCreacion DATETIME DEFAULT GETDATE(),
    Estado NVARCHAR(50) CHECK (Estado IN ('Pendiente', 'En Progreso', 'Completado', 'Cancelado')) DEFAULT 'Pendiente',
    
    FOREIGN KEY (UsuarioCreadorID) REFERENCES Usuarios(UsuarioID)
);

-- ====================================================================
-- TABLA 3: INSPECCIONES_TRAILER (Paso 2 - Inspección + Firma)
-- ====================================================================
CREATE TABLE InspeccionesTrailer (
    InspeccionID INT PRIMARY KEY IDENTITY(1,1),
    ContenedorID INT NOT NULL,
    
    -- Datos del Trailer
    CajaTrailer NVARCHAR(100) NOT NULL,
    Placas NVARCHAR(50),
    Estado NVARCHAR(100),
    FechaLlegada DATE,
    
    -- Turno
    Turno NVARCHAR(50) CHECK (Turno IN ('1er turno', '2do turno')),
    
    -- Información de Llegada
    Sellos NVARCHAR(100),
    Rampa NVARCHAR(50),
    HoraRegistro TIME,
    TotalPallets INT,
    
    -- Longitud del Contenedor
    LongitudContenedor NVARCHAR(50),
    
    -- Origen (Arribo)
    Origen NVARCHAR(100),
    
    -- Empresas
    Empresas NVARCHAR(MAX), -- JSON array: '["BOSE","DYSON","NESTLE"]'
    
    -- Responsable y Firma
    ResponsableDescarga NVARCHAR(255),
    FirmaResponsable NVARCHAR(MAX), -- Data URL de la imagen PNG
    
    -- Condiciones de Inspección (8 checkpoints)
    Cond1 BIT DEFAULT 0,
    Cond2 BIT DEFAULT 0,
    Cond3 BIT DEFAULT 0,
    Cond4 BIT DEFAULT 0,
    Cond5 BIT DEFAULT 0,
    Cond6 BIT DEFAULT 0,
    Cond7 BIT DEFAULT 0,
    Cond8 BIT DEFAULT 0,
    
    -- Metadatos
    UsuarioInspectorID INT NOT NULL,
    FechaInspeccion DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (ContenedorID) REFERENCES Contenedores(ContenedorID) ON DELETE CASCADE,
    FOREIGN KEY (UsuarioInspectorID) REFERENCES Usuarios(UsuarioID)
);

-- ====================================================================
-- TABLA 4: DOCUMENTOS (Paso 3 - Escaneo/Upload de Documentos)
-- ====================================================================
CREATE TABLE Documentos (
    DocumentoID INT PRIMARY KEY IDENTITY(1,1),
    ContenedorID INT NOT NULL,
    
    NombreArchivo NVARCHAR(255) NOT NULL,
    TipoArchivo NVARCHAR(50), -- 'image', 'pdf', 'document', etc.
    TamañoKB INT,
    RutaArchivo NVARCHAR(500), -- Ruta en servidor o referencia a blob storage
    ContenidoBlob VARBINARY(MAX), -- Almacenar archivo directamente si es necesario
    
    -- Descripción del documento
    Descripcion NVARCHAR(MAX),
    
    -- Metadatos
    UsuarioSubidaID INT NOT NULL,
    FechaSubida DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (ContenedorID) REFERENCES Contenedores(ContenedorID) ON DELETE CASCADE,
    FOREIGN KEY (UsuarioSubidaID) REFERENCES Usuarios(UsuarioID)
);

-- ====================================================================
-- TABLA 5: CONTENEDORES_PASOS (Rastrear progreso en cada paso)
-- ====================================================================
CREATE TABLE ContenedoresPasos (
    PasoID INT PRIMARY KEY IDENTITY(1,1),
    ContenedorID INT NOT NULL,
    
    NumeroPaso INT CHECK (NumeroPaso IN (1, 2, 3)) NOT NULL,
    Completado BIT DEFAULT 0,
    
    -- Datos guardados en cada paso (JSON para flexibilidad)
    DatosGuardados NVARCHAR(MAX), -- JSON con datos del paso
    
    -- Metadatos
    FechaInicio DATETIME DEFAULT GETDATE(),
    FechaComplecion DATETIME NULL,
    UsuarioID INT NOT NULL,
    
    FOREIGN KEY (ContenedorID) REFERENCES Contenedores(ContenedorID) ON DELETE CASCADE,
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
);

-- ====================================================================
-- TABLA 6: HISTORIAL_CAMBIOS (Auditoría)
-- ====================================================================
CREATE TABLE HistorialCambios (
    HistorialID INT PRIMARY KEY IDENTITY(1,1),
    ContenedorID INT NOT NULL,
    
    TipoOperacion NVARCHAR(50), -- 'Creación', 'Actualización', 'Eliminación'
    CampoModificado NVARCHAR(255),
    ValorAnterior NVARCHAR(MAX),
    ValorNuevo NVARCHAR(MAX),
    
    -- Metadatos
    UsuarioID INT NOT NULL,
    FechaCambio DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (ContenedorID) REFERENCES Contenedores(ContenedorID) ON DELETE CASCADE,
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
);

-- ====================================================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- ====================================================================
CREATE INDEX idx_Contenedores_Estado ON Contenedores(Estado);
CREATE INDEX idx_Contenedores_FechaCreacion ON Contenedores(FechaCreacion);
CREATE INDEX idx_Contenedores_UsuarioCreador ON Contenedores(UsuarioCreadorID);

CREATE INDEX idx_InspeccionesTrailer_ContenedorID ON InspeccionesTrailer(ContenedorID);
CREATE INDEX idx_InspeccionesTrailer_FechaInspeccion ON InspeccionesTrailer(FechaInspeccion);

CREATE INDEX idx_Documentos_ContenedorID ON Documentos(ContenedorID);
CREATE INDEX idx_Documentos_FechaSubida ON Documentos(FechaSubida);

CREATE INDEX idx_ContenedoresPasos_ContenedorID ON ContenedoresPasos(ContenedorID);
CREATE INDEX idx_ContenedoresPasos_NumeroPaso ON ContenedoresPasos(NumeroPaso);

-- ====================================================================
-- INSERTAR USUARIO DE PRUEBA
-- ====================================================================
INSERT INTO Usuarios (NombreCompleto, Email, Contraseña, Rol, Activo)
VALUES ('Admin Flex', 'admin@flex.local', 'password123', 'Admin', 1);

INSERT INTO Usuarios (NombreCompleto, Email, Contraseña, Rol, Activo)
VALUES ('Juan Pérez', 'juan@flex.local', 'password123', 'Operador', 1);

INSERT INTO Usuarios (NombreCompleto, Email, Contraseña, Rol, Activo)
VALUES ('Ana Gutiérrez', 'ana@flex.local', 'password123', 'Supervisor', 1);

-- ====================================================================
-- VERIFICAR CREACIÓN
-- ====================================================================
SELECT 'Base de datos creada exitosamente' AS Mensaje;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo';

GO
