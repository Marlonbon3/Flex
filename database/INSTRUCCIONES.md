# 📚 GUÍA COMPLETA - BASE DE DATOS FLEX (SQL Server Express)

## PASO 1: EJECUTAR SCRIPT SQL EN SSMS

### 1.1 Abrir SSMS
- Inicia SQL Server Management Studio
- Conecta con: `MSSQLEXPRESS`
- Autenticación: **Windows** (ya estás logueado como MSJalero)
- Click en **Conectar**

### 1.2 Crear la BD y tablas
1. En SSMS, ya estás conectado a MSSQLEXPRESS
2. Abre una nueva consulta (New Query)
3. Copia TODO el contenido de: `database/script_base_datos.sql`
4. Pégalo en SSMS
5. Presiona **F5** o click en "Execute"
6. Deberías ver: "Base de datos creada exitosamente"

### 1.3 Verificar que todo se creó
En SSMS, en el árbol de carpetas:
```
Databases
  └── FlexWebApp
      ├── Tables
      │   ├── Usuarios ✓
      │   ├── Contenedores ✓
      │   ├── InspeccionesTrailer ✓
      │   ├── Documentos ✓
      │   ├── ContenedoresPasos ✓
      │   └── HistorialCambios ✓
      └── Views (vacío por ahora)
```

---

## PASO 2: CONFIGURAR NODE.JS/EXPRESS

### 2.1 Instalar dependencias
En terminal (en la carpeta del proyecto):
```powershell
npm install express mssql cors dotenv
```
- **express**: Framework web
- **mssql**: Conexión a SQL Server con Autenticación Windows
- **cors**: Permitir peticiones del frontend
- **dotenv**: Cargar variables desde .env

### 2.2 Crear estructura de carpetas
```
Flex-WebApp/
  ├── src/
  │   ├── api/
  │   │   ├── config/
  │   │   │   └── database.js          (Copiar de CONEXION_NODEJS.js)
  │   │   └── routes/
  │   │       └── contenedores.js      (Copiar de CONEXION_NODEJS.js)
  │   └── server.js                    (Copiar de CONEXION_NODEJS.js)
  ├── .env                             (Crear archivo)
  └── package.json
```

### 2.3 Crear archivo .env
Crear `Flex-WebApp/.env`:
```
DB_SERVER=MSSQLEXPRESS
DB_USER=MSJalero
DB_PASSWORD=  (dejar vacío - usa Autenticación Windows)
DB_NAME=FlexWebApp
DB_DOMAIN=.
PORT=5000
NODE_ENV=development
```

### 2.4 Actualizar database.js
Modificar la sección de configuración para leer del .env (con Autenticación Windows):

```javascript
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  authentication: {
    type: 'ntlm',
    options: {
      userName: process.env.DB_USER,
      domain: process.env.DB_DOMAIN || '.'
    }
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableKeepAlive: true
  }
};
```

---

## PASO 3: CONECTAR REACT CON BACKEND

### 3.1 Crear servicio API en React
Crear `src/services/api.js`:

```javascript
const API_URL = 'http://localhost:5000/api';

// Guardar Paso 1
export const guardarPaso1 = async (formData, usuarioID) => {
  const response = await fetch(`${API_URL}/contenedores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...formData, usuarioID })
  });
  return response.json();
};

// Guardar Paso 2 (Inspección + Firma)
export const guardarPaso2 = async (inspeccionData, usuarioID) => {
  const response = await fetch(`${API_URL}/inspeccion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...inspeccionData, usuarioID })
  });
  return response.json();
};

// Guardar Paso 3 (Documentos)
export const guardarPaso3 = async (contenedorID, archivos, usuarioID) => {
  const documentos = archivos.map(file => ({
    nombre: file.name,
    tipo: file.type,
    tamaño: file.size,
    ruta: `/uploads/${file.name}`
  }));
  
  const response = await fetch(`${API_URL}/documentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contenedorID, documentos, usuarioID })
  });
  return response.json();
};

// Obtener contenedor completo
export const obtenerContenedor = async (id) => {
  const response = await fetch(`${API_URL}/contenedores/${id}`);
  return response.json();
};
```

### 3.2 Actualizar AgregarContenedor.jsx
En la función `handleSave()` del componente:

```javascript
import * as api from '../services/api';

