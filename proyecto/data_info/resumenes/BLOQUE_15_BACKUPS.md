# BLOQUE 15 - SISTEMA DE BACKUPS DE BASE DE DATOS

## Protección de información y recuperación ante fallos

Se implementó un sistema de backups automáticos de la base de datos que crea copias de seguridad antes de aplicar cualquier modificación estructural. Este mecanismo permite recuperar la información ante errores, evitando la pérdida de datos críticos del sistema. La solución es independiente del sistema de migraciones y responde a prácticas reales de entornos productivos.

### Características Implementadas

- **Backup automático**: Se ejecuta al iniciar el servidor, antes de migraciones.
- **Backup manual**: Script `backup.js` para ejecuciones bajo demanda.
- **Política de retención**: Mantiene solo los últimos 10 backups.
- **Restauración simple**: Copiar backup a `database.sqlite`.

### Archivos Creados/Modificados

- `src/utils/backupManager.js`: Lógica de backup y retención.
- `src/config/database.js`: Integración automática en arranque.
- `backup.js`: Script manual.
- `backups/`: Directorio para almacenar backups.

### Uso

- Automático: Iniciar servidor con `node app.js`.
- Manual: Ejecutar `node backup.js`.
- Restaurar: Copiar archivo de `backups/` a `database.sqlite`.</content>
<parameter name="filePath">c:\Users\Moreno Luis\Desktop\backup\system_gestion_tarea\proyecto\data_info\resumenes\BLOQUE_15_BACKUPS.md