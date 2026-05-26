# 🚀 QUICK START - Implementar v2.0 en 5 Minutos

## ⚡ Paso 1: Actualizar Base de Datos (3 minutos)

### Opción A: Si usas SQL Server Management Studio
1. Abre **SQL Server Management Studio**
2. Conecta a tu servidor: `MSI\SQLEXPRESS`
3. Abre base de datos: `FlexWebApp`
4. Click **File → Open → Open File**
5. Selecciona: `database/SCRIPT_MIGRACION_STATUS.sql`
6. Presiona **F5** para ejecutar

### Opción B: Si usas sqlcmd desde Terminal
```powershell
cd "c:\Users\elerv\Desktop\ESTADÌAS FLEX\Flex-WebApp\database"
sqlcmd -S MSI\SQLEXPRESS -d FlexWebApp -i SCRIPT_MIGRACION_STATUS.sql
```

**Esperado**: 
```
✓ Migración completada exitosamente
✓ Nuevas columnas: Status, FechaCompletado
```

---

## ⚡ Paso 2: Verificar que el código está actualizado

Los archivos ya fueron modificados automáticamente:
- ✅ `src/services/api.js` - guardarPaso3() convierte a Base64
- ✅ `src/api/routes/contenedores.js` - POST /api/documentos completa automáticamente
- ✅ `src/components/AgregarContenedor.jsx` - Cierra modal al completar
- ✅ `src/components/Contenedores.jsx` - Filtra por Status
- ✅ `src/components/Archivo.jsx` - Filtra completados

**No necesitas hacer nada** - Ya está todo actualizado.

---

## ⚡ Paso 3: Recargar y Probar (1-2 minutos)

### 1. Recargar Frontend
- Abre navegador: `http://localhost:5173`
- Presiona **Ctrl+Shift+R** (reload hard cache)

### 2. Login
- Email: tu email habitual
- Password: tu contraseña

### 3. Test Completo

```
📝 PASO 1: Crear contenedor nuevo
├─ Click "Agregar Contenedor"
├─ Rellena: TrailerNo, Type, ContainerType, etc.
├─ Click "Siguiente"
└─ ✅ Se guarda automáticamente

📝 PASO 2: Inspeccionar
├─ Rellena: Placas, Estado, Turno, Hora, etc.
├─ Click "Siguiente"
└─ ✅ Se guarda automáticamente

📝 PASO 3: Documentos
├─ Click cámara o subir archivo
├─ Selecciona 1-3 archivos (JPG, PDF, PNG)
├─ Click "Guardar"
└─ ✅ Debería cerrar modal automáticamente

✅ VERIFICAR EN LISTA:
├─ "En proceso" → Contenedor DESAPARECIÓ
└─ "Archivo" → Contenedor APARECIÓ

✅ CLICK EN ARCHIVO:
└─ Ver todos los datos guardados con fecha
```

---

## 🐛 Si Algo No Funciona

### El documento no se guarda en Paso 3
```
1. Abre F12 → Console
2. Busca error rojo
3. Si dice "paso1ID is null/undefined":
   - El problema es que Paso 1 no se guardó correctamente
   - Intenta de nuevo desde Paso 1

4. Si dice "Cannot insert NULL into Paso1ID":
   - Significa que paso1ID no se pasó al endpoint
   - Recarga página y intenta de nuevo
```

### El contenedor no aparece en Archivo
```
1. Abre DevTools (F12) → Network
2. Busca request GET /api/contenedores
3. Verifica que Status = 'Completado' en la respuesta
4. Si Status sigue 'En proceso':
   - El backend no ejecutó el UPDATE
   - Verifica que el cambio a POST /api/documentos se aplicó
   - Reinicia backend: Ctrl+C en terminal, npm start
```

### No se ve el formulario de Paso 3
```
1. Verifica que Paso 2 se guardó (Click Siguiente)
2. Si el botón "Siguiente" en Paso 2 no funciona:
   - Faltan campos requeridos
   - Rellena todos los campos en Paso 2
3. Intenta F5 en navegador
```

---

## 📊 Verificar en Base de Datos

### Abrir Query en SSMS y ejecutar:

```sql
USE FlexWebApp;

-- Ver últimos 5 contenedores completados
SELECT TOP 5
  Paso1ID,
  TrailerNo,
  Status,
  FechaCompletado,
  Activo,
  FechaCreacion
FROM ContenedoresPaso1
ORDER BY FechaCreacion DESC;

-- Ver documentos subidos
SELECT TOP 10
  ArchivoID,
  Paso1ID,
  NombreArchivo,
  Tamanio,
  FechaCreacion
FROM Archivos
ORDER BY FechaCreacion DESC;

-- Ver Paso 3 completado
SELECT
  Paso3ID,
  Paso1ID,
  CantidadArchivos,
  TamanioTotal,
  FechaCompletado
FROM ContenedoresPaso3
ORDER BY FechaCompletado DESC;
```

---

## 📋 Checklist Final

- [ ] Ejecuté script SQL en BD
- [ ] Recargué frontend (Ctrl+Shift+R)
- [ ] Creé nuevo contenedor (Paso 1 + Paso 2 + Paso 3)
- [ ] El contenedor completado aparece en "Archivo"
- [ ] Los documentos se guardaron correctamente
- [ ] El Status cambió automáticamente a "Completado"

---

## ✅ Si Todo Funciona

¡Felicidades! Tu aplicación v2.0 está lista.

**Ahora los trabajadores podrán**:
1. Llegar contenedor → Llenar Paso 1
2. Inspeccionar → Llenar Paso 2  
3. Escanear documentos → Llenar Paso 3
4. **Automáticamente** se completa y archiva
5. Pueden consultar el archivo completo en la sección "Archivo"

---

## 🔗 Documentación Completa

Para entender todos los detalles, lee:
- `IMPLEMENTACION_COMPLETA_V2.md` - Explicación completa de cambios
- `MIGRACION_BD_V2.md` - Guía de migración detallada
- `ESTRUCTURA_BD_V2.sql` - Schema actualizado

---

**Status**: ✅ Listo para Producción  
**Versión**: 2.0  
**Fecha**: 26 de Mayo de 2026
