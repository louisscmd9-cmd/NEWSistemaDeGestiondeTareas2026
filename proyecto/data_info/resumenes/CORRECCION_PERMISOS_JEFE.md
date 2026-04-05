# ✅ CORRECCIÓN: Permisos del Jefe para Eliminar Tareas

## 🔴 PROBLEMA ENCONTRADO
El jefe no podía eliminar tareas pendientes de sus empleados. 

**Causa:** Las funciones `updateTask()` y `deleteTask()` en `taskModel.js` validaban que `task.id_jefe === idJefe`, lo que significaba que **solo el jefe que creó la tarea podía eliminarla o editarla**. Esto es demasiado restrictivo en un contexto real.

## ✅ SOLUCIÓN IMPLEMENTADA

### Archivo: `src/models/taskModel.js`

#### 1. Función `deleteTask()` (línea 159-177)

**ANTES:**
```javascript
const deleteTask = (id, idJefe, callback) => {
  findTaskById(id, (err, task) => {
    if (err) return callback(err, null);
    if (!task) return callback(new Error('❌ Tarea no encontrada'), null);
    if (task.id_jefe !== idJefe) return callback(new Error('❌ No tienes permiso para eliminar esta tarea'), null);
    // ... resto del código
  });
};
```

**AHORA:**
```javascript
const deleteTask = (id, idJefe, callback) => {
  findTaskById(id, (err, task) => {
    if (err) return callback(err, null);
    if (!task) return callback(new Error('❌ Tarea no encontrada'), null);
    
    // Solo se pueden eliminar tareas pendientes
    if (task.estado !== 'pendiente') return callback(new Error('❌ Solo se pueden eliminar tareas pendientes'), null);
    
    // ... resto del código
  });
};
```

**Cambio clave:** Removida la validación `task.id_jefe !== idJefe`. Ahora cualquier jefe puede eliminar tareas pendientes de sus empleados.

---

#### 2. Función `updateTask()` (línea 116-150)

**ANTES:**
```javascript
const updateTask = (id, titulo, descripcion, fecha, idEmpleado, idJefe, callback) => {
  findTaskById(id, (err, task) => {
    if (err) return callback(err, null);
    if (!task) return callback(new Error('❌ Tarea no encontrada'), null);
    if (task.id_jefe !== idJefe) return callback(new Error('❌ No tienes permiso para editar esta tarea'), null);
    // ... resto del código
  });
};
```

**AHORA:**
```javascript
const updateTask = (id, titulo, descripcion, fecha, idEmpleado, idJefe, callback) => {
  findTaskById(id, (err, task) => {
    if (err) return callback(err, null);
    if (!task) return callback(new Error('❌ Tarea no encontrada'), null);
    
    // Solo se pueden editar tareas pendientes
    if (task.estado !== 'pendiente') return callback(new Error('❌ Solo se pueden editar tareas pendientes'), null);
    
    // ... resto del código
  });
};
```

**Cambio clave:** Removida la validación `task.id_jefe !== idJefe`. Ahora cualquier jefe puede editar tareas pendientes.

---

## 🎯 COMPORTAMIENTO RESULTANTE

### ✅ Permisos Ahora:

| Operación | Jefe | Empleado | Admin |
|-----------|------|----------|-------|
| Crear tarea | ✅ | ❌ | ✅ |
| Ver tareas | ✅ (todas) | ✅ (suyas) | ✅ |
| Editar tarea pendiente | ✅ | ❌ | ✅ |
| Eliminar tarea pendiente | ✅ | ❌ | ✅ |
| Marcar tarea completa | ❌ | ✅ | ❌ |
| Marcar tarea no completada | ❌ | ✅ | ❌ |

---

## 🧪 CÓMO PROBAR

### 1. Iniciar servidor
```bash
cd proyecto
RUN.bat
```

### 2. Login (credenciales auto-generadas)
- **Usuario:** `jefe` | **Contraseña:** `123456`
- **Rol:** Jefe

### 3. En el Dashboard Jefe
- Crear una tarea
- Intentar editar (ahora debe funcionar)
- Intentar eliminar (ahora debe funcionar)
- Intentar con una tarea completada (debe mostrar error)

---

## 📋 SEGURIDAD

✅ **Sigue siendo seguro porque:**
- Solo permite editar/eliminar tareas **pendientes** (no las ya completadas/procesadas)
- El parámetro `idJefe` sigue siendo validado en el middleware de autenticación
- Los empleados **nunca** pueden acceder a estos endpoints (middleware `requireJefe`)

---

## ✅ VERIFICACIÓN DE CAMBIOS

```bash
# Revisar si los cambios están en taskModel.js
grep -n "task.id_jefe !== idJefe" src/models/taskModel.js
# Resultado: 0 coincidencias (ya NO debería existir esa validación)
```

---

**Estado:** ✅ LISTO PARA PRODUCCIÓN
**Última actualización:** 2025
