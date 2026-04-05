/**
 * Sistema de Migraciones de Base de Datos
 * Gestiona versiones de esquema automáticamente
 */

const path = require('path');

/**
 * Migraciones disponibles en orden
 * Cada migración retorna SQL a ejecutar
 */
const migrations = [
  {
    version: 1,
    name: 'create_base_schema',
    sql: `
      -- Crear tabla de seguimiento de migraciones
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        nombre TEXT NOT NULL,
        fecha_aplicada DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de usuarios
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        rol TEXT NOT NULL CHECK (rol IN ('jefe', 'empleado', 'admin')),
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de tareas
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'completada', 'no_completada')),
        explicacion TEXT,
        fecha TEXT NOT NULL,
        id_empleado INTEGER NOT NULL,
        id_jefe INTEGER NOT NULL DEFAULT 1,
        recurrente INTEGER DEFAULT 0,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_inicio_recurrencia TEXT,
        dias_recurrencia INTEGER DEFAULT 7,
        FOREIGN KEY (id_empleado) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        FOREIGN KEY (id_jefe) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        CHECK ((estado != 'no_completada') OR (estado = 'no_completada' AND explicacion IS NOT NULL AND length(trim(explicacion)) > 0))
      );

      -- Tabla de artículos/materiales
      CREATE TABLE IF NOT EXISTS articulos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        cantidad INTEGER NOT NULL,
        estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'solicitado', 'abastecido')),
        id_empleado INTEGER NOT NULL,
        id_jefe INTEGER,
        fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_abastecimiento DATETIME,
        FOREIGN KEY (id_empleado) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (id_jefe) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
      );

      -- Índices
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_tasks_fecha ON tasks(fecha);
      CREATE INDEX IF NOT EXISTS idx_tasks_empleado ON tasks(id_empleado);
      CREATE INDEX IF NOT EXISTS idx_tasks_jefe ON tasks(id_jefe);
      CREATE INDEX IF NOT EXISTS idx_tasks_recurrente ON tasks(recurrente);
      CREATE INDEX IF NOT EXISTS idx_articulos_empleado ON articulos(id_empleado);
      CREATE INDEX IF NOT EXISTS idx_articulos_estado ON articulos(estado);
    `
  }
];

/**
 * Obtener la versión actual de la BD
 */
function getCurrentVersion(db, callback) {
  db.get('SELECT MAX(version) as version FROM schema_version', (err, row) => {
    if (err) {
      if (err.message.includes('no such table')) {
        return callback(null, 0);
      }
      return callback(err);
    }
    callback(null, row?.version || 0);
  });
}

/**
 * Ejecutar migraciones pendientes
 */
function runMigrations(db, callback) {
  getCurrentVersion(db, (err, currentVersion) => {
    if (err) return callback(err);

    const pending = migrations.filter(m => m.version > currentVersion);

    if (pending.length === 0) {
      console.log('✅ Base de datos actualizada (sin cambios pendientes)');
      return callback(null, currentVersion);
    }

    console.log(`📦 Aplicando ${pending.length} migración(es)...`);

    let applied = 0;

    pending.forEach(migration => {
      db.exec(migration.sql, (err) => {
        if (err) {
          console.error(`❌ Error en migración ${migration.version}:`, err.message);
          return callback(err);
        }

        // Registrar migración aplicada
        db.run(
          'INSERT INTO schema_version (version, nombre) VALUES (?, ?)',
          [migration.version, migration.name],
          (err) => {
            if (err) {
              console.error(`❌ Error registrando migración ${migration.version}:`, err);
              return callback(err);
            }

            console.log(`✅ Migración ${migration.version} (${migration.name}) aplicada`);
            applied++;

            if (applied === pending.length) {
              callback(null, migration.version);
            }
          }
        );
      });
    });
  });
}

module.exports = {
  migrations,
  getCurrentVersion,
  runMigrations
};