const handleSave = async () => {
  try {
    const usuarioID = 1; // Por ahora hardcodeado, luego desde contexto

    if (currentStep === 1) {
      const result = await api.guardarPaso1(formData, usuarioID);
      if (result.success) {
        alert('✓ Paso 1 guardado en BD');
        window.contenedorID = result.contenedorID; // Guardar ID global
      }
    } else if (currentStep === 2) {
      const result = await api.guardarPaso2({
        contenedorID: window.contenedorID,
        cajaTrailer: formData.cajaTrailer,
        placas: formData.placas,
        estado: formData.estado,
        fechaLlegada: formData.fechaLlegada,
        turno: formData.turno,
        sellos: formData.sellos,
        rampa: formData.rampa,
        horaRegistro: formData.horaRegistro,
        totalPallets: formData.totalPallets,
        longitudContenedor: formData.longitudContenedor,
        origen: formData.origen,
        empresas: formData.empresas,
        responsableDescarga: formData.responsableDescarga,
        firmaResponsable: formData.firmaResponsable,
        condiciones: formData.condiciones
      }, usuarioID);
      
      if (result.success) {
        alert('✓ Paso 2 guardado en BD');
      }
    } else if (currentStep === 3) {
      const result = await api.guardarPaso3(
        window.contenedorID,
        attachments,
        usuarioID
      );
      
      if (result.success) {
        alert('✓ Documentos guardados en BD');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error guardando datos: ' + error.message);
  }
};
```

---

## PASO 4: EJECUTAR APLICACIÓN

### 4.1 Terminal 1: Backend
```powershell
cd Flex-WebApp
node src/server.js
```
Deberías ver:
```
✓ Servidor ejecutándose en puerto 5000
✓ Base de datos: FlexWebApp
✓ SQL Server: MSSQLEXPRESS
✓ Usuario: MSJalero (Autenticación Windows)
✓ Conectado a SQL Server exitosamente
```

### 4.2 Terminal 2: Frontend
```powershell
npm run dev
```
O si usas Vite:
```powershell
npx vite
```

### 4.3 Abrir en navegador
```
http://localhost:5173  (Vite)
o
http://localhost:3000  (si usas otro puerto)
```

---

## PASO 5: VERIFICAR DATOS EN BD

### 5.1 Ver contenedores guardados
En SSMS, ejecuta:
```sql
SELECT * FROM Contenedores;
SELECT * FROM InspeccionesTrailer;
SELECT * FROM Documentos;
```

### 5.2 Ver estructura completa
```sql
SELECT 
  c.ContenedorID,
  c.TrailerNo,
  c.Estado,
  c.FechaCreacion,
  u.NombreCompleto,
  (SELECT COUNT(*) FROM InspeccionesTrailer WHERE ContenedorID = c.ContenedorID) as TotalInspecciones,
  (SELECT COUNT(*) FROM Documentos WHERE ContenedorID = c.ContenedorID) as TotalDocumentos
FROM Contenedores c
LEFT JOIN Usuarios u ON c.UsuarioCreadorID = u.UsuarioID
ORDER BY c.FechaCreacion DESC;
```

---

## SOLUCIÓN DE PROBLEMAS

### ❌ "Cannot connect to server"
- Verificar que SQL Server Express esté corriendo
- Ir a Servicios Windows (services.msc)
- Buscar "SQL Server (SQLEXPRESS)" y que esté "Iniciado"
- Verificar que estés usando "Autenticación de Windows" (no SQL Server Authentication)

### ❌ "Authentication failed for user 'MSJalero'"
- Verificar que en database.js uses:
  ```javascript
  authentication: {
    type: 'ntlm',
    options: {
      userName: 'MSJalero',
      domain: '.'
    }
  }
  ```

---

## ESTRUCTURA DE DATOS GUARDADOS

### Ejemplo Paso 1 - Contenedor
```json
{
  "ContenedorID": 1,
  "TrailerNo": "TCN2194580",
  "TrailerType": "Flatbed",
  "PoNo": "PO-123456",
  "Estado": "En Progreso",
  "FechaCreacion": "2026-05-21T12:00:00Z"
}
```

### Ejemplo Paso 2 - Inspección
```json
{
  "InspeccionID": 1,
  "ContenedorID": 1,
  "CajaTrailer": "TCN2194580",
  "FirmaResponsable": "data:image/png;base64,iVBORw0KG...",
  "Cond1": 1,
  "Cond2": 1,
  ...
}
```

### Ejemplo Paso 3 - Documento
```json
{
  "DocumentoID": 1,
  "ContenedorID": 1,
  "NombreArchivo": "IMG_20260521.jpg",
  "TamañoKB": 2048,
  "FechaSubida": "2026-05-21T12:05:00Z"
}
```

---

## SIGUIENTES PASOS

1. ✅ Ejecutar script SQL
2. ✅ Configurar Node.js/Express
3. ✅ Conectar React con API
4. ⏳ Agregar autenticación (Login)
5. ⏳ Guardar archivos en servidor (upload)
6. ⏳ Crear reportes/dashboards
7. ⏳ Desplegar a producción

---

## RECURSOS ÚTILES

- SQL Server Express: https://www.microsoft.com/es-es/sql-server/sql-server-express
- SSMS: https://learn.microsoft.com/en-us/sql/ssms
- mssql npm: https://github.com/tediousjs/node-mssql
- Express.js: https://expressjs.com/

---

**¿Preguntas? Usa Copilot en SSMS para ayuda SQL, o Copilot en VS Code para JavaScript/Node.js**
