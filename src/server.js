  // ====================================================================
  // SERVIDOR EXPRESS - FLEX-WEBAPP
  // Archivo: src/server.js
  // ====================================================================

  const express = require('express');
  const cors = require('cors');
  require('dotenv').config();

  const app = express();

  // Middlewares
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // CORS - Permitir requests desde frontend
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Rutas API
  const contenedoresRouter = require('./api/routes/contenedores.js');
  app.use(contenedoresRouter);

  // Ruta de salud (para verificar que el servidor está activo)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      message: 'Servidor Flex-WebApp funcionando correctamente'
    });
  });

  // Ruta raíz
  app.get('/', (req, res) => {
    res.json({
      name: 'Flex-WebApp Backend',
      version: '1.0.0',
      description: 'API para gestión de contenedores y trailers',
      endpoints: {
        health: 'GET /api/health',
        crear_contenedor: 'POST /api/contenedores',
        guardar_inspeccion: 'POST /api/inspeccion',
        subir_documentos: 'POST /api/documentos',
        obtener_contenedor: 'GET /api/contenedores/:id'
      }
    });
  });

  // 404 — ruta no encontrada (siempre JSON, nunca HTML)
  app.use((req, res, next) => {
    res.status(404).json({ success: false, error: `Ruta no encontrada: ${req.method} ${req.path}` });
  });

  // Manejo de errores global
  app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Error interno del servidor'
    });
  });

  // Iniciar servidor
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║       ✓ SERVIDOR FLEX-WEBAPP INICIADO EXITOSAMENTE     ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  🚀 Puerto:       ${PORT}`);
    console.log(`  📊 Base de datos: ${process.env.DB_NAME}`);
    console.log(`  🖥️  Servidor:     ${process.env.DB_SERVER || 'MSI\\SQLEXPRESS'}`);
    console.log(`  👤 Usuario:      ${process.env.DB_USER || 'sa'} (SQL Server Auth)`);
    console.log(`  🌐 Frontend:     ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log('');
    console.log('  Endpoints disponibles:');
    console.log('  ├─ GET  /api/health');
    console.log('  ├─ POST /api/contenedores');
    console.log('  ├─ POST /api/inspeccion');
    console.log('  ├─ POST /api/documentos');
    console.log('  └─ GET  /api/contenedores/:id');
    console.log('');
    console.log('  Presiona CTRL+C para detener el servidor');
    console.log('');
  });

  module.exports = app;
