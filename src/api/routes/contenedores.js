// ====================================================================
// RUTAS API - GESTIÓN DE CONTENEDORES
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
    
    // Insertar en Contenedores
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
      id: contenedorID
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
// 2. GUARDAR INSPECCIÓN (Paso 2)
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
    console.error('Error Paso 2:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 3. SUBIR DOCUMENTOS (Paso 3)
// ────────────────────────────────────────────────────────────────────
router.post('/api/documentos', async (req, res) => {
  try {
    const { contenedorID, documentos, usuarioID } = req.body;

    if (!documentos || documentos.length === 0) {
      return res.json({
        success: true,
        mensaje: 'No hay documentos para guardar'
      });
    }

    for (const doc of documentos) {
      await pool.request()
        .input('ContenedorID', sql.Int, contenedorID)
        .input('NombreArchivo', sql.NVarChar, doc.nombre)
        .input('TipoArchivo', sql.NVarChar, doc.tipo)
        .input('TamañoKB', sql.Int, Math.ceil(doc.tamaño / 1024))
        .input('RutaArchivo', sql.NVarChar, doc.ruta || '/uploads/' + doc.nombre)
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
    console.error('Error Paso 3:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ────────────────────────────────────────────────────────────────────
// 4. OBTENER TODOS LOS CONTENEDORES
// ────────────────────────────────────────────────────────────────────
router.get('/api/contenedores', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT c.*, u.NombreCompleto as CreadoPor,
               COUNT(d.DocumentoID) as TotalDocumentos
        FROM Contenedores c
        LEFT JOIN Usuarios u ON c.UsuarioCreadorID = u.UsuarioID
        LEFT JOIN Documentos d ON c.ContenedorID = d.ContenedorID
        GROUP BY c.ContenedorID, c.TrailerNo, c.TrailerType, c.SeaContainerType,
                 c.UsoEmbarques, c.PortOfEntry, c.Comments, c.QtyPallets, c.EmptyDate,
                 c.SealSanLuis, c.DepartureDate, c.SealYuma, c.AgingA, c.ActualDate,
                 c.ItemType, c.Aging, c.BookingNo, c.DateExitPort, c.PoNo,
                 c.UsuarioCreadorID, c.FechaCreacion, c.Estado, c.Archivado, c.Paso2Completado, c.Paso3Completado,
                 u.NombreCompleto
        ORDER BY c.FechaCreacion DESC
      `);

    res.json({
      success: true,
      datos: result.recordset
    });

  } catch (error) {
    console.error('Error GET todos los contenedores:', error);
    res.status(500).json({
      success: false,
      error: error.message
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
                 c.UsuarioCreadorID, c.FechaCreacion, c.Estado, c.Archivado, c.Paso2Completado, c.Paso3Completado,
                 u.NombreCompleto, i.InspeccionID, i.FirmaResponsable
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
// 6. ARCHIVAR CONTENEDOR
// ────────────────────────────────────────────────────────────────────
router.patch('/api/contenedores/:id/archivar', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.request()
      .input('ContenedorID', sql.Int, id)
      .query(`
        UPDATE Contenedores
        SET Archivado = 1
        WHERE ContenedorID = @ContenedorID
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
// 7. ELIMINAR CONTENEDOR
// ────────────────────────────────────────────────────────────────────
router.delete('/api/contenedores/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Primero eliminar documentos relacionados
    await pool.request()
      .input('ContenedorID', sql.Int, id)
      .query(`
        DELETE FROM Documentos
        WHERE ContenedorID = @ContenedorID
      `);

    // Luego eliminar inspecciones
    await pool.request()
      .input('ContenedorID', sql.Int, id)
      .query(`
        DELETE FROM InspeccionesTrailer
        WHERE ContenedorID = @ContenedorID
      `);

    // Eliminar pasos
    await pool.request()
      .input('ContenedorID', sql.Int, id)
      .query(`
        DELETE FROM ContenedoresPasos
        WHERE ContenedorID = @ContenedorID
      `);

    // Finalmente eliminar contenedor
    await pool.request()
      .input('ContenedorID', sql.Int, id)
      .query(`
        DELETE FROM Contenedores
        WHERE ContenedorID = @ContenedorID
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
// 8. ACTUALIZAR ESTADO (cuando se completan pasos)
// ────────────────────────────────────────────────────────────────────
router.patch('/api/contenedores/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { paso, completado } = req.body;

    let query = `
      UPDATE Contenedores
      SET ${paso === 2 ? 'Paso2Completado' : 'Paso3Completado'} = @Completado
      WHERE ContenedorID = @ContenedorID
    `;

    // Si ambos pasos están completos, actualizar estado general a COMPLETADO
    if (completado) {
      query = `
        UPDATE Contenedores
        SET ${paso === 2 ? 'Paso2Completado' : 'Paso3Completado'} = 1,
            Estado = CASE 
              WHEN (Paso2Completado = 1 AND Paso3Completado = 1) OR (${paso === 3 ? '1' : 'Paso3Completado'} = 1 AND Paso2Completado = 1) THEN 'COMPLETADO'
              ELSE 'EN PROGRESO'
            END
        WHERE ContenedorID = @ContenedorID
      `;
    }

    await pool.request()
      .input('ContenedorID', sql.Int, id)
      .input('Completado', sql.Bit, completado ? 1 : 0)
      .query(query);

    res.json({
      success: true,
      mensaje: `Paso ${paso} actualizado exitosamente`
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
      .input('ContenedorID', sql.Int, id)
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
        UPDATE Contenedores SET
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
        WHERE ContenedorID = @ContenedorID
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
      error: error.message
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

module.exports = router;
