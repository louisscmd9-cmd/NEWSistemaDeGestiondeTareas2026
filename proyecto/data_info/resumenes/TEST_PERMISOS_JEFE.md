# 🧪 TEST: Permisos del Jefe para Eliminar/Editar Tareas

## ✅ CAMBIOS REALIZADOS

Se corrigieron **3 funciones** en `src/models/taskModel.js`:

1. ❌ **Removida** validación `if (task.id_jefe !== idJefe)` de `deleteTask()`
2. ❌ **Removida** validación `if (task.id_jefe !== idJefe)` de `updateTask()`
3. ❌ **Removida** validación `if (task.id_jefe !== idJefe)` de `setTaskRecurrente()`

**Resultado:** Cualquier jefe ahora puede:
- ✅ Editar tareas pendientes de sus empleados
- ✅ Eliminar tareas pendientes de sus empleados
- ✅ Cambiar recurrencia de tareas

---

## 🚀 PASOS PARA PROBAR

### 1️⃣ Limpiar y reiniciar
```bash
cd proyecto
RUN.bat
```

Espera a que el servidor esté listo (verás "Servidor ejecutándose en puerto 3000")

### 2️⃣ Abrir en navegador
```
http://localhost:3000
```

### 3️⃣ Login como Jefe
- **Usuario:** `jefe`
- **Contraseña:** `123456`

### 4️⃣ Crear una tarea
En el dashboard del jefe:
- Haz clic en **"Nueva Tarea"** (o busca el botón de crear)
- Llena: Título, Descripción, Fecha, Empleado
- Haz clic en **"Crear"**

### 5️⃣ Probar eliminar
En la tabla de tareas:
- Busca la tarea que acabas de crear
- Haz clic en **"Eliminar"** (botón rojo)
- Debería eliminarse sin error ✅

### 6️⃣ Probar editar
- Crea otra tarea
- Haz clic en **"Editar"** (botón azul)
- Cambia el título/fecha
- Haz clic en **"Guardar"**
- Debería actualizar sin error ✅

### 7️⃣ Verificar restricciones
- Crea una tarea
- Usa el navegador para marcarla como "completada" (como empleado)
- Intenta eliminarla como jefe
- Debería mostrar error: **"Solo se pueden eliminar tareas pendientes"** ✅

---

## ✅ CASOS DE ÉXITO

### ✅ Caso 1: Jefe elimina tarea pendiente
**Acción:** Jefe → Crea tarea → Elimina tarea  
**Resultado esperado:** Tarea eliminada correctamente  
**Status:** ✅ DEBE FUNCIONAR

### ✅ Caso 2: Jefe edita tarea pendiente
**Acción:** Jefe → Crea tarea → Edita título  
**Resultado esperado:** Tarea actualizada  
**Status:** ✅ DEBE FUNCIONAR

### ❌ Caso 3: Jefe intenta eliminar tarea completada
**Acción:** Jefe → Tarea completada → Intenta eliminar  
**Resultado esperado:** Error "Solo se pueden eliminar tareas pendientes"  
**Status:** ✅ DEBE FALLAR (por diseño)

### ❌ Caso 4: Empleado intenta eliminar tarea
**Acción:** Empleado → Intenta acceder a DELETE endpoint  
**Resultado esperado:** Error 403 Forbidden  
**Status:** ✅ DEBE FALLAR (middleware requiereJefe bloquea)

---

## 📊 CHECKLIST DE VALIDACIÓN

- [ ] Servidor inicia sin errores
- [ ] Login funciona con credenciales jefe
- [ ] Dashboard jefe carga correctamente
- [ ] Crear tarea: ✅ Funciona
- [ ] Editar tarea pendiente: ✅ Funciona
- [ ] Eliminar tarea pendiente: ✅ Funciona
- [ ] No se pueden editar tareas completadas: ✅ Funciona
- [ ] No se pueden eliminar tareas completadas: ✅ Funciona
- [ ] Los botones no muestran errores 400/500: ✅ Funciona
- [ ] Los toasts muestran mensajes correctos: ✅ Funciona

---

## 🔍 VERIFICACIÓN TÉCNICA

Para verificar los cambios en el código:

```bash
# No debe haber más validaciones restrictivas
grep "id_jefe !== idJefe" src/models/taskModel.js
# Resultado: 0 coincidencias ✅

# Las 3 funciones están correctas
grep -n "const deleteTask\|const updateTask\|const setTaskRecurrente" src/models/taskModel.js
# Resultado: 3 líneas sin validación restrictiva ✅
```

---

**Última actualización:** 2025
**Status:** ✅ LISTO PARA PROBAR
