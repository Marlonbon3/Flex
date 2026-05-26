# 📋 GUÍA DE MIGRACIÓN - Nueva Estructura de BD

## 🔴 IMPORTANTE: Antes de empezar

> **Haz un backup de tu base de datos actual** (por si acaso):
> ```sql
> BACKUP DATABASE FlexWebApp TO DISK = 'C:\backup\FlexWebApp_backup.bak'
> ```

---

## 📝 Paso 1: Ejecutar el Script SQL

1. Abre **SQL Server Management Studio**
2. Conéctate a tu servidor SQL
3. Abre el archivo: `database/NUEVA_ESTRUCTURA_BD.sql`
4. Ejecuta todo el script (F5)

✅ Debería crearte 6 tablas nuevas sin errores

---

## 🔄 Paso 2: Migrar datos antiguos (OPCIONAL)

Si quieres mantener los datos antiguos, ejecuta esto:

```sql
-- Migrar datos de Contenedores antigua a ContenedoresPaso1
INSERT INTO ContenedoresPaso1 (
  TrailerNo, TrailerType, SeaContainerType, UsoEmbarques, PortOfEntry, Comments,
  QtyPallets, EmptyDate, SealSanLuis, DepartureDate, SealYuma, AgingA,
  ActualDate, ItemType, Aging, BookingNo, DateExitPort, PoNo, UsuarioCreadorID, FechaCreacion
)
SELECT 
  TrailerNo, TrailerType, SeaContainerType, UsoEmbarques, PortOfEntry, Comments,
  QtyPallets, EmptyDate, SealSanLuis, DepartureDate, SealYuma, AgingA,
  ActualDate, ItemType, Aging, BookingNo, DateExitPort, PoNo, UsuarioCreadorID, FechaCreacion
FROM Contenedores;

-- Migrar datos de InspeccionesTrailer a ContenedoresPaso2
INSERT INTO ContenedoresPaso2 (
  Paso1ID, CajaTrailer, Placas, Estado, FechaLlegada, Turno,
  Sellos, Rampa, HoraRegistro, TotalPallets, LongitudContenedor, Origen,
  Empresas, ResponsableDescarga, FirmaResponsable,
  Cond1, Cond2, Cond3, Cond4, Cond5, Cond6, Cond7, Cond8, UsuarioInspectorID, FechaCreacion
)
SELECT 
  ContenedorID, CajaTrailer, Placas, Estado, FechaLlegada, Turno,
  Sellos, Rampa, HoraRegistro, TotalPallets, LongitudContenedor, Origen,
  Empresas, ResponsableDescarga, FirmaResponsable,
  Cond1, Cond2, Cond3, Cond4, Cond5, Cond6, Cond7, Cond8, UsuarioInspectorID, FechaCreacion
FROM InspeccionesTrailer;
```

---

## 🖥️ Paso 3: Actualizar el Backend

1. Abre: `src/api/routes/contenedores.js`
2. **REEMPLAZA TODO** con el contenido de: `src/api/routes/CONTENEDORES_ACTUALIZADO.js`
3. Guarda el archivo

### Cambios principales:
- ✅ Tabla `Contenedores` → `ContenedoresPaso1`
- ✅ Tabla `InspeccionesTrailer` → `ContenedoresPaso2`
- ✅ Nueva tabla `ContenedoresPaso3`
- ✅ **ARREGLADO:** Error de `HoraRegistro` (now converts "14:30" to "14:30:00")
- ✅ Nuevas rutas: `/api/archivos`, `/api/entrega-turno`, `/api/paso3`

---

## ⚙️ Paso 4: Actualizar el Frontend

### En `AgregarContenedor.jsx`:

**Cambio 1: Usar `paso1ID` en lugar de `contenedorID`**

Busca:
```javascript
const [currentStep, setCurrentStep] = useState(initialContenedorID ? 2 : 1);
```

Reemplaza por:
```javascript
const [currentStep, setCurrentStep] = useState(initialPaso1ID ? 2 : 1);
```

**Cambio 2: En la función `handleNextStep` (Paso 1)**

