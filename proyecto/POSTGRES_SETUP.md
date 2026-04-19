# Configuración de Sesiones en PostgreSQL

## Cambios Realizados

- ✅ Reemplazado `connect-sqlite3` por `connect-pg-simple`
- ✅ Agregados paquetes: `pg` v8.11.0 y `connect-pg-simple` v7.0.0
- ✅ Creado archivo `src/config/postgres.js` para gestionar el Pool de PostgreSQL
- ✅ Actualizado `src/config/session.js` para usar PostgreSQL en lugar de SQLite
- ✅ Tabla de sesiones se crea automáticamente si no existe

## Variables de Entorno Requeridas

En producción (Render), configurar:

```
DATABASE_URL=postgresql://usuario:contraseña@servidor:5432/database
SESSION_SECRET=tu_clave_secreta_muy_larga
NODE_ENV=production
```

Para desarrollo local (`.env` opcional):

```
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/sistema_tareas
SESSION_SECRET=supersecreto123
NODE_ENV=development
```

## Instalación

```bash
npm install
```

## Funcionamiento

- Las sesiones se persisten automáticamente en PostgreSQL
- La tabla `session` se crea con índice en la columna `expire`
- Las sesiones expiran tras 2 horas de inactividad
- SSL se activa automáticamente en producción (NODE_ENV=production)
- En desarrollo, SQLite sigue siendo la BD para usuarios y tareas

## Rollback (volver a SQLite)

Si necesitas revertir, restaurar `src/config/session.js` a la versión anterior y ejecutar `npm install`.
