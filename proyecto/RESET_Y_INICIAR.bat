#!/bin/bash
@echo off
REM Limpiar y reiniciar completamente

echo.
echo ========================================
echo  LIMPIANDO Y REINICIANDO SISTEMA
echo ========================================
echo.

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
echo INICIANDO SERVIDOR CON MIGRACIONES LIMPIAS...
echo.

node app.js

pause
