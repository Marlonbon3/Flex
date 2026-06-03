USE FlexWebApp;
GO
CREATE TABLE dbo.Usuarios (
    UsuarioID INT PRIMARY KEY IDENTITY(1,1),
    NombreCompleto NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Contrasena NVARCHAR(255) NOT NULL,
    Rol NVARCHAR(50) NULL,
    Activo BIT NULL DEFAULT 1,
    FechaCreacion DATETIME NULL DEFAULT GETDATE(),
    UltimoAcceso DATETIME NULL
);
CREATE TABLE dbo.ContenedoresPaso1 (
    Paso1ID INT PRIMARY KEY IDENTITY(1,1),
    TrailerNo NVARCHAR(50) NOT NULL,
    TrailerType NVARCHAR(100) NULL,
    SeaContainerType NVARCHAR(100) NULL,
    UsoEmbarques NVARCHAR(100) NULL,
    PortOfEntry NVARCHAR(100) NULL,
    Comments NVARCHAR(MAX) NULL,
    QtyPallets INT NULL,
    EmptyDate DATE NULL,
    SealSanLuis NVARCHAR(100) NULL,
    DepartureDate DATE NULL,
    SealYuma NVARCHAR(100) NULL,
    AgingA NVARCHAR(100) NULL,
    ActualDate DATE NULL,
    ItemType NVARCHAR(100) NULL,
    Aging NVARCHAR(100) NULL,
    BookingNo NVARCHAR(100) NULL,
    DateExitPort DATE NULL,
    PoNo NVARCHAR(100) NULL,
    UsuarioCreadorID INT NULL,
    FechaCreacion DATETIME NULL DEFAULT GETDATE(),
    Activo BIT NULL DEFAULT 1,
    Status NVARCHAR(50) NULL DEFAULT 'En proceso',
    FechaCompletado DATETIME NULL
);
CREATE TABLE dbo.ContenedoresPaso2 (
    Paso2ID INT PRIMARY KEY IDENTITY(1,1),
    Paso1ID INT NOT NULL,
    CajaTrailer NVARCHAR(100) NULL,
    Placas NVARCHAR(50) NULL,
    Estado NVARCHAR(50) NULL,
    FechaLlegada DATE NULL,
    Turno NVARCHAR(50) NULL,
    Sellos NVARCHAR(100) NULL,
    Rampa NVARCHAR(100) NULL,
    HoraRegistro TIME NULL,
    TotalPallets INT NULL,
    LongitudContenedor NVARCHAR(100) NULL,
    Origen NVARCHAR(100) NULL,
    Empresas NVARCHAR(MAX) NULL,
    ResponsableDescarga NVARCHAR(100) NULL,
    FirmaResponsable NVARCHAR(MAX) NULL,
    Cond1 BIT NULL, Cond2 BIT NULL, Cond3 BIT NULL, Cond4 BIT NULL,
    Cond5 BIT NULL, Cond6 BIT NULL, Cond7 BIT NULL, Cond8 BIT NULL,
    UsuarioInspectorID INT NULL,
    FechaCreacion DATETIME NULL DEFAULT GETDATE(),
    Activo BIT NULL DEFAULT 1,
    CONSTRAINT FK_Paso2_Paso1 FOREIGN KEY (Paso1ID) REFERENCES dbo.ContenedoresPaso1(Paso1ID)
);
CREATE TABLE dbo.ContenedoresPaso3 (
    Paso3ID INT PRIMARY KEY IDENTITY(1,1),
    Paso1ID INT NOT NULL,
    Paso2ID INT NULL,
    InformacionAdicional NVARCHAR(MAX) NULL,
    DescargaCompleta BIT NULL DEFAULT 0,
    FechaDescarga DATE NULL,
    HoraDescarga TIME NULL,
    UsuarioResponsableID INT NULL,
    ObservacionesFinales NVARCHAR(MAX) NULL,
    FechaCreacion DATETIME NULL DEFAULT GETDATE(),
    Activo BIT NULL DEFAULT 1,
    CONSTRAINT FK_Paso3_Paso1 FOREIGN KEY (Paso1ID) REFERENCES dbo.ContenedoresPaso1(Paso1ID),
    CONSTRAINT FK_Paso3_Paso2 FOREIGN KEY (Paso2ID) REFERENCES dbo.ContenedoresPaso2(Paso2ID)
);
CREATE TABLE dbo.Archivos (
    ArchivoID INT PRIMARY KEY IDENTITY(1,1),
    Paso1ID INT NOT NULL,
    TipoArchivo NVARCHAR(50) NULL,
    NombreArchivo NVARCHAR(255) NULL,
    RutaArchivo NVARCHAR(MAX) NULL,
    ContenidoBase64 NVARCHAR(MAX) NULL,
    DescripcionArchivo NVARCHAR(MAX) NULL,
    UsuarioId INT NULL,
    FechaCreacion DATETIME NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Archivos_Paso1 FOREIGN KEY (Paso1ID) REFERENCES dbo.ContenedoresPaso1(Paso1ID)
);
CREATE TABLE dbo.EntregaDeTurno (
    EntregaID INT PRIMARY KEY IDENTITY(1,1),
    Paso1ID INT NOT NULL,
    TurnoOrigen NVARCHAR(50) NULL,
    TurnoDestino NVARCHAR(50) NULL,
    FechaEntrega DATETIME NULL DEFAULT GETDATE(),
    HoraEntrega TIME NULL,
    ResponsableEntrega INT NULL,
    ResponsableRecibe INT NULL,
    EstadoContenedor NVARCHAR(MAX) NULL,
    FirmaEntrega NVARCHAR(MAX) NULL,
    FirmaRecibe NVARCHAR(MAX) NULL,
    Observaciones NVARCHAR(MAX) NULL,
    Activo BIT NULL DEFAULT 1,
    CONSTRAINT FK_EntregaDeTurno_Paso1 FOREIGN KEY (Paso1ID) REFERENCES dbo.ContenedoresPaso1(Paso1ID)
);
CREATE TABLE dbo.Reportes (
    ReporteID INT PRIMARY KEY IDENTITY(1,1),
    Paso1ID INT NOT NULL,
    TipoReporte NVARCHAR(100) NULL,
    ContenidoReporte NVARCHAR(MAX) NULL,
    FechaGeneracion DATETIME NULL DEFAULT GETDATE(),
    UsuarioGeneradorID INT NULL,
    Estado NVARCHAR(50) NULL,
    Activo BIT NULL DEFAULT 1,
    CONSTRAINT FK_Reportes_Paso1 FOREIGN KEY (Paso1ID) REFERENCES dbo.ContenedoresPaso1(Paso1ID)
);
PRINT 'Tablas creadas exitosamente';
