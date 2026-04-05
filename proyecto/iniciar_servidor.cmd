#!/usr/bin/env node

@echo off
setlocal enabledelayedexpansion

REM Script para iniciar el servidor del Sistema de Gestión de Tareas

title Sistema de Gestion de Tareas - Servidor Bloque 9
color 0A

cls

echo.
echo ════════════════════════════════════════════════════════════
echo  SISTEMA DE GESTION DE TAREAS - SERVIDOR BLOQUE 9
echo ════════════════════════════════════════════════════════════
echo.
echo 🟢 Estado: INICIANDO SERVIDOR
echo.
echo ✅ Cambios del Bloque 9 implementados:
echo    • ABM completo de tareas (Crear/Leer/Actualizar/Eliminar)
echo    • Checkbox para tareas recurrentes
echo    • Modal de edición mejorado
echo    • Toggle de recurrencia en tiempo real
echo    • Botones Editar/Eliminar en tabla
echo    • Script de automatización diaria
echo.
echo 📊 Base de Datos:
echo    • Columnas nuevas: id_jefe, recurrente, fecha_creacion
echo    • Foreign keys para integridad
echo    • Índices para rendimiento
echo.
echo 🔐 Seguridad:
echo    • Solo jefe creador puede editar/eliminar
echo    • Solo tareas pendientes pueden modificarse
echo    • Confirmación antes de eliminar
echo    • Validaciones en backend
echo.
echo ════════════════════════════════════════════════════════════
echo.

echo Iniciando servidor...
echo.

cd /d "%~dp0"

node app.js

if !errorlevel! neq 0 (
    echo.
    echo ❌ Error al iniciar el servidor.
    echo   Verifica que Node.js esté instalado correctamente.
    pause
    exit /b 1
)

pause
