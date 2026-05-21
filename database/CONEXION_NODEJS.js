// ====================================================================
// CONEXIÓN A SQL SERVER - NODE.JS/EXPRESS
// ====================================================================

// 1. INSTALAR DEPENDENCIA (ejecutar en terminal)
// npm install mssql

// ====================================================================
// ARCHIVO: config/database.js
// ====================================================================

const sql = require('mssql');

// Configuración de conexión a SQL Server Local (Autenticación Windows)
const config = {
  server: 'MSSQLEXPRESS',        // Tu instancia SQL Server Express
  database: 'FlexWebApp',        // Nombre de tu BD
  authentication: {
    type: 'ntlm',                // Autenticación Windows (NTLM)
    options: {
      userName: 'MSJalero',      // Tu usuario de Windows
      domain: '.'                // . para usuario local
    }
  },
  options: {
    encrypt: false,              // false en desarrollo local
    trustServerCertificate: true,
    enableKeepAlive: true
  }
};

// Pool de conexiones (reutilizar conexiones)
const pool = new sql.ConnectionPool(config);

// Conectar al pool
pool.connect(err => {
  if (err) {
    console.error('Error conectando a SQL Server:', err);
    process.exit(1);
  }
  console.log('✓ Conectado a SQL Server exitosamente');
});

// Exportar pool para usar en rutas
module.exports = pool;

// ====================================================================
// ARCHIVO: routes/contenedores.js (EJEMPLO DE API)
// ====================================================================

const express = require('express');
const router = express.Router();
const sql = require('mssql');
const pool = require('../config/database');

