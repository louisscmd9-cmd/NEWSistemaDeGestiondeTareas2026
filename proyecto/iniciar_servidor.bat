@echo off
TITLE Servidor - Sistema de Gestion de Tareas
color 0A

:: Cambiar al directorio exacto donde se encuentra este script
cd /d "%~dp0"

echo ===================================================
echo      Iniciando el Sistema de Gestion de Tareas
echo ===================================================
echo.

:: Instalar dependencias si no existe la carpeta node_modules
if not exist "node_modules\" (
    echo [INFO] Instalando dependencias necesarias por primera vez...
    call npm install
)

echo [INFO] Abriendo el navegador...
start http://localhost:3000

echo [INFO] Iniciando el servidor Express...
node app.js

pause