// ====================================================================
// RUTAS API - GESTIÓN DE CONTENEDORES (ACTUALIZADO)
// Archivo: src/api/routes/contenedores.js
// ====================================================================

const express = require('express');
const router = express.Router();
const sql = require('mssql');
const pool = require('../config/database.js');

// ────────────────────────────────────────────────────────────────────
// 1. GUARDAR CONTENEDOR (Paso 1)
// ────────────────────────────────────────────────────────────────────
router.post('/api/contenedores', async (req, res) => {
  try {
    const {
      trailerNo, trailerType, seaContainerType, usoEmbarques, portOfEntry, comments,
      qtyPallets, emptyDate, sealSanLuis, departureDate, sealYuma, agingA, 
      actualDate, itemType, aging, bookingNo, dateExitPort, poNo, usuarioID
    } = req.body;

    const request = pool.request();
    
    // Insertar en ContenedoresPaso1
    const result = await request
      .input('TrailerNo', sql.NVarChar, trailerNo)
      .input('TrailerType', sql.NVarChar, trailerType)
      .input('SeaContainerType', sql.NVarChar, seaContainerType)
      .input('UsoEmbarques', sql.NVarChar, usoEmbarques)
      .input('PortOfEntry', sql.NVarChar, portOfEntry)
      .input('Comments', sql.NVarChar(sql.MAX), comments)
      .input('QtyPallets', sql.Int, qtyPallets || null)
      .input('EmptyDate', sql.Date, emptyDate || null)
      .input('SealSanLuis', sql.NVarChar, sealSanLuis)
      .input('DepartureDate', sql.Date, departureDate || null)
      .input('SealYuma', sql.NVarChar, sealYuma)
      .input('AgingA', sql.NVarChar, agingA)
      .input('ActualDate', sql.Date, actualDate || null)
      .input('ItemType', sql.NVarChar, itemType)
      .input('Aging', sql.NVarChar, aging)
      .input('BookingNo', sql.NVarChar, bookingNo)
      .input('DateExitPort', sql.Date, dateExitPort || null)
      .input('PoNo', sql.NVarChar, poNo)
      .input('UsuarioCreadorID', sql.Int, usuarioID)
      .query(`
        INSERT INTO ContenedoresPaso1 (
          TrailerNo, TrailerType, SeaContainerType, UsoEmbarques, PortOfEntry, Comments,
          QtyPallets, EmptyDate, SealSanLuis, DepartureDate, SealYuma, AgingA,
          ActualDate, ItemType, Aging, BookingNo, DateExitPort, PoNo, UsuarioCreadorID
        )
        VALUES (
          @TrailerNo, @TrailerType, @SeaContainerType, @UsoEmbarques, @PortOfEntry, @Comments,
          @QtyPallets, @EmptyDate, @SealSanLuis, @DepartureDate, @SealYuma, @AgingA,
          @ActualDate, @ItemType, @Aging, @BookingNo, @DateExitPort, @PoNo, @UsuarioCreadorID
        );
        SELECT SCOPE_IDENTITY() as Paso1ID;
      `);

    const paso1ID = result.recordset[0].Paso1ID;

    res.json({
      success: true,
      mensaje: 'Contenedor guardado en Paso 1',
      paso1ID: paso1ID
    });

  } catch (error) {
    console.error('Error Paso 1:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 2. GUARDAR INSPECCIÓN (Paso 2) - ARREGLO DE HORA
// ────────────────────────────────────────────────────────────────────
router.post('/api/inspeccion', async (req, res) => {
  try {
    const {
      paso1ID, cajaTrailer, placas, estado, fechaLlegada, turno,
      sellos, rampa, horaRegistro, totalPallets, longitudContenedor, origen,
      empresas, responsableDescarga, firmaResponsable, condiciones, usuarioID
    } = req.body;

    // Convertir horaRegistro al formato correcto (HH:MM:SS)
    let horaFormato = null;
    if (horaRegistro && horaRegistro.trim() !== '') {
      // Si envían "14:30" convertir a "14:30:00"
      const partes = horaRegistro.split(':');
      if (partes.length === 2) {
        horaFormato = `${partes[0]}:${partes[1]}:00`;
      } else if (partes.length === 3) {
        horaFormato = horaRegistro;
      }
    }

    const request = pool.request();
    
    const result = await request
      .input('Paso1ID', sql.Int, paso1ID)
      .input('CajaTrailer', sql.NVarChar, cajaTrailer)
      .input('Placas', sql.NVarChar, placas)
      .input('Estado', sql.NVarChar, estado)
      .input('FechaLlegada', sql.Date, fechaLlegada)
      .input('Turno', sql.NVarChar, turno)
      .input('Sellos', sql.NVarChar, sellos)
      .input('Rampa', sql.NVarChar, rampa)
      .input('HoraRegistro', sql.Time, horaFormato)
      .input('TotalPallets', sql.Int, totalPallets)
      .input('LongitudContenedor', sql.NVarChar, longitudContenedor)
      .input('Origen', sql.NVarChar, origen)
      .input('Empresas', sql.NVarChar(sql.MAX), JSON.stringify(empresas || []))
      .input('ResponsableDescarga', sql.NVarChar, responsableDescarga)
      .input('FirmaResponsable', sql.NVarChar(sql.MAX), firmaResponsable)
      .input('Cond1', sql.Bit, condiciones?.cond1 ? 1 : 0)
      .input('Cond2', sql.Bit, condiciones?.cond2 ? 1 : 0)
      .input('Cond3', sql.Bit, condiciones?.cond3 ? 1 : 0)
      .input('Cond4', sql.Bit, condiciones?.cond4 ? 1 : 0)
      .input('Cond5', sql.Bit, condiciones?.cond5 ? 1 : 0)
      .input('Cond6', sql.Bit, condiciones?.cond6 ? 1 : 0)
      .input('Cond7', sql.Bit, condiciones?.cond7 ? 1 : 0)
      .input('Cond8', sql.Bit, condiciones?.cond8 ? 1 : 0)
      .input('UsuarioInspectorID', sql.Int, usuarioID)
      .query(`
        INSERT INTO ContenedoresPaso2 (
          Paso1ID, CajaTrailer, Placas, Estado, FechaLlegada, Turno,
          Sellos, Rampa, HoraRegistro, TotalPallets, LongitudContenedor, Origen,
          Empresas, ResponsableDescarga, FirmaResponsable,
          Cond1, Cond2, Cond3, Cond4, Cond5, Cond6, Cond7, Cond8,
          UsuarioInspectorID
        )
        VALUES (
          @Paso1ID, @CajaTrailer, @Placas, @Estado, @FechaLlegada, @Turno,
          @Sellos, @Rampa, @HoraRegistro, @TotalPallets, @LongitudContenedor, @Origen,
          @Empresas, @ResponsableDescarga, @FirmaResponsable,
          @Cond1, @Cond2, @Cond3, @Cond4, @Cond5, @Cond6, @Cond7, @Cond8,
          @UsuarioInspectorID
        );
        SELECT SCOPE_IDENTITY() as Paso2ID;
      `);

    res.json({
      success: true,
      mensaje: 'Inspección guardada en Paso 2',
      paso2ID: result.recordset[0].Paso2ID
    });

  } catch (error) {
    console.error('Error Paso 2:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 3. GUARDAR INFORMACIÓN ADICIONAL (Paso 3)
// ────────────────────────────────────────────────────────────────────
router.post('/api/paso3', async (req, res) => {
  try {
    const {
      paso1ID, paso2ID, informacionAdicional, descargaCompleta,
      fechaDescarga, horaDescarga, usuarioResponsableID, observacionesFinales, usuarioID
    } = req.body;

    const request = pool.request();
    
    const result = await request
      .input('Paso1ID', sql.Int, paso1ID)
      .input('Paso2ID', sql.Int, paso2ID || null)
      .input('InformacionAdicional', sql.NVarChar(sql.MAX), informacionAdicional)
      .input('DescargaCompleta', sql.Bit, descargaCompleta ? 1 : 0)
      .input('FechaDescarga', sql.Date, fechaDescarga || null)
      .input('HoraDescarga', sql.Time, horaDescarga || null)
      .input('UsuarioResponsableID', sql.Int, usuarioResponsableID)
      .input('ObservacionesFinales', sql.NVarChar(sql.MAX), observacionesFinales)
      .query(`
        INSERT INTO ContenedoresPaso3 (
          Paso1ID, Paso2ID, InformacionAdicional, DescargaCompleta,
          FechaDescarga, HoraDescarga, UsuarioResponsableID, ObservacionesFinales
        )
        VALUES (
          @Paso1ID, @Paso2ID, @InformacionAdicional, @DescargaCompleta,
          @FechaDescarga, @HoraDescarga, @UsuarioResponsableID, @ObservacionesFinales
        );
        SELECT SCOPE_IDENTITY() as Paso3ID;
      `);

    res.json({
      success: true,
      mensaje: 'Información guardada en Paso 3',
      paso3ID: result.recordset[0].Paso3ID
    });

  } catch (error) {
    console.error('Error Paso 3:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 4. GUARDAR ARCHIVOS
// ────────────────────────────────────────────────────────────────────
router.post('/api/archivos', async (req, res) => {
  try {
    const {
      paso1ID, tipoArchivo, nombreArchivo, rutaArchivo, contenidoBase64,
      descripcionArchivo, usuarioID
    } = req.body;

    const request = pool.request();
    
    const result = await request
      .input('Paso1ID', sql.Int, paso1ID)
      .input('TipoArchivo', sql.NVarChar, tipoArchivo)
      .input('NombreArchivo', sql.NVarChar, nombreArchivo)
      .input('RutaArchivo', sql.NVarChar(sql.MAX), rutaArchivo)
      .input('ContenidoBase64', sql.NVarChar(sql.MAX), contenidoBase64)
      .input('DescripcionArchivo', sql.NVarChar(sql.MAX), descripcionArchivo)
      .input('UsuarioId', sql.Int, usuarioID)
      .query(`
        INSERT INTO Archivos (
          Paso1ID, TipoArchivo, NombreArchivo, RutaArchivo, ContenidoBase64,
          DescripcionArchivo, UsuarioId
        )
        VALUES (
          @Paso1ID, @TipoArchivo, @NombreArchivo, @RutaArchivo, @ContenidoBase64,
          @DescripcionArchivo, @UsuarioId
        );
        SELECT SCOPE_IDENTITY() as ArchivoID;
      `);

    res.json({
      success: true,
      mensaje: 'Archivo guardado',
      archivoID: result.recordset[0].ArchivoID
    });

  } catch (error) {
    console.error('Error al guardar archivo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 5. GUARDAR ENTREGA DE TURNO
// ────────────────────────────────────────────────────────────────────
router.post('/api/entrega-turno', async (req, res) => {
  try {
    const {
      paso1ID, turnoOrigen, turnoDestino, horaEntrega, responsableEntrega,
      responsableRecibe, estadoContenedor, firmaEntrega, firmaRecibe,
      observaciones, usuarioID
    } = req.body;

    const request = pool.request();
    
    const result = await request
      .input('Paso1ID', sql.Int, paso1ID)
      .input('TurnoOrigen', sql.NVarChar, turnoOrigen)
      .input('TurnoDestino', sql.NVarChar, turnoDestino)
      .input('HoraEntrega', sql.Time, horaEntrega || null)
      .input('ResponsableEntrega', sql.Int, responsableEntrega)
      .input('ResponsableRecibe', sql.Int, responsableRecibe)
      .input('EstadoContenedor', sql.NVarChar(sql.MAX), JSON.stringify(estadoContenedor || {}))
      .input('FirmaEntrega', sql.NVarChar(sql.MAX), firmaEntrega)
      .input('FirmaRecibe', sql.NVarChar(sql.MAX), firmaRecibe)
      .input('Observaciones', sql.NVarChar(sql.MAX), observaciones)
      .query(`
        INSERT INTO EntregaDeTurno (
          Paso1ID, TurnoOrigen, TurnoDestino, HoraEntrega, ResponsableEntrega,
          ResponsableRecibe, EstadoContenedor, FirmaEntrega, FirmaRecibe, Observaciones
        )
        VALUES (
          @Paso1ID, @TurnoOrigen, @TurnoDestino, @HoraEntrega, @ResponsableEntrega,
          @ResponsableRecibe, @EstadoContenedor, @FirmaEntrega, @FirmaRecibe, @Observaciones
        );
        SELECT SCOPE_IDENTITY() as EntregaID;
      `);

    res.json({
      success: true,
      mensaje: 'Entrega de turno registrada',
      entregaID: result.recordset[0].EntregaID
    });

  } catch (error) {
    console.error('Error al registrar entrega:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 6. OBTENER CONTENEDOR CON TODOS SUS DATOS
// ────────────────────────────────────────────────────────────────────
router.get('/api/contenedores/:paso1ID', async (req, res) => {
  try {
    const { paso1ID } = req.params;

    const resultado = await pool.request()
      .input('Paso1ID', sql.Int, paso1ID)
      .query(`
        SELECT p1.*, p2.*, p3.*, a.*, r.*, e.*
        FROM ContenedoresPaso1 p1
        LEFT JOIN ContenedoresPaso2 p2 ON p1.Paso1ID = p2.Paso1ID
        LEFT JOIN ContenedoresPaso3 p3 ON p1.Paso1ID = p3.Paso1ID
        LEFT JOIN Archivos a ON p1.Paso1ID = a.Paso1ID
        LEFT JOIN Reportes r ON p1.Paso1ID = r.Paso1ID
        LEFT JOIN EntregaDeTurno e ON p1.Paso1ID = e.Paso1ID
        WHERE p1.Paso1ID = @Paso1ID
      `);

    res.json({
      success: true,
      data: resultado.recordset
    });

  } catch (error) {
    console.error('Error al obtener contenedor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
