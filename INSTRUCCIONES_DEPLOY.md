# 🚀 Pasos para Levantar los Cambios a GitHub y Render

## 1️⃣ INSTALAR DEPENDENCIAS (Primera vez)

```bash
# Opción A: Ejecutar script batch
INSTALAR_DEPENDENCIAS.bat

# Opción B: Manual
cd proyecto
npm install
```

✅ Se instalarán:
- `pg` (controlador PostgreSQL)
- `connect-pg-simple` (store de sesiones)

---

## 2️⃣ COMMIT Y PUSH A GITHUB

```bash
# Opción A: Ejecutar script batch
PUSH_CAMBIOS.bat

# Opción B: Manual
cd proyecto
git add package.json src/config/session.js src/config/postgres.js .env.example POSTGRES_SETUP.md
git commit -m "feat: Migrar sesiones de SQLite a PostgreSQL para persistencia en Render"
git push origin main
```

✅ Se subirán los cambios a: `https://github.com/louisscmd9-cmd/NEWSistemaDeGestiondeTareas2026`

---

## 3️⃣ CONFIGURAR EN RENDER (Panel Web)

En https://dashboard.render.com:

1. Ve a tu servicio (Lo de Jacinto)
2. Abre **Environment**
3. Agrega o actualiza:
   ```
   DATABASE_URL = postgresql://...@...aws.com/...
   SESSION_SECRET = tu_clave_muy_segura_aqui
   NODE_ENV = production
   ```
4. Guarda cambios → Auto-deploy

---

## 4️⃣ VERIFICAR EN PRODUCCIÓN

Después del deploy:
- Visita tu app en Render
- Haz login
- Recarga la página → sesión persiste ✅
- Espera 30s → sesión sigue ✅

---

## 📁 Archivos Generados/Modificados

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `package.json` | Modificado | Agregadas dependencias PostgreSQL |
| `src/config/session.js` | Modificado | Ahora usa PostgreSQL |
| `src/config/postgres.js` | Creado | Pool de PostgreSQL |
| `.env.example` | Creado | Template de variables |
| `POSTGRES_SETUP.md` | Creado | Documentación técnica |

---

## 🔄 Si Necesitas Revertir

```bash
git revert HEAD
# o
git reset --soft HEAD~1
```

Restaura la versión anterior de `src/config/session.js` desde backup.

---

## ✅ Resumen

- ✅ SQLite sesiones → PostgreSQL (persistencia)
- ✅ Pool de conexiones con reintentos
- ✅ Tabla de sesiones con índice de expiración
- ✅ SSL automático en producción
- ✅ Compatible con desarrollo local
