@echo off
REM ====================================================================
REM Script para instalar dependencias de Flex-WebApp
REM Ejecutar como Administrador
REM ====================================================================

echo.
echo ====================================================
echo Instalando dependencias de Flex-WebApp...
echo ====================================================
echo.

REM Limpiar cache
echo Limpiando npm cache...
npm cache clean --force

REM Resetear config
echo Reseteando configuración npm...
npm config set registry https://registry.npmjs.org/
npm config set strict-ssl false
npm config set https-proxy null
npm config set proxy null

REM Instalar paquetes
echo.
echo Instalando paquetes: express, mssql, cors, dotenv...
npm install express mssql cors dotenv --legacy-peer-deps --no-optional

REM Verificar instalación
echo.
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================
    echo ✓ INSTALACIÓN EXITOSA
    echo ====================================================
    echo.
    echo Ahora ejecuta:
    echo   npm run dev
    echo.
) else (
    echo.
    echo ====================================================
    echo ✗ ERROR EN LA INSTALACIÓN
    echo ====================================================
    echo.
    echo Soluciones:
    echo 1. Intenta desde Command Prompt (cmd.exe)
    echo 2. Desconectate de la red corporativa
    echo 3. Usa un hotspot personal del móvil
    echo 4. Contacta a TI para permitir npm registry
    echo.
)

pause
