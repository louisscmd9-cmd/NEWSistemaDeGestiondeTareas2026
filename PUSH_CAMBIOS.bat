@echo off
cd /d "c:\Users\Moreno Luis\Desktop\backup\system_gestion_tarea\NEWSistemaDeGestiondeTareas2026\proyecto"

echo ====================================
echo AGREGANDO CAMBIOS A GIT...
echo ====================================
git add package.json src/config/session.js src/config/postgres.js .env.example POSTGRES_SETUP.md

echo.
echo ====================================
echo VERIFICANDO CAMBIOS...
echo ====================================
git status

echo.
echo ====================================
echo HACIENDO COMMIT...
echo ====================================
git commit -m "feat: Migrar sesiones de SQLite a PostgreSQL para persistencia en Render

- Reemplazar connect-sqlite3 por connect-pg-simple
- Crear src/config/postgres.js con Pool de PostgreSQL
- Actualizar src/config/session.js para usar PostgreSQL
- Tabla de sesiones se crea automáticamente
- Agregar variables de entorno (DATABASE_URL, SESSION_SECRET)
- Sesiones persisten aunque el servidor reinicie

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo.
echo ====================================
echo HACIENDO PUSH A GITHUB...
echo ====================================
git push origin main

echo.
echo ====================================
echo ULTIMOS COMMITS
echo ====================================
git log --oneline -3

echo.
echo ====================================
echo LISTO! Cambios enviados a GitHub
echo ====================================
pause