Busca:
```javascript
const res = await api.guardarPaso1(formData, usuarioID);
if (res.success) {
  setContenedorID(res.id);
```

Reemplaza por:
```javascript
const res = await api.guardarPaso1(formData, usuarioID);
if (res.success) {
  setPaso1ID(res.paso1ID);  // ← CAMBIO AQUÍ
```

**Cambio 3: En `api.js`, actualiza la función `guardarPaso1`**

```javascript
export const guardarPaso1 = async (formData, usuarioID = 1) => {
  try {
    const payload = {
      ...formData,
      usuarioID
    };

    const response = await fetch(`${API_BASE_URL}/contenedores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error guardando Paso 1');
    }

    return { success: true, paso1ID: data.paso1ID };  // ← CAMBIO AQUÍ
  } catch (error) {
    console.error('Error Paso 1:', error);
    return { success: false, error: error.message };
  }
};
```

**Cambio 4: En `api.js`, actualiza la función `guardarPaso2`**

Busca donde envía `contenedorID` y cambia a `paso1ID`:

```javascript
export const guardarPaso2 = async (formData, paso1ID, usuarioID = 1) => {  // ← NUEVO PARÁMETRO
  try {
    const payload = {
      ...formData,
      paso1ID,  // ← CAMBIO AQUÍ
      usuarioID
    };

    const response = await fetch(`${API_BASE_URL}/inspeccion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error guardando Paso 2');
    }

    return { success: true, paso2ID: data.paso2ID };  // ← CAMBIO AQUÍ
  } catch (error) {
    console.error('Error Paso 2:', error);
    return { success: false, error: error.message };
  }
};
```

---

## ✅ Verificación Final

1. **En terminal, con hotspot conectado**, ejecuta:
   ```bash
   npm run dev
   ```

2. **En otra terminal**, reinicia el servidor backend:
   ```bash
   node src/server.js
   ```

3. Abre http://localhost:5173

4. **Prueba Paso 1:**
   - Llena formulario
   - Presiona "Siguiente"
   - Debe guardarse sin errores ✅

5. **Prueba Paso 2:**
   - Llena formulario
   - Ingresa hora (ej: 14:30)
   - Presiona "Siguiente"
   - Debe guardarse **sin error de "invalid time"** ✅

6. **Comprueba en BD:**
   ```sql
   SELECT * FROM ContenedoresPaso1;
   SELECT * FROM ContenedoresPaso2;
   ```

---

## 🗑️ Después de verificar que todo funciona

Cuando confirmes que todo está correcto, ejecuta esto para limpiar:

```sql
-- BORRAR TABLAS ANTIGUAS (hazlo solo después de verificar)
DROP TABLE IF EXISTS InspeccionesTrailer;
DROP TABLE IF EXISTS ContenedoresPasos;
DROP TABLE IF EXISTS Documentos;
DROP TABLE IF EXISTS HistorialCambios;
DROP TABLE IF EXISTS Contenedores;

PRINT '✓ Tablas antiguas eliminadas';
```

---

## 🆘 Si algo sale mal

### Error: "Paso1ID" no existe
- Asegúrate de haber ejecutado el script SQL completo
- Verifica que las nuevas tablas existan en la BD

### Error: "invalid time" en Paso 2
- Verifica que estés usando el nuevo código en `contenedores.js` que convierte la hora
- Formato esperado: "14:30" o "14:30:00"

### Error de conexión a BD
- Verifica que el servidor backend esté corriendo: `node src/server.js`
- Comprueba que estés en hotspot (no en red corporativa)

---

## 📞 Resumen de cambios

| Antes | Después |
|-------|---------|
| `Contenedores` | `ContenedoresPaso1` |
| `InspeccionesTrailer` | `ContenedoresPaso2` |
| N/A | `ContenedoresPaso3` ← Nueva |
| N/A | `Archivos` ← Nueva |
| N/A | `Reportes` ← Nueva |
| N/A | `EntregaDeTurno` ← Nueva |
| `contenedorID` | `paso1ID` |
| Error en HoraRegistro | ✅ Arreglado |

---

¡Listo! Si todo sale bien, tendrás una estructura mucho más organizada y escalable. 🚀
