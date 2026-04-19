@echo off
cd /d "c:\Users\Moreno Luis\Desktop\backup\system_gestion_tarea\NEWSistemaDeGestiondeTareas2026\proyecto"

echo ====================================
echo CORRIGIENDO ERROR DE SINTAXIS
echo ====================================
git add public/js/utils.js

echo.
echo ====================================
echo VERIFICANDO CAMBIOS...
echo ====================================
git status

echo.
echo ====================================
echo HACIENDO COMMIT...
echo ====================================
git commit -m "fix: Corregir error de sintaxis en confirmDeletion (utils.js:125)

- Renombrar 'confirm Deletion' a 'confirmDeletion'
- Error: SyntaxError: Unexpected identifier 'Deletion'

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo.
echo ====================================
echo HACIENDO PUSH A GITHUB...
echo ====================================
git push origin main

echo.
echo ====================================
echo CORRECCION COMPLETADA!
echo ====================================
pause
