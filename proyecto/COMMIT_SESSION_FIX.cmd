@echo off
chcp 65001 >nul

cd /d "%~dp0"

echo.
echo ====================================
echo CORRIGIENDO SESIONES - PostgreSQL/SQLite
echo ====================================
echo.

echo [1/4] Agregando cambios...
git add src/config/session.js
if errorlevel 1 goto error

echo [2/4] Verificando estado...
git status
echo.

echo [3/4] Haciendo commit...
git commit -m "fix: Hacer session.js flexible para desarrollo local y produccion

- Si DATABASE_URL existe: usar PostgreSQL (Render)
- Si no: usar SQLite (desarrollo local)
- Permite trabajar sin PostgreSQL configurado localmente

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
if errorlevel 1 goto error

echo [4/4] Haciendo push a GitHub...
git push origin main
if errorlevel 1 goto error

echo.
echo ====================================
echo ULTIMOS COMMITS
echo ====================================
git log --oneline -3
echo.

echo.
echo ====================================
echo ✅ LISTO! Cambios enviados a GitHub
echo ====================================
echo.
pause
exit /b 0

:error
echo.
echo ====================================
echo ❌ ERROR EN EL PROCESO
echo ====================================
echo.
pause
exit /b 1
