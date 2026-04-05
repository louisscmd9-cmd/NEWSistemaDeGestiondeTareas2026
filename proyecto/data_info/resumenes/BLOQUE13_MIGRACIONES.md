# Bloque 13 – Sistema de Migraciones de BD (Producción-Ready)

## ✅ Implementado

### 1. Sistema de Migraciones Versionadas

**Archivo:** `src/config/migrationManager.js`

- ✅ Tabla `schema_version` que rastrea qué migraciones se ejecutaron
- ✅ Migraciones incrementales organizadas por versión
- ✅ Ejecución automática de migraciones pendientes al iniciar

### 2. Migración 1: Schema Base

**Define:**
- Tabla `users` (con rol: admin, jefe, empleado)
- Tabla `tasks` (con todos los campos: recurrencia, explicación, etc.)
- Tabla `articulos` (con estados: pendiente, solicitado, abastecido)
- Índices para performance

### 3. Flujo de Inicialización

1. **Al iniciar servidor:**
   - Se abre/crea `database.sqlite`
   - Se ejecuta `runMigrations()`
   - Se chequea `schema_version`
   - Se aplican migraciones pendientes

2. **Resultado:**
   - ✅ Tablas creadas correctamente (v1)
   - ✅ Usuarios por defecto cargados
   - ✅ Sistema listo

### 4. Ventajas (vs. sistema anterior)

| Antes | Después |
|-------|---------|
| Borrar `database.sqlite` | Datos persisten |
| Correr `seed.js` manualmente | Automático |
| No hay versionado | Versionado (v1, v2, v3...) |
| No apto para producción | ✅ Listo para producción |

## 📋 Próximas Migraciones (cuando sea necesario)

Crear nuevos archivos en `migrationManager.js`:

```javascript
{
  version: 2,
  name: 'add_usuario_logs',
  sql: `...` // ALTER TABLE o CREATE TABLE
}
```

Al iniciar, automáticamente se aplicarán las versiones 2+ sin perder datos.

## 🔍 Verificación

**Archivo:** `src/config/database.js`

- Simplificado (sin lógica de ALTER TABLE manual)
- Delega a `migrationManager`
- Carga usuarios automáticamente
- Compatible con migraciones futuras

## 🚀 Listo para:
- ✅ Actualizar sin perder datos
- ✅ Múltiples instancias
- ✅ Múltiples deployments
- ✅ Versionado de esquema
