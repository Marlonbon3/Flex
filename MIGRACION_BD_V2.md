# 📋 Guía de Migración - Estructura BD v2.0

## 🎯 Cambios Principales

### 1. **ContenedoresPaso1**
```sql
-- AGREGAR 2 COLUMNAS:
ALTER TABLE ContenedoresPaso1 ADD Status NVARCHAR(50) DEFAULT 'En proceso';
ALTER TABLE ContenedoresPaso1 ADD FechaCompletado DATETIME NULL;
```
- `Status`: 'En proceso' o 'Completado' (se cambia AUTOMÁTICAMENTE en la API)
- `FechaCompletado`: Se establece automáticamente cuando se completa Paso 3
- `Activo`: 1 = En proceso, 0 = Archivado

---

### 2. **ContenedoresPaso3**
```sql
-- SIMPLIFICAR: Eliminar campos no usados
ALTER TABLE ContenedoresPaso3 DROP COLUMN InformacionAdicional;
ALTER TABLE ContenedoresPaso3 DROP COLUMN DescargaCompleta;
ALTER TABLE ContenedoresPaso3 DROP COLUMN FechaDescarga;
ALTER TABLE ContenedoresPaso3 DROP COLUMN HoraDescarga;
ALTER TABLE ContenedoresPaso3 DROP COLUMN UsuarioResponsableID;
ALTER TABLE ContenedoresPaso3 DROP COLUMN ObservacionesFinales;

-- AGREGAR RESTRICCIÓN ÚNICA (un Paso3 por contenedor)
ALTER TABLE ContenedoresPaso3 ADD CONSTRAINT UQ_Paso3_Paso1ID UNIQUE (Paso1ID);

-- AGREGAR CAMPOS DE CONTROL
ALTER TABLE ContenedoresPaso3 ADD CantidadArchivos INT DEFAULT 0;
ALTER TABLE ContenedoresPaso3 ADD TamanioTotal BIGINT DEFAULT 0;
```

---

### 3. **Archivos (tabla existente)**
Se mantiene igual - guarda los documentos en Base64

---

## 🔄 Flujo Automático

### Cuando se guarda Paso 3:
```
1. Usuario sube archivos en Paso 3
2. Backend llama a POST /api/documentos
3. Archivos se guardan en tabla Archivos
4. Crea registro en ContenedoresPaso3
5. AUTOMÁTICAMENTE:
   ✓ Status = 'Completado'
   ✓ FechaCompletado = NOW()
   ✓ Activo = 0 (pasa a Archivo)
   ✓ Desaparece de lista "En proceso"
   ✓ Aparece en sección "Archivo"
```

---

## 🛠️ Cambios en la API

### Endpoint: POST /api/documentos (MODIFICADO)
```javascript
router.post('/api/documentos', async (req, res) => {
  try {
    const { paso1ID, documentos, usuarioID } = req.body;

    // Validación
    if (!paso1ID) {
      return res.status(400).json({
        success: false,
        error: 'paso1ID es requerido'
      });
    }

    if (!documentos || documentos.length === 0) {
      return res.json({
        success: true,
        mensaje: 'No hay documentos para guardar'
      });
    }

    const request = pool.request();
    let totalSize = 0;

    // 1. Guardar cada archivo
    for (const doc of documentos) {
      await request
        .input('Paso1ID', sql.Int, paso1ID)
        .input('NombreArchivo', sql.NVarChar, doc.nombre)
        .input('TipoArchivo', sql.NVarChar, doc.tipo || 'documento')
        .input('Tamanio', sql.Int, doc.tamaño || 0)
        .input('ContenidoBase64', sql.NVarChar(sql.MAX), doc.contenido || null)
        .input('UsuarioId', sql.Int, usuarioID)
        .query(`
          INSERT INTO Archivos (Paso1ID, NombreArchivo, TipoArchivo, Tamanio, ContenidoBase64, UsuarioId)
          VALUES (@Paso1ID, @NombreArchivo, @TipoArchivo, @Tamanio, @ContenidoBase64, @UsuarioId)
        `);
      totalSize += doc.tamaño || 0;
    }

    // 2. Crear registro en ContenedoresPaso3 (marca como completado)
    await request
      .input('Paso1ID', sql.Int, paso1ID)
      .input('CantidadArchivos', sql.Int, documentos.length)
      .input('TamanioTotal', sql.BigInt, totalSize)
      .input('UsuarioID', sql.Int, usuarioID)
      .query(`
        INSERT INTO ContenedoresPaso3 (Paso1ID, CantidadArchivos, TamanioTotal, UsuarioResponsableID)
        VALUES (@Paso1ID, @CantidadArchivos, @TamanioTotal, @UsuarioID)
      `);

    // 3. AUTOMÁTICAMENTE cambiar Status a Completado y archivar
    await request
      .input('Paso1ID', sql.Int, paso1ID)
      .query(`
        UPDATE ContenedoresPaso1
        SET Status = 'Completado',
            FechaCompletado = GETDATE(),
            Activo = 0
        WHERE Paso1ID = @Paso1ID
      `);

    res.json({
      success: true,
      mensaje: `${documentos.length} documentos guardados. Contenedor completado y archivado.`,
      paso3Completado: true
    });

  } catch (error) {
    console.error('Error guardando documentos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

---

## 💾 Cambios en el Frontend

### 1. **AgregarContenedor.jsx**
```javascript
// En handleSave Paso 3 - YA ESTÁ ACTUALIZADO
const paso1IdFinal = paso1IDState || paso1ID;
if (!paso1IdFinal) {
  alert('[ALERTA] Error: No se encontró el ID del contenedor');
  return;
}

