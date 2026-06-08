// ====================================================================
// ALTERNATIVA: Si npm no funciona, aquí va la solución
// Guardar como: src/api/config/database.js
// ====================================================================

const sql = require('mssql');
require('dotenv').config();

// Configuración de conexión a SQL Server con usuario sa
const config = {
  server: process.env.DB_SERVER || 'MSI\\SQLEXPRESS',
  database: process.env.DB_NAME || 'FlexWebApp',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'Admin123'
    }
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableKeepAlive: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  }
};

const pool = new sql.ConnectionPool(config);

let connectionAttempts = 0;
const maxRetries = 3;

const connectPool = async () => {
  try {
    connectionAttempts++;
    console.log(`[${new Date().toISOString()}] Intentando conectar a BD (intento ${connectionAttempts}/${maxRetries})...`);
    
    await pool.connect();
    console.log('✓ Conectado a SQL Server exitosamente');
  } catch (err) {
    console.error('❌ Error conectando a SQL Server:', err.message);
    
    if (connectionAttempts < maxRetries) {
      console.log(`Reintentar en 3 segundos...`);
      setTimeout(connectPool, 3000);
    } else {
      console.error('❌ No se pudo conectar después de ' + maxRetries + ' intentos');
      process.exit(1);
    }
  }
};

connectPool();

// Manejo de errores del pool
pool.on('error', err => {
  console.error('❌ Error en el pool de conexión:', err);
});

module.exports = pool;
