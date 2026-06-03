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
          ActualDate, ItemType, Aging, BookingNo, DateExitPort, PoNo, UsuarioCreadorID, Activo
        )
        VALUES (
          @TrailerNo, @TrailerType, @SeaContainerType, @UsoEmbarques, @PortOfEntry, @Comments,
          @QtyPallets, @EmptyDate, @SealSanLuis, @DepartureDate, @SealYuma, @AgingA,
          @ActualDate, @ItemType, @Aging, @BookingNo, @DateExitPort, @PoNo, @UsuarioCreadorID, 1
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
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.originalError?.message || error.toString()
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
    // Si no proporciona hora, usar la hora actual del servidor
    let horaFormato = null;
    
    if (horaRegistro && horaRegistro.trim() !== '') {
      const partes = horaRegistro.split(':');
      if (partes.length === 2) {
        horaFormato = `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}:00`;
      } else if (partes.length === 3) {
        horaFormato = horaRegistro;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Formato de hora inválido. Use HH:MM o HH:MM:SS',
          detalles: `Recibido: "${horaRegistro}"`
        });
      }
    } else {
      // Usar hora actual del servidor si no se proporciona
      const ahora = new Date();
      const horas = String(ahora.getHours()).padStart(2, '0');
      const minutos = String(ahora.getMinutes()).padStart(2, '0');
      const segundos = String(ahora.getSeconds()).padStart(2, '0');
      horaFormato = `${horas}:${minutos}:${segundos}`;
    }

    const request = pool.request();
    
    const result = await request
      .input('Paso1ID', sql.Int, paso1ID)
      .input('CajaTrailer', sql.NVarChar, cajaTrailer)
      .input('Placas', sql.NVarChar, placas)
      .input('Estado', sql.NVarChar, estado)
      .input('FechaLlegada', sql.Date, fechaLlegada || null)
      .input('Turno', sql.NVarChar, turno)
      .input('Sellos', sql.NVarChar, sellos)
      .input('Rampa', sql.NVarChar, rampa)
      .input('HoraRegistroVal', sql.NVarChar, horaFormato)
      .input('TotalPallets', sql.Int, totalPallets || null)
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
          @Sellos, @Rampa, CAST(@HoraRegistroVal AS TIME), @TotalPallets, @LongitudContenedor, @Origen,
          @Empresas, @ResponsableDescarga, @FirmaResponsable,
          @Cond1, @Cond2, @Cond3, @Cond4, @Cond5, @Cond6, @Cond7, @Cond8,
          @UsuarioInspectorID
        );
        SELECT SCOPE_IDENTITY() as Paso2ID;
      `);

    res.json({
      success: true,
      mensaje: 'Inspección guardada en Paso 2',
      paso2ID: result.recordset[0].Paso2ID,
      debug: { horaOriginal: horaRegistro, horaFormato: horaFormato }
    });

  } catch (error) {
    console.error('Error Paso 2:', error);
    console.error('HoraRegistro recibida:', req.body.horaRegistro);
    console.error('Detalles del error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.originalError?.message || error.toString(),
      receivedHora: req.body.horaRegistro
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 3. SUBIR DOCUMENTOS (Paso 3) - Guardado en tabla Archivos + AUTO-COMPLETAR
// ────────────────────────────────────────────────────────────────────
router.post('/api/documentos', async (req, res) => {
  try {
    const { paso1ID, documentos, usuarioID } = req.body;

    console.log('[PASO 3] Datos recibidos:');
    console.log('   - paso1ID:', paso1ID);
    console.log('   - cantidadDocumentos:', documentos ? documentos.length : 0);
    console.log('   - usuarioID:', usuarioID);

    // Validación
    if (!paso1ID) {
      console.error('[ERROR] paso1ID faltante');
      return res.status(400).json({
        success: false,
        error: 'paso1ID es requerido'
      });
    }

    if (!documentos || documentos.length === 0) {
      console.warn('⚠️ No hay documentos para guardar');
      return res.json({
        success: true,
        mensaje: 'No hay documentos para guardar'
      });
    }

    const request = pool.request();
    let totalSize = 0;

    // 1. Guardar cada archivo en tabla Archivos
    console.log('[INFO] Guardando archivos en BD...');
    for (const doc of documentos) {
      try {
        console.log(`   - Insertando: ${doc.nombre} (${doc.tamaño} bytes, tipo: ${doc.tipo})`);
        const fileRequest = pool.request();
        const result = await fileRequest
          .input('Paso1ID', sql.Int, paso1ID)
          .input('NombreArchivo', sql.NVarChar, doc.nombre)
          .input('TipoArchivo', sql.NVarChar, doc.tipo || 'documento')
          .input('ContenidoBase64', sql.NVarChar(sql.MAX), doc.contenido || null)
          .input('UsuarioId', sql.Int, usuarioID)
          .query(`
            INSERT INTO Archivos (Paso1ID, NombreArchivo, TipoArchivo, ContenidoBase64, UsuarioId)
            VALUES (@Paso1ID, @NombreArchivo, @TipoArchivo, @ContenidoBase64, @UsuarioId)
          `);
        totalSize += doc.tamaño || 0;
        console.log(`[OK] Insertado en tabla Archivos`);
      } catch (fileError) {
        console.error(`[ERROR] Error insertando archivo ${doc.nombre}:`, fileError.message);
        throw fileError;
      }
    }

    // 2. Crear/Actualizar registro en ContenedoresPaso3
    console.log('[INFO] Actualizando ContenedoresPaso3...');
    try {
      const paso3Request = pool.request();
      await paso3Request
        .input('Paso1ID', sql.Int, paso1ID)
        .input('UsuarioResponsableID', sql.Int, usuarioID)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM ContenedoresPaso3 WHERE Paso1ID = @Paso1ID)
            INSERT INTO ContenedoresPaso3 (Paso1ID, UsuarioResponsableID, FechaCreacion)
            VALUES (@Paso1ID, @UsuarioResponsableID, GETDATE())
          ELSE
            UPDATE ContenedoresPaso3
            SET FechaCreacion = GETDATE()
            WHERE Paso1ID = @Paso1ID
        `);
      console.log(`[OK] ContenedoresPaso3 actualizado`);
    } catch (paso3Error) {
      console.error('[ERROR] Error en ContenedoresPaso3:', paso3Error.message);
      throw paso3Error;
    }

    // 3. AUTOMÁTICAMENTE cambiar Status a Completado y archivar el contenedor
    console.log('[INFO] Cambiando Status a Completado e Activo=0...');
    try {
      const updateRequest = pool.request();
      const updateResult = await updateRequest
        .input('Paso1ID', sql.Int, paso1ID)
        .query(`
          UPDATE ContenedoresPaso1
          SET Status = 'Completado',
              FechaCompletado = GETDATE(),
              Activo = 0
          WHERE Paso1ID = @Paso1ID
        `);
      console.log(`[OK] Status actualizado a Completado`);
      console.log(`   Filas afectadas: ${updateResult.rowsAffected[0]}`);
    } catch (updateError) {
      console.error('[ERROR] Error cambiando Status:', updateError.message);
      throw updateError;
    }

    const respuestaFinal = {
      success: true,
      mensaje: `${documentos.length} documentos guardados. Contenedor completado y archivado automáticamente.`,
      paso3Completado: true,
      nuevaState: {
        status: 'Completado',
        activo: false
      }
    };
    console.log('[OK] [PASO 3] FINALIZADO EXITOSAMENTE');
    res.json(respuestaFinal);

  } catch (error) {
    console.error('[ERROR] [PASO 3] Error guardando documentos:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.originalError?.message || error.toString()
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 4. OBTENER TODOS LOS CONTENEDORES (activos e inactivos)
// ────────────────────────────────────────────────────────────────────
router.get('/api/contenedores', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT 
          p1.Paso1ID,
          p1.TrailerNo,
          p1.TrailerType,
          p1.SeaContainerType,
          p1.UsoEmbarques,
          p1.PortOfEntry,
          p1.Comments,
          p1.QtyPallets,
          p1.EmptyDate,
          p1.SealSanLuis,
          p1.DepartureDate,
          p1.SealYuma,
          p1.AgingA,
          p1.ActualDate,
          p1.ItemType,
          p1.Aging,
          p1.BookingNo,
          p1.DateExitPort,
          p1.PoNo,
          p1.UsuarioCreadorID,
          p1.FechaCreacion,
          p1.FechaCompletado,
          p1.Status,
          p1.Activo,
          (SELECT COUNT(*) FROM ContenedoresPaso2 WHERE Paso1ID = p1.Paso1ID) as Paso2Count,
          (SELECT COUNT(*) FROM ContenedoresPaso3 WHERE Paso1ID = p1.Paso1ID) as Paso3Count
        FROM ContenedoresPaso1 p1
        ORDER BY p1.FechaCreacion DESC
      `);

    res.json({
      success: true,
      datos: result.recordset
    });

  } catch (error) {
    console.error('Error GET todos los contenedores:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.originalError?.message || error.toString()
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 5. OBTENER CONTENEDOR COMPLETO (por ID)
// ────────────────────────────────────────────────────────────────────
router.get('/api/contenedores/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.request()
      .input('Paso1ID', sql.Int, id)
      .query(`
        SELECT 
          p1.*,
          p2.Paso2ID,
          p2.CajaTrailer,
          p2.Placas,
          p2.Estado,
          p2.FechaLlegada,
          p2.Turno,
          p2.Sellos,
          p2.Rampa,
          p2.HoraRegistro,
          p2.TotalPallets,
          p2.LongitudContenedor,
          p2.Origen,
          p2.Empresas,
          p2.ResponsableDescarga,
          p2.FirmaResponsable,
          p2.Cond1,
          p2.Cond2,
          p2.Cond3,
          p2.Cond4,
          p2.Cond5,
          p2.Cond6,
          p2.Cond7,
          p2.Cond8,
          p3.Paso3ID,
          p3.InformacionAdicional,
          p3.DescargaCompleta,
          p3.FechaDescarga,
          p3.HoraDescarga
        FROM ContenedoresPaso1 p1
        LEFT JOIN ContenedoresPaso2 p2 ON p1.Paso1ID = p2.Paso1ID
        LEFT JOIN ContenedoresPaso3 p3 ON p1.Paso1ID = p3.Paso1ID
        WHERE p1.Paso1ID = @Paso1ID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contenedor no encontrado'
      });
    }

    res.json({
      success: true,
      datos: result.recordset[0]
    });

  } catch (error) {
    console.error('Error GET:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 6. ARCHIVAR CONTENEDOR (desactivar)
// ────────────────────────────────────────────────────────────────────
router.patch('/api/contenedores/:id/archivar', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.request()
      .input('Paso1ID', sql.Int, id)
      .query(`
        UPDATE ContenedoresPaso1
        SET Activo = 0
        WHERE Paso1ID = @Paso1ID
      `);

    res.json({
      success: true,
      mensaje: 'Contenedor archivado exitosamente'
    });

  } catch (error) {
    console.error('Error archivando:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 7. ELIMINAR CONTENEDOR (cascada)
// ────────────────────────────────────────────────────────────────────
router.delete('/api/contenedores/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Primero eliminar archivos relacionados
    await pool.request()
      .input('Paso1ID', sql.Int, id)
      .query(`
        DELETE FROM Archivos
        WHERE Paso1ID = @Paso1ID
      `);

    // Eliminar reportes
    await pool.request()
      .input('Paso1ID', sql.Int, id)
      .query(`
        DELETE FROM Reportes
        WHERE Paso1ID = @Paso1ID
      `);

    // Eliminar entregas de turno
    await pool.request()
      .input('Paso1ID', sql.Int, id)
      .query(`
        DELETE FROM EntregaDeTurno
        WHERE Paso1ID = @Paso1ID
      `);

    // Eliminar Paso 3
    await pool.request()
      .input('Paso1ID', sql.Int, id)
      .query(`
        DELETE FROM ContenedoresPaso3
        WHERE Paso1ID = @Paso1ID
      `);

    // Eliminar Paso 2
    await pool.request()
      .input('Paso1ID', sql.Int, id)
      .query(`
        DELETE FROM ContenedoresPaso2
        WHERE Paso1ID = @Paso1ID
      `);

    // Finalmente eliminar Paso 1
    await pool.request()
      .input('Paso1ID', sql.Int, id)
      .query(`
        DELETE FROM ContenedoresPaso1
        WHERE Paso1ID = @Paso1ID
      `);

    res.json({
      success: true,
      mensaje: 'Contenedor eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 8. ACTUALIZAR ESTADO - Validar que pasos existan en BD
// ────────────────────────────────────────────────────────────────────
router.patch('/api/contenedores/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { paso, completado } = req.body;

    // En el nuevo esquema, el estado se determina por la existencia de registros en cada tabla
    // Paso 2 completado = existe ContenedoresPaso2
    // Paso 3 completado = existe ContenedoresPaso3
    
    // Solo respondemos que el paso está completado si existe el registro
    const checkQuery = paso === 2 ? 
      `SELECT Paso2ID FROM ContenedoresPaso2 WHERE Paso1ID = @Paso1ID` :
      `SELECT Paso3ID FROM ContenedoresPaso3 WHERE Paso1ID = @Paso1ID`;

    const result = await pool.request()
      .input('Paso1ID', sql.Int, id)
      .query(checkQuery);

    const existe = result.recordset.length > 0;

    res.json({
      success: true,
      mensaje: `Paso ${paso} ${existe ? 'completado' : 'pendiente'}`,
      estado: {
        paso: paso,
        completado: existe
      }
    });

  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 9. ACTUALIZAR PASO 1 (Para edición de contenedores existentes)
// ────────────────────────────────────────────────────────────────────
router.patch('/api/contenedores/:id/paso1', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      trailerNo, trailerType, seaContainerType, usoEmbarques, portOfEntry, comments,
      qtyPallets, emptyDate, sealSanLuis, departureDate, sealYuma, agingA, 
      actualDate, itemType, aging, bookingNo, dateExitPort, poNo, usuarioID
    } = req.body;

    const request = pool.request();
    
    const result = await request
      .input('Paso1ID', sql.Int, id)
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
      .query(`
        UPDATE ContenedoresPaso1 SET
          TrailerNo = @TrailerNo,
          TrailerType = @TrailerType,
          SeaContainerType = @SeaContainerType,
          UsoEmbarques = @UsoEmbarques,
          PortOfEntry = @PortOfEntry,
          Comments = @Comments,
          QtyPallets = @QtyPallets,
          EmptyDate = @EmptyDate,
          SealSanLuis = @SealSanLuis,
          DepartureDate = @DepartureDate,
          SealYuma = @SealYuma,
          AgingA = @AgingA,
          ActualDate = @ActualDate,
          ItemType = @ItemType,
          Aging = @Aging,
          BookingNo = @BookingNo,
          DateExitPort = @DateExitPort,
          PoNo = @PoNo
        WHERE Paso1ID = @Paso1ID
      `);

    res.json({
      success: true,
      id: id,
      message: 'Paso 1 actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando Paso 1:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.originalError?.message || error.toString()
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 10. LOGIN - Autenticar usuario contra BD
// ────────────────────────────────────────────────────────────────────
router.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    const request = pool.request();
    const result = await request
      .input('Email', sql.NVarChar, email)
      .input('Password', sql.NVarChar, password)
      .query(`
        SELECT UsuarioID, NombreCompleto, Email, Rol, Activo
        FROM Usuarios
        WHERE Email = @Email AND Contraseña = @Password AND Activo = 1
      `);

    // Nota: En producción, usar bcrypt para hashear contraseñas
    // Por ahora comparamos directamente (NO RECOMENDADO EN PRODUCCIÓN)
    if (result.recordset.length === 0) {
      // Buscar usuario con la contraseña
      const userCheck = await pool.request()
        .input('Email', sql.NVarChar, email)
        .query(`
          SELECT UsuarioID, NombreCompleto, Email, Rol, Activo, Contraseña
          FROM Usuarios
          WHERE Email = @Email
        `);

      if (userCheck.recordset.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }

      const user = userCheck.recordset[0];
      if (user.Contraseña !== password || user.Activo === 0) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }

      // Actualizar último acceso
      await pool.request()
        .input('UsuarioID', sql.Int, user.UsuarioID)
        .query(`
          UPDATE Usuarios
          SET UltimoAcceso = GETDATE()
          WHERE UsuarioID = @UsuarioID
        `);

      return res.json({
        success: true,
        usuario: {
          id: user.UsuarioID,
          nombre: user.NombreCompleto,
          email: user.Email,
          rol: user.Rol
        }
      });
    }

    const user = result.recordset[0];
    
    // Actualizar último acceso
    await pool.request()
      .input('UsuarioID', sql.Int, user.UsuarioID)
      .query(`
        UPDATE Usuarios
        SET UltimoAcceso = GETDATE()
        WHERE UsuarioID = @UsuarioID
      `);

    res.json({
      success: true,
      usuario: {
        id: user.UsuarioID,
        nombre: user.NombreCompleto,
        email: user.Email,
        rol: user.Rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
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
// 13. OBTENER ARCHIVOS DE UN CONTENEDOR (Para PDF)
// ────────────────────────────────────────────────────────────────────
router.get('/api/archivos/:paso1ID', async (req, res) => {
  try {
    const { paso1ID } = req.params;
    
    const result = await pool.request()
      .input('Paso1ID', sql.Int, paso1ID)
      .query(`
        SELECT 
          ArchivoID,
          NombreArchivo,
          TipoArchivo,
          ContenidoBase64
        FROM Archivos
        WHERE Paso1ID = @Paso1ID
        ORDER BY ArchivoID DESC
      `);

    res.json({
      success: true,
      archivos: result.recordset || []
    });

  } catch (error) {
    console.error('Error obteniendo archivos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
