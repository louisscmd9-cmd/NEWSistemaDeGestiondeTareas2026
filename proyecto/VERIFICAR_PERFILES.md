# ✅ VERIFICACIÓN DE PERFILES Y BD

## 1️⃣ VERIFICAR QUE LOS USUARIOS ESTÉN CARGADOS

### Opción A: Script automatizado
```bash
VERIFICAR_USUARIOS.bat
```

### Opción B: Manual (Node.js)
```bash
node verify-users.js
```

Deberías ver:
```
✅ Total de usuarios: 4

1. Administrador
   Username: admin
   Rol: admin
   ID: 1

2. Jefe Principal
   Username: jefe
   Rol: jefe
   ID: 2

3. Empleado Uno
   Username: emp1
   Rol: empleado
   ID: 3

4. Empleado Dos
   Username: emp2
   Rol: empleado
   ID: 4
```

---

## 2️⃣ VERIFICAR QUE LA BD ESTÉ FUNCIONANDO

### Inicia el servidor:
```bash
npm start
```

Deberías ver en la consola:
```
✅ Base de datos SQLite conectada correctamente
✅ Tablas creadas correctamente (v8)
  ✅ Usuario creado: admin
  ✅ Usuario creado: jefe
  ✅ Usuario creado: emp1
  ✅ Usuario creado: emp2
✅ Servidor Express en http://localhost:3000
```

---

## 3️⃣ PRUEBA DE LOGIN

Abre http://localhost:3000 y prueba con:

| Rol | Usuario | Contraseña |
|-----|---------|-----------|
| Admin | admin | 123456 |
| Jefe | jefe | 123456 |
| Empleado | emp1 | 123456 |
| Empleado | emp2 | 123456 |

---

## 4️⃣ SI NO VES LOS USUARIOS

**Problema:** Mensaje `❌ NO HAY USUARIOS CARGADOS`

**Soluciones:**

### A) Reiniciar la BD
```bash
RUN.bat
```
Esto limpia y reinicia todo con usuarios por defecto.

### B) Limpiar y reiniciar manualmente
```bash
# Elimina las bases de datos actuales
del database.sqlite
del sessions.sqlite

# Reinicia
npm start
```

---

## 5️⃣ VERIFICAR LA TABLA DE USUARIOS

Si tienes SQLite Browser instalado:
```bash
# Abre directamente la BD
database.sqlite
```

Y busca la tabla `users`.

---

## 📋 CHECKLIST

- [ ] Ejecuté `VERIFICAR_USUARIOS.bat` o `node verify-users.js`
- [ ] Veo los 4 usuarios en la salida
- [ ] Inicié `npm start` sin errores
- [ ] Vi mensajes "✅ Usuario creado" en la consola
- [ ] Logré hacer login con admin/123456
- [ ] El rol se muestra en la navbar (Admin/Jefe/Empleado)

Si todos los checks pasan ✅, la BD está lista para usar.

---

## 🔧 ESTRUCTURA DE USUARIOS

Los usuarios se cargan en `src/config/database.js` línea 67-103:

```javascript
function cargarUsuariosDefault() {
  const usuarios = [
    { nombre: 'Administrador', username: 'admin', password: '123456', rol: 'admin' },
    { nombre: 'Jefe Principal', username: 'jefe', password: '123456', rol: 'jefe' },
    { nombre: 'Empleado Uno', username: 'emp1', password: '123456', rol: 'empleado' },
    { nombre: 'Empleado Dos', username: 'emp2', password: '123456', rol: 'empleado' }
  ];
  // ...
}
```

Se crean automáticamente si no existen (verificado en `cargarUsuariosDefault`).