// ────────────────────────────────────────────────────────────────────
// GUARDAR CONTENEDOR (Paso 1)
// ────────────────────────────────────────────────────────────────────
router.post('/api/contenedores', async (req, res) => {
  try {
    const {
      trailerNo, trailerType, seaContainerType, usoEmbarques, portOfEntry, comments,
      qtyPallets, emptyDate, sealSanLuis, departureDate, sealYuma, agingA, 
      actualDate, itemType, aging, bookingNo, dateExitPort, poNo, usuarioID
    } = req.body;

    const request = pool.request();
    
    // Insertar en Contenedores
    const result = await request
      .input('TrailerNo', sql.NVarChar, trailerNo)
      .input('TrailerType', sql.NVarChar, trailerType)
      .input('SeaContainerType', sql.NVarChar, seaContainerType)
      .input('UsoEmbarques', sql.NVarChar, usoEmbarques)
      .input('PortOfEntry', sql.NVarChar, portOfEntry)
      .input('Comments', sql.NVarChar(sql.MAX), comments)
      .input('QtyPallets', sql.Int, qtyPallets)
      .input('EmptyDate', sql.Date, emptyDate)
      .input('SealSanLuis', sql.NVarChar, sealSanLuis)
      .input('DepartureDate', sql.Date, departureDate)
      .input('SealYuma', sql.NVarChar, sealYuma)
      .input('AgingA', sql.NVarChar, agingA)
      .input('ActualDate', sql.Date, actualDate)
      .input('ItemType', sql.NVarChar, itemType)
      .input('Aging', sql.NVarChar, aging)
      .input('BookingNo', sql.NVarChar, bookingNo)
      .input('DateExitPort', sql.Date, dateExitPort)
      .input('PoNo', sql.NVarChar, poNo)
      .input('UsuarioCreadorID', sql.Int, usuarioID)
      .query(`
        INSERT INTO Contenedores (
          TrailerNo, TrailerType, SeaContainerType, UsoEmbarques, PortOfEntry, Comments,
          QtyPallets, EmptyDate, SealSanLuis, DepartureDate, SealYuma, AgingA,
          ActualDate, ItemType, Aging, BookingNo, DateExitPort, PoNo, UsuarioCreadorID
        )
        VALUES (
          @TrailerNo, @TrailerType, @SeaContainerType, @UsoEmbarques, @PortOfEntry, @Comments,
          @QtyPallets, @EmptyDate, @SealSanLuis, @DepartureDate, @SealYuma, @AgingA,
          @ActualDate, @ItemType, @Aging, @BookingNo, @DateExitPort, @PoNo, @UsuarioCreadorID
        );
        SELECT SCOPE_IDENTITY() as ContenedorID;
      `);

    const contenedorID = result.recordset[0].ContenedorID;

    // Registrar Paso 1 como completado
    await pool.request()
      .input('ContenedorID', sql.Int, contenedorID)
      .input('NumeroPaso', sql.Int, 1)
      .input('UsuarioID', sql.Int, usuarioID)
      .input('DatosGuardados', sql.NVarChar(sql.MAX), JSON.stringify(req.body))
      .query(`
        INSERT INTO ContenedoresPasos (ContenedorID, NumeroPaso, Completado, DatosGuardados, UsuarioID)
        VALUES (@ContenedorID, @NumeroPaso, 1, @DatosGuardados, @UsuarioID)
      `);

    res.json({
      success: true,
      mensaje: 'Contenedor guardado en Paso 1',
      contenedorID: contenedorID
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// GUARDAR INSPECCIÓN (Paso 2)
// ────────────────────────────────────────────────────────────────────
router.post('/api/inspeccion', async (req, res) => {
  try {
    const {
      contenedorID, cajaTrailer, placas, estado, fechaLlegada, turno,
      sellos, rampa, horaRegistro, totalPallets, longitudContenedor, origen,
      empresas, responsableDescarga, firmaResponsable, condiciones, usuarioID
    } = req.body;

    const request = pool.request();
    
    const result = await request
      .input('ContenedorID', sql.Int, contenedorID)
      .input('CajaTrailer', sql.NVarChar, cajaTrailer)
      .input('Placas', sql.NVarChar, placas)
      .input('Estado', sql.NVarChar, estado)
      .input('FechaLlegada', sql.Date, fechaLlegada)
      .input('Turno', sql.NVarChar, turno)
      .input('Sellos', sql.NVarChar, sellos)
      .input('Rampa', sql.NVarChar, rampa)
      .input('HoraRegistro', sql.Time, horaRegistro)
      .input('TotalPallets', sql.Int, totalPallets)
      .input('LongitudContenedor', sql.NVarChar, longitudContenedor)
      .input('Origen', sql.NVarChar, origen)
      .input('Empresas', sql.NVarChar(sql.MAX), JSON.stringify(empresas))
      .input('ResponsableDescarga', sql.NVarChar, responsableDescarga)
      .input('FirmaResponsable', sql.NVarChar(sql.MAX), firmaResponsable)
      .input('Cond1', sql.Bit, condiciones.cond1 ? 1 : 0)
      .input('Cond2', sql.Bit, condiciones.cond2 ? 1 : 0)
      .input('Cond3', sql.Bit, condiciones.cond3 ? 1 : 0)
      .input('Cond4', sql.Bit, condiciones.cond4 ? 1 : 0)
      .input('Cond5', sql.Bit, condiciones.cond5 ? 1 : 0)
      .input('Cond6', sql.Bit, condiciones.cond6 ? 1 : 0)
      .input('Cond7', sql.Bit, condiciones.cond7 ? 1 : 0)
      .input('Cond8', sql.Bit, condiciones.cond8 ? 1 : 0)
      .input('UsuarioInspectorID', sql.Int, usuarioID)
      .query(`
        INSERT INTO InspeccionesTrailer (
          ContenedorID, CajaTrailer, Placas, Estado, FechaLlegada, Turno,
          Sellos, Rampa, HoraRegistro, TotalPallets, LongitudContenedor, Origen,
          Empresas, ResponsableDescarga, FirmaResponsable,
          Cond1, Cond2, Cond3, Cond4, Cond5, Cond6, Cond7, Cond8,
          UsuarioInspectorID
        )
        VALUES (
          @ContenedorID, @CajaTrailer, @Placas, @Estado, @FechaLlegada, @Turno,
          @Sellos, @Rampa, @HoraRegistro, @TotalPallets, @LongitudContenedor, @Origen,
          @Empresas, @ResponsableDescarga, @FirmaResponsable,
          @Cond1, @Cond2, @Cond3, @Cond4, @Cond5, @Cond6, @Cond7, @Cond8,
          @UsuarioInspectorID
        );
        SELECT SCOPE_IDENTITY() as InspeccionID;
      `);

    res.json({
      success: true,
      mensaje: 'Inspección guardada en Paso 2',
      inspeccionID: result.recordset[0].InspeccionID
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// SUBIR DOCUMENTOS (Paso 3)
// ────────────────────────────────────────────────────────────────────
router.post('/api/documentos', async (req, res) => {
  try {
    const { contenedorID, documentos, usuarioID } = req.body;

    const request = pool.request();

    for (const doc of documentos) {
      await request
        .input('ContenedorID', sql.Int, contenedorID)
        .input('NombreArchivo', sql.NVarChar, doc.nombre)
        .input('TipoArchivo', sql.NVarChar, doc.tipo)
        .input('TamañoKB', sql.Int, Math.ceil(doc.tamaño / 1024))
        .input('RutaArchivo', sql.NVarChar, doc.ruta)
        .input('UsuarioSubidaID', sql.Int, usuarioID)
        .query(`
          INSERT INTO Documentos (ContenedorID, NombreArchivo, TipoArchivo, TamañoKB, RutaArchivo, UsuarioSubidaID)
          VALUES (@ContenedorID, @NombreArchivo, @TipoArchivo, @TamañoKB, @RutaArchivo, @UsuarioSubidaID)
        `);
    }

    res.json({
      success: true,
      mensaje: `${documentos.length} documentos guardados en Paso 3`
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// OBTENER CONTENEDOR COMPLETO
// ────────────────────────────────────────────────────────────────────
router.get('/api/contenedores/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const request = pool.request();
    
    const result = await request
      .input('ContenedorID', sql.Int, id)
      .query(`
        SELECT c.*, u.NombreCompleto as CreadoPor,
               i.InspeccionID, i.FirmaResponsable,
               COUNT(d.DocumentoID) as TotalDocumentos
        FROM Contenedores c
        LEFT JOIN Usuarios u ON c.UsuarioCreadorID = u.UsuarioID
        LEFT JOIN InspeccionesTrailer i ON c.ContenedorID = i.ContenedorID
        LEFT JOIN Documentos d ON c.ContenedorID = d.ContenedorID
        WHERE c.ContenedorID = @ContenedorID
        GROUP BY c.ContenedorID, c.TrailerNo, c.TrailerType, c.SeaContainerType,
                 c.UsoEmbarques, c.PortOfEntry, c.Comments, c.QtyPallets, c.EmptyDate,
                 c.SealSanLuis, c.DepartureDate, c.SealYuma, c.AgingA, c.ActualDate,
                 c.ItemType, c.Aging, c.BookingNo, c.DateExitPort, c.PoNo,
                 c.UsuarioCreadorID, c.FechaCreacion, c.Estado,
                 u.NombreCompleto, i.InspeccionID, i.FirmaResponsable
      `);

    res.json({
      success: true,
      datos: result.recordset[0]
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

// ====================================================================
// ARCHIVO: server.js (EJEMPLO EXPRESS)
// ====================================================================

const express = require('express');
const pool = require('./config/database');
const contenedoresRouter = require('./routes/contenedores');

const app = express();

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Rutas
app.use(contenedoresRouter);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Servidor ejecutándose en puerto ${PORT}`);
  console.log(`✓ Base de datos: FlexWebApp`);
  console.log(`✓ SQL Server: localhost`);
});

// ====================================================================
// NOTAS IMPORTANTES
// ====================================================================
// 1. Instalar dependencias: npm install express mssql cors
// 2. Actualizar conexión en config/database.js con tus credenciales
// 3. Ejecutar script SQL en SSMS primero
// 4. Las Data URLs de firmas se guardan directamente en BD (línea BASE64)
// 5. Para archivos, puedes guardar en servidor o Azure Blob Storage
