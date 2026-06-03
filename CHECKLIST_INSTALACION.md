# ✅ CHECKLIST DE INSTALACIÓN PARA LOS COMPAÑEROS

## ANTES DE EMPEZAR
- [ ] Tienes SQL Server Express instalado
- [ ] Tienes Node.js LTS instalado (verifica: `node --version`)
- [ ] Tienes acceso de administrador a la BD

## PASO 1: Base de Datos (5 minutos)
- [ ] Abre SQL Server Management Studio
- [ ] Crea una BD nueva llamada: **`FlexWebApp`**
- [ ] Abre el archivo: `database/ESTRUCTURA_BD_V2.sql`
- [ ] Ejecuta el script completo (Ctrl+Shift+E o botón Execute)
- [ ] Verifica que se crearon las tablas sin errores

## PASO 2: Configuración (2 minutos)
- [ ] Abre el archivo `.env` en la raíz del proyecto
- [ ] Actualiza estos valores:
  ```
  DB_SERVER=TU_COMPUTADORA\SQLEXPRESS
  DB_USER=sa
  DB_PASSWORD=TU_CONTRASEÑA
  DB_NAME=FlexWebApp
  ```
- [ ] Para saber tu nombre de PC, abre CMD y escribe: `hostname`

## PASO 3: Instalar dependencias (5-10 minutos)
- [ ] Abre PowerShell en la carpeta del proyecto
- [ ] Ejecuta: `npm install`
- [ ] Si hay errores, intenta: `npm install --legacy-peer-deps`

## PASO 4: Iniciar el servidor (2 minutos)
En la misma terminal:
- [ ] Ejecuta: `node src/server.js`
- [ ] Deberías ver: `✓ Conectado a SQL Server exitosamente`
- [ ] Si ves error, el problema está en el `.env` → revisa PASO 2

## PASO 5: Iniciar el frontend (2 minutos)
En una NUEVA terminal en la carpeta del proyecto:
- [ ] Ejecuta: `npm run dev`
- [ ] Deberías ver: `http://localhost:5173/`

## PASO 6: Verificar que todo funciona (1 minuto)
- [ ] Abre el navegador: http://localhost:5173
- [ ] Deberías ver la pantalla de LOGIN
- [ ] Abre la consola (F12) y verifica que no hay errores de conexión

## ⚠️ SI ALGO NO FUNCIONA

### Error: "Error conectando a SQL Server"
→ El problema es el `.env`
1. Verifica que `DB_SERVER` es correcto (escribe `hostname` en CMD)
2. Verifica que la contraseña es correcta
3. Verifica que la BD `FlexWebApp` existe

### Error: "Cannot find module 'mssql'"
→ Las dependencias no se instalaron bien
1. Abre PowerShell como Administrador
2. Ejecuta: `npm install --legacy-peer-deps`

### El frontend no se ve en http://localhost:5173
→ El backend no está corriendo
1. Verifica que ejecutaste `node src/server.js` en otra terminal
2. Verifica que no hay errores de conexión a BD

### Error: "Port 5000 already in use"
→ Otro proceso está usando el puerto
1. Abre CMD
2. Escribe: `netstat -ano | findstr :5000`
3. Mata el proceso o cambia el puerto en `.env`

## 🎯 Objetivo final

Deberías tener **2 terminales abiertas**:
1. Terminal 1: `node src/server.js` (Backend corriendo)
2. Terminal 2: `npm run dev` (Frontend corriendo)

Y ver la aplicación en: http://localhost:5173

---

## 📞 Dudas frecuentes

**P: ¿Qué es el `.env`?**
R: Es un archivo de configuración que guarda datos sensibles como contraseñas. **NO se sube a GitHub** por seguridad.

**P: ¿Tengo que crear la BD yo o viene creada?**
R: Tienes que crearla tú. Es una BD vacía. El script `ESTRUCTURA_BD_V2.sql` crea todas las tablas.

**P: ¿Por qué me pide la contraseña del usuario `sa`?**
R: Es el usuario administrador de SQL Server. Si no la conoces, pregunta a quien instaló SQL Server.

**P: ¿Puedo cambiar el puerto 5000?**
R: Sí, pero también tienes que cambiar la URL en el frontend (`FRONTEND_URL` en `.env`).

---

## 💡 Pro Tips

- Si la terminal está lenta, cierra ella misma y abre una nueva
- Siempre ejecuta `npm install` como la primera instalación
- Si cambias algo en `.env`, reinicia el servidor backend
- Los archivos CSS/React se recargan automáticamente (no necesitas reiniciar)

---

**¿Todo funciona? 🎉 ¡Felicidades! Ya puedes empezar a trabajar en el proyecto.**
