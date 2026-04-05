@echo off
cd /d "c:\Users\Moreno Luis\Desktop\backup\system_gestion_tarea\proyecto"

echo.
echo =========================================
echo  REINICIALIZANDO SISTEMA
echo =========================================
echo.

if exist database.sqlite (
    del database.sqlite
    echo ✓ database.sqlite eliminado
)

if exist sessions.sqlite (
    del sessions.sqlite
    echo ✓ sessions.sqlite eliminado
)

echo.
echo ✓ Base de datos limpiada
echo ✓ Iniciando servidor...
echo.

node app.js

pause
