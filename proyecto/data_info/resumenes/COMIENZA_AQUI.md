# 🚀 GUÍA RÁPIDA - INICIAR EL SISTEMA

## ⏱️ 30 SEGUNDOS PARA TENER TODO FUNCIONANDO

### Paso 1️⃣ - Abre terminal en la carpeta del proyecto
```
cd c:\Users\Moreno Luis\Desktop\backup\system_gestion_tarea\proyecto
```

### Paso 2️⃣ - Ejecuta el script de reset (elimina BD vieja)
```
RUN.bat
```

Espera a que veas:
```
✅ Usuario creado: admin
✅ Usuario creado: jefe
✅ Usuario creado: emp1
✅ Usuario creado: emp2
```

### Paso 3️⃣ - Abre navegador
```
http://localhost:3000
```

### Paso 4️⃣ - Inicia sesión
Prueba cualquiera de estos:

| Usuario | Contraseña |
|---------|-----------|
| admin   | 123456    |
| jefe    | 123456    |
| emp1    | 123456    |
| emp2    | 123456    |

## ✅ ¡LISTO!

Estarás en tu respectivo dashboard.

---

## 📋 QUREFERENCIA RÁPIDA POR ROL

### 🛡️ ADMIN - Control total
- Crear empleado
- Editar empleado  
- Eliminar empleado
- Ver estadísticas

### 🧑‍💼 JEFE - Operaciones
- Crear tareas (una vez o recurrente 7 días)
- Filtrar por fecha
- Ver por qué empleados no completaron tareas
- Gestionar solicitudes de materiales

### 👷 EMPLEADO - Tareas
- Ver mis tareas del día
- Marcar como hecha
- Si no está hecha: explicar por qué
- Solicitar artículos que faltan

---

## 🆘 TROUBLESHOOTING

### ❌ "No puedo ingresar" (error 400)
→ Ejecuta `RUN.bat` nuevamente

### ❌ "Dice que no existe la tarea"
→ Logout y login nuevamente (refresca sesión)

### ❌ "No veo los artículos que solicité"
→ Logout como empleado, login como jefe, mira panel derecho

### ❌ Puerto 3000 ya en uso
Cambia en `app.js` línea 11:
```javascript
const PORT = process.env.PORT || 3001;  // cambia 3001
```

---

## 📚 DOCUMENTACIÓN COMPLETA

Para más detalles, lee:
- `ESTADO_COMPLETO.md` - Status del proyecto completo
- `SOLUCION_LOGIN_400.md` - Detalles del fix
- `BLOQUE14_BRANDING.md` - Branding visual

---

## 🎯 SISTEMA LISTO PARA PRODUCCIÓN

✅ Base de datos con migraciones  
✅ Autenticación segura (bcrypt)  
✅ Roles y permisos  
✅ UI profesional  
✅ Todas las funcionalidades  

**¡A trabajar!** 🚀
