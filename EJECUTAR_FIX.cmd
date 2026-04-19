@echo off
REM Este archivo crea un acceso directo al script de commit

setlocal enabledelayedexpansion

set "SCRIPT_PATH=c:\Users\Moreno Luis\Desktop\backup\system_gestion_tarea\NEWSistemaDeGestiondeTareas2026\proyecto\COMMIT_SESSION_FIX.cmd"

if not exist "!SCRIPT_PATH!" (
  echo Error: Script no encontrado en !SCRIPT_PATH!
  pause
  exit /b 1
)

call "!SCRIPT_PATH!"
