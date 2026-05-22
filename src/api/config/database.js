// ====================================================================
// ALTERNATIVA: Si npm no funciona, aquí va la solución
// Guardar como: src/api/config/database.js
// ====================================================================

const sql = require('mssql');
require('dotenv').config();

// Configuración de conexión a SQL Server Local
const config = {
  server: process.env.DB_SERVER || 'MSI\\SQLEXPRESS',
  database: process.env.DB_NAME || 'FlexWebApp',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'Flex@2026'
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

pool.connect(err => {
  if (err) {
    console.error('❌ Error conectando a SQL Server:', err);
    process.exit(1);
  }
  console.log('✓ Conectado a SQL Server exitosamente');
});

module.exports = pool;
