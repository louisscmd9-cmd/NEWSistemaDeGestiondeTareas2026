/**
 * Configuración y Migraciones de Base de Datos
 * Sistema de Gestión de Tareas
 * 
 * Base de datos: SQLite con sistema de migraciones versionadas
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { runMigrations } = require('./migrationManager');
const { createBackup } = require('../utils/backupManager');
const bcrypt = require('bcrypt');

// Ruta del archivo de base de datos
const dbPath = path.join(__dirname, '../../database.sqlite');

let isDBReady = false;
const readyCallbacks = [];

// Crear / abrir la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err.message);
    return;
  }
  
  console.log('✅ Base de datos SQLite conectada correctamente');
  
  // Activar claves foráneas
  db.run('PRAGMA foreign_keys = ON');

  // Crear backup antes de cualquier cambio
  createBackup();

  // Ejecutar migraciones
  runMigrations(db, (err, version) => {
    if (err) {
      console.error('❌ Error en migraciones:', err);
      return;
    }

    console.log(`✅ Tablas creadas correctamente (v${version})`);
    
    // Cargar usuarios por defecto
    cargarUsuariosDefault();
    
    isDBReady = true;
    readyCallbacks.forEach(cb => cb());
    readyCallbacks.length = 0;
  });
});

/**
 * Helper function para esperar a que la BD esté lista
 */
const onReady = (callback) => {
  if (isDBReady) {
    callback();
  } else {
    readyCallbacks.push(callback);
  }
};

/**
 * Cargar usuarios por defecto si no existen
 */
function cargarUsuariosDefault() {
  const usuarios = [
    { nombre: 'Administrador', username: 'admin', password: '123456', rol: 'admin' },
    { nombre: 'Jefe Principal', username: 'jefe', password: '123456', rol: 'jefe' },
    { nombre: 'Empleado Uno', username: 'emp1', password: '123456', rol: 'empleado' },
    { nombre: 'Empleado Dos', username: 'emp2', password: '123456', rol: 'empleado' }
  ];

  let created = 0;
  const total = usuarios.length;

  usuarios.forEach(user => {
    db.get('SELECT id FROM users WHERE username = ?', [user.username], (err, row) => {
      if (!row) {
        bcrypt.hash(user.password, 10, (err, hash) => {
          if (err) {
            console.error(`❌ Error hashing ${user.username}:`, err);
            return;
          }
          db.run('INSERT INTO users (nombre, username, password, rol) VALUES (?, ?, ?, ?)',
            [user.nombre, user.username, hash, user.rol],
            function(err) {
              if (err) {
                console.error(`❌ Error creando ${user.username}:`, err);
              } else {
                console.log(`  ✅ Usuario creado: ${user.username}`);
              }
              created++;
            }
          );
        });
      } else {
        created++;
      }
    });
  });
}

module.exports = db;
module.exports.onReady = onReady;