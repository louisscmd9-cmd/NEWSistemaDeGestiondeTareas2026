@echo off
REM Eliminar base de datos para hacer prueba limpia con migraciones
cd /d "%~dp0"

if exist database.sqlite (
    del database.sqlite
    echo ✓ Base de datos eliminada
)

if exist sessions.sqlite (
    del sessions.sqlite
    echo ✓ Sesiones eliminadas
)

echo.
echo ✓ Lista para iniciar servidor con migraciones limpias
echo.
echo Iniciando servidor...
echo.

node app.js
pause