// El status cambio automáticamente en el backend
// No necesita cambio aquí
```

### 2. **Contenedores.jsx**
```javascript
// La lista "En proceso" filtra solo Activo=true
// Estos desaparecerán automáticamente cuando Status='Completado'
const cargarContenedores = async () => {
  const response = await api.obtenerTodosLosContenedores();
  // Filtra solo activos (Activo=true = En proceso)
  const activos = response.filter(c => c.Activo === true);
  setContenedores(activos);
};
```

### 3. **Archivo.jsx**
```javascript
// La lista "Archivo" filtra solo Activo=false
const cargarContenedores = async () => {
  const response = await api.obtenerTodosLosContenedores();
  // Filtra solo archivados (Activo=false = Completados)
  const archivados = response.filter(c => !c.Activo); // o c.Activo === false
  setContenedores(archivados);
};
```

---

## 📄 Generación de PDF (Próximo paso)

### Endpoint: GET /api/contenedores/:id/pdf
```javascript
router.get('/api/contenedores/:id/pdf', async (req, res) => {
  try {
    const paso1ID = req.params.id;
    
    // 1. Obtener todos los datos del contenedor
    const paso1 = await obtenerPaso1(paso1ID);
    const paso2 = await obtenerPaso2(paso1ID);
    const archivos = await obtenerArchivos(paso1ID);

    // 2. Generar PDF con pdfkit o similar:
    // - Página 1-2: Datos Paso 1
    // - Página 3: Datos Paso 2 + Firma
    // - Página 4-5: Imágenes/PDFs del Paso 3

    // 3. Enviar PDF al cliente
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="contenedor_${paso1ID}.pdf"`);
    // ... generar y enviar PDF
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## ✅ Checklist de Migración

- [ ] Ejecutar script SQL para agregar columnas a ContenedoresPaso1
- [ ] Ejecutar script SQL para simplificar ContenedoresPaso3
- [ ] Actualizar endpoint POST /api/documentos (código arriba)
- [ ] Verificar que Contenedores.jsx filtra correctamente (Activo=true)
- [ ] Verificar que Archivo.jsx filtra correctamente (Activo=false)
- [ ] Probar flujo completo: Paso 1 → Paso 2 → Paso 3 → Auto-completa y archiva
- [ ] Implementar endpoint para generar PDF (cuando sea necesario)

---

## 🧪 Prueba Rápida

```
1. Crear Paso 1: Llena datos, guarda → Status='En proceso'
2. Crear Paso 2: Llena inspección → Status sigue 'En proceso'
3. Crear Paso 3: Sube documentos, guarda → Status='Completado' + Activo=0
4. Verificar: Desaparece de "En proceso", aparece en "Archivo"
```

---

## 📝 Notas

- El campo `Status` se gestiona **automáticamente** en el backend
- El usuario **NO puede** cambiar Status manualmente
- Al completar Paso 3, el contenedor pasa automáticamente a archivo
- Los datos nunca se eliminan, solo se marcan como archivados (Activo=0)
