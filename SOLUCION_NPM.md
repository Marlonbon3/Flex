# ====================================================================
# SOLUCIÓN ALTERNATIVA - Si npm sigue sin funcionar
# ====================================================================

## 🔴 El Problema
Tu red corporativa/firewall está bloqueando npm registry.npmjs.org (Error 403)

## ✅ SOLUCIONES (en orden de facilidad):

### 1. OPCIÓN RECOMENDADA: Usar otra red 📶
```powershell
# Desconectate de la red actual
# Usa un hotspot personal del móvil
# Luego ejecuta:
npm install express mssql cors dotenv
```

### 2. OPCIÓN: Instalar desde Command Prompt (en lugar de PowerShell)
```cmd
# Abre Command Prompt (cmd.exe) como Administrador
# Navega al proyecto:
cd C:\Users\elerv\Desktop\ESTADÍAS FLEX\Flex-WebApp

# Intenta instalar:
npm install express mssql cors dotenv
```

### 3. OPCIÓN: Limpiar npm completamente y reiniciar
```powershell
# 1. Eliminar node_modules si existe
rmdir node_modules -Force -Recurse

# 2. Limpiar npm cache
npm cache clean --force

# 3. Resetear npm config
npm config reset

# 4. Configurar de nuevo
npm config set strict-ssl false

# 5. Instalar paquetes
npm install express mssql cors dotenv
```

### 4. OPCIÓN: Usar un registry espejo (China)
```powershell
npm config set registry https://registry.npmmirror.com
npm install express mssql cors dotenv
```

### 5. OPCIÓN: Descargar manualmente desde otra máquina
- En una máquina con internet:
  - `npm install express mssql cors dotenv`
  - Copiar carpeta `node_modules/` 
  - Pegar en tu proyecto

### 6. OPCIÓN: Usar Node.js Portable (sin npm)
- Descargar desde: https://nodejs.org/download/release/
- Usar versión "Portable" que incluye paquetes preinstalados

## 💡 Lo que ya hicimos:
✅ Creé archivo database.js en src/api/config/
✅ Los archivos SQL están listos
✅ Las instrucciones están actualizadas

## ⏭️ Una vez instales npm, ejecuta:
```powershell
npm install express mssql cors dotenv
```

## 📞 Si NADA funciona:
- Contacta a TI de tu empresa para que permita npm registry
- O intenta en casa con internet personal
