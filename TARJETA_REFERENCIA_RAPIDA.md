# 🎯 Tarjeta de Referencia Rápida - v2.0

## 🏃 En 3 Pasos

### 1️⃣ SQL (3 min)
```powershell
cd database
sqlcmd -S MSI\SQLEXPRESS -d FlexWebApp -i SCRIPT_MIGRACION_STATUS.sql
```

### 2️⃣ Frontend (1 min)
- Ctrl+Shift+R en navegador

### 3️⃣ Test (5 min)
- Crea Paso 1 → Siguiente → Paso 2 → Siguiente → Paso 3 → Guardar
- ✅ Debe aparecer en "Archivo"

---

## 📊 Base de Datos

### Nuevas Columnas en ContenedoresPaso1
```sql
Status NVARCHAR(50) DEFAULT 'En proceso'  -- ← Cambia automáticamente
FechaCompletado DATETIME NULL             -- ← Se establece en Paso 3
```

### Valores Status
- `'En proceso'` → Cuando se crea Paso 1
- `'Completado'` → Cuando se termina Paso 3 (automático)

### Filtrados
```sql
-- "En proceso"
SELECT * FROM ContenedoresPaso1 WHERE Status = 'En proceso' AND Activo = 1

-- "Archivo"
SELECT * FROM ContenedoresPaso1 WHERE Status = 'Completado' AND Activo = 0
```

---

## 🔄 Flujo Automático

```
Paso 3 Guardado
    ↓
POST /api/documentos
    ↓
Backend actualiza:
  • Status = 'Completado'
  • FechaCompletado = NOW()
  • Activo = 0
    ↓
Modal cierra
    ↓
Lista se actualiza
    ↓
Contenedor desaparece de "En proceso"
Contenedor aparece en "Archivo"
```

---

## 🔧 Cambios de Código

### guardarPaso3() - Convierte a Base64
```javascript
const reader = new FileReader();
reader.readAsDataURL(file);  // ← Convierte a Base64
reader.result.split(',')[1]  // ← Extrae solo la parte Base64
```

### POST /api/documentos - Completa automáticamente
```javascript
UPDATE ContenedoresPaso1
SET Status = 'Completado',
    FechaCompletado = GETDATE(),
    Activo = 0
WHERE Paso1ID = @Paso1ID
```

### Filtros Frontend
```javascript
// Contenedores.jsx (En proceso)
filter(c => c.Activo && c.Status === 'En proceso')

// Archivo.jsx (Completados)
filter(c => !c.Activo && c.Status === 'Completado')
```

---

## 🐛 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| Paso 3 no se guarda | F12 → Console → busca erro |
| Contenedor no aparece en Archivo | Verifica Status en BD |
| Modal no cierra | Recarga página (F5) |
| Documentos no se ven | Verifica Archivo en BD |
| Paso 1 no se guarda | Rellena campos requeridos |

---

## 📋 Columnas Relacionadas

### ContenedoresPaso1
```
Paso1ID ← Clave primaria
TrailerNo ← Número de trailer
Status ← 'En proceso' o 'Completado'
FechaCompletado ← Cuándo se completó
Activo ← 1=En proceso, 0=Archivado
FechaCreacion ← Cuándo se creó
```

### Archivos
```
ArchivoID ← Clave primaria
Paso1ID ← Referencia a Paso1 (FK)
NombreArchivo ← Nombre original
TipoArchivo ← MIME type
Tamanio ← En bytes
ContenidoBase64 ← Archivo completo Base64
FechaCreacion ← Cuándo se subió
```

### ContenedoresPaso3
```
Paso3ID ← Clave primaria
Paso1ID ← Referencia única a Paso1 (FK UNIQUE)
CantidadArchivos ← Cuántos se subieron
TamanioTotal ← Suma total en bytes
FechaCompletado ← Cuándo se guardó
```

---

## ✅ Validación de Implementación

```sql
-- Verificar status de último contenedor
SELECT TOP 1 Status, Activo, FechaCompletado 
FROM ContenedoresPaso1 
ORDER BY FechaCreacion DESC;

-- Verificar archivos guardados
SELECT COUNT(*) FROM Archivos 
WHERE ContenidoBase64 IS NOT NULL;

-- Verificar Paso 3 completado
SELECT COUNT(*) FROM ContenedoresPaso3 
WHERE CantidadArchivos > 0;
```

---

## 🔗 Endpoints Clave

### GET /api/contenedores
```
Devuelve: [{ Paso1ID, Status, Activo, ... }]
Filtro Frontend: Status='En proceso' && Activo=true
```

### POST /api/documentos
```
Recibe: { paso1ID, documentos[], usuarioID }
Respuesta: { success: true, paso3Completado: true }
Efecto: Status='Completado', Activo=0
```

---

## 🎨 UI/UX Changes

- "En proceso" → Muestra solo Status='En proceso'
- "Archivo" → Muestra solo Status='Completado'
- Paso 3 → Solo documentos (sin otros campos)
- Modal → Se cierra automáticamente al completar

---

## 📈 Métricas Importantes

- **Tiempo total**: 5-10 minutos por contenedor
- **Pasos automáticos**: Paso 1, Paso 2, Paso 3 (guarda antes de avanzar)
- **Status changes**: 1 (al terminar Paso 3)
- **Documentos guardados**: 1-50 por contenedor
- **Tamaño máximo BD**: ~2GB por archivo en NVARCHAR(MAX)

---

## 🚨 Puntos Críticos

⚠️ **El Status DEBE cambiar automáticamente**
- Si no cambia → Verificar que query UPDATE se ejecutó
- Si no aparece en Archivo → Verificar Activo=0

⚠️ **paso1ID DEBE ser válido**
- Si es NULL → El Paso 1 no se guardó
- Si es 0 → Error de BD

⚠️ **Los archivos DEBEN tener Base64**
- Si ContenidoBase64 es NULL → FileReader falló
- Si sigue siendo NULL en BD → Frontend no envió contenido

---

## 📝 Notas para Futuros Cambios

- Status es **automático** (no editable)
- Activo = 0 también es **automático**
- No modificar FechaCompletado directamente
- Los campos obsoletos de Paso 3 se pueden eliminar opcionalmente
- Para nuevos campos, siempre usar Status = 'En proceso' por defecto

---

## 🔔 Reminders

✅ Ejecutar script SQL  
✅ Recargar navegador  
✅ Probar flujo completo  
✅ Verificar en BD que Status cambió  
✅ Verificar que Activo = 0  

---

**Última actualización**: 26 de Mayo de 2026  
**Versión**: 2.0  
**Estado**: ✅ Producción
