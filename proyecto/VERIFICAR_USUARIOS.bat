@echo off
cd /d "c:\Users\Moreno Luis\Desktop\backup\system_gestion_tarea\NEWSistemaDeGestiondeTareas2026\proyecto"

echo.
echo ====================================
echo VERIFICANDO USUARIOS EN LA BD
echo ====================================
echo.

node verify-users.js

echo.
pause
