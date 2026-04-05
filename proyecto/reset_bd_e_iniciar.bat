@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

REM Eliminar archivos de BD
if exist database.sqlite del database.sqlite
if exist sessions.sqlite del sessions.sqlite

echo ✓ Base de datos eliminada
echo.
echo Cargando datos de prueba (usuarios)...
echo.

node seed.js

echo.
echo Cargando tareas de prueba (múltiples fechas)...
echo.

node seed_tareas.js

echo.
echo Iniciando servidor...
echo.

node app.js
