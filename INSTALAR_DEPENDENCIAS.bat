@echo off
cd /d "c:\Users\Moreno Luis\Desktop\backup\system_gestion_tarea\NEWSistemaDeGestiondeTareas2026\proyecto"

echo ====================================
echo INSTALANDO DEPENDENCIAS NPM...
echo ====================================
call npm install

echo.
echo ====================================
echo VERIFICANDO INSTALACION...
echo ====================================
call npm list pg connect-pg-simple

echo.
echo ====================================
echo INSTALACION COMPLETADA!
echo ====================================
pause
