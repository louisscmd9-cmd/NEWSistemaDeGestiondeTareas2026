@echo off
REM Script para verificar que el fix de tareas duplicadas funciona

cd /d "c:\Users\Moreno Luis\Desktop\backup\system_gestion_tarea\proyecto"

echo.
echo =========================================
echo  INICIANDO SISTEMA (Fix Tareas Duplicadas)
echo =========================================
echo.

REM Limpiar BD anterior
if exist database.sqlite (
    del database.sqlite
    echo ✓ Base de datos anterior limpiada
)

if exist sessions.sqlite (
    del sessions.sqlite
    echo ✓ Sesiones anteriores limpiadas
)

echo.
echo INICIANDO SERVIDOR...
echo.
echo Cuando veas "✅ Usuario creado", abre: http://localhost:3000
echo.
echo Login como JEFE:
echo  Usuario: jefe
echo  Contraseña: 123456
echo.
echo VERIFICAR:
echo ✓ Las tareas NO aparecen duplicadas
echo ✓ El formulario de crear tarea se carga UNA sola vez
echo ✓ Al crear una tarea, aparece UNA sola vez
echo.

node app.js

pause
