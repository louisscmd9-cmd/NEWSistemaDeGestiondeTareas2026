✅ CAMBIOS REALIZADOS - Dashboard Jefe Simplificado

❌ REMOVIDO:
1. KPI Cards (arriba)
   - TAREAS PENDIENTES
   - NO COMPLETADAS
   - ARTÍCULOS PENDIENTES
   - RECURRENTES

2. Panel Lateral Derecho (lado derecho)
   - Formulario "Crear Nueva Tarea"
   - Panel "Solicitudes de Artículos"

📋 RESULTADO:
✅ Dashboard ahora es FULL WIDTH (100% del ancho)
✅ Solo muestra la tabla "Todas las Tareas"
✅ Interfaz más limpia y simple
✅ Menos clutter en pantalla

🔧 ARCHIVOS MODIFICADOS:
✅ views/jefe/index.html
   - Removidos KPI cards (líneas 27-53)
   - Removido panel lateral (líneas 77-125)
   - Tabla de tareas ahora col-md-12 (full width)
   - Removido contenido duplicado

✅ public/js/jefe.js
   - Removida función loadArticulos()
   - Removida función updateArticuloEstado()
   - Removida llamada a loadArticulos() en inicializador

📊 VISTA ANTIGUA vs NUEVA

ANTES:
┌─────────────────────────────────────────────────┐
│ KPI Cards (4 columnas)                          │
├──────────────────────┬──────────────────────────┤
│ Crear Tarea          │ Todas las Tareas         │
│ Formulario           │ (Tabla completa)         │
├──────────────────────┤                          │
│ Artículos            │                          │
│ Solicitados          │                          │
└──────────────────────┴──────────────────────────┘

DESPUÉS:
┌──────────────────────────────────────────────────┐
│ Todas las Tareas (Full Width)                   │
│ (Tabla completa)                                 │
│                                                  │
│                                                  │
└──────────────────────────────────────────────────┘

✨ BENEFICIOS:
✅ Más espacio para ver tareas
✅ Interfaz más enfocada
✅ Mejor para mobile
✅ Menos distracciones

---

Para crear tareas o gestionar artículos, el jefe puede usar:
- Las opciones en el menú principal
- O mediante endpoints API directamente
- Los empleados aún pueden solicitar artículos
- Los jefes pueden gestionar artículos desde otro dashboard
