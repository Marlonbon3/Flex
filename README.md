# 🏗️ FLEX-WEBAPP

Aplicación web para gestión de contenedores, trailers y documentación.

## 🚀 Instalación rápida

**👉 Lee el archivo `SETUP_PASO_A_PASO.md` para instrucciones completas**

### Resumen:
1. Crea la BD en SQL Server (run: `database/ESTRUCTURA_BD_V2.sql`)
2. Configura `.env` con tus datos de conexión
3. Instala: `npm install`
4. Backend: `node src/server.js`
5. Frontend: `npm run dev`

## 📁 Estructura del proyecto

```
src/
  ├── components/      # Componentes React
  ├── api/            # Backend y rutas
  ├── services/       # Llamadas a API
  ├── styles/         # Estilos CSS
  ├── utils/          # Utilidades (PDF, Excel)
  ├── server.js       # Servidor Express
  └── main.jsx        # Punto de entrada
database/
  └── ESTRUCTURA_BD_V2.sql  # Script de la BD
```

## ⚙️ Tecnologías

- **Frontend**: Vite + React
- **Backend**: Express.js
- **BD**: SQL Server
- **PDF**: jsPDF + html2canvas
- **Excel**: xlsx

## 🔗 URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 📖 Documentación

- **SETUP_PASO_A_PASO.md** - Guía completa de instalación

