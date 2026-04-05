@echo off
cd /d "c:\Users\Moreno Luis\Desktop\backup\system_gestion_tarea\proyecto"

echo.
echo =========================================
echo  INICIANDO SISTEMA
echo =========================================
echo.

echo ✓ Base de datos preservada: database.sqlite
echo ✓ Sesiones preservadas: sessions.sqlite

echo.
echo ✓ Iniciando servidor...
echo.

node app.js

pause
