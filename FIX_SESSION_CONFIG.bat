@echo off
cd /d "c:\Users\Moreno Luis\Desktop\backup\system_gestion_tarea\NEWSistemaDeGestiondeTareas2026\proyecto"

echo ====================================
echo CORRIGIENDO CONFIGURACION DE SESIONES
echo ====================================
git add src/config/session.js

echo.
echo ====================================
echo HACIENDO COMMIT...
echo ====================================
git commit -m "fix: Hacer session.js flexible para desarrollo local y produccion

- Si DATABASE_URL existe: usar PostgreSQL (Render)
- Si no: usar SQLite (desarrollo local)
- Permite trabajar sin PostgreSQL configurado localmente

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo.
echo ====================================
echo HACIENDO PUSH A GITHUB...
echo ====================================
git push origin main

echo.
echo ====================================
echo LISTO! Ahora puedes hacer npm start
echo ====================================
pause
