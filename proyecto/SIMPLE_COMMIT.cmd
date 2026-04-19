@echo off
chcp 65001 >nul
cd /d "c:\Users\Moreno Luis\Desktop\backup\system_gestion_tarea\NEWSistemaDeGestiondeTareas2026\proyecto"

echo.
echo ====================================
echo COMMIT: SESSION.JS FLEXIBLE
echo ====================================
echo.

echo [1] Agregando todos los cambios...
git add -A
echo.

echo [2] Estado actual:
git status
echo.

echo [3] Haciendo commit...
git commit -m "fix: Session flexible para PostgreSQL/SQLite"
echo.

echo [4] Push a GitHub...
git push origin main
echo.

echo [5] Ultimos cambios:
git log --oneline -2
echo.

echo ====================================
echo OK - Cambios enviados!
echo ====================================
pause
