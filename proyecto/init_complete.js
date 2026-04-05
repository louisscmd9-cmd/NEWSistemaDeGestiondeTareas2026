const fs = require('fs');
const path = require('path');
const db = require('./src/config/database');
const bcrypt = require('bcrypt');

console.log('🔄 Inicializando sistema...\n');

// Paso 1: Eliminar BD existentes
const dbPath = path.join(__dirname, 'database.sqlite');
const sessionPath = path.join(__dirname, 'sessions.sqlite');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✓ database.sqlite eliminado');
}

if (fs.existsSync(sessionPath)) {
  fs.unlinkSync(sessionPath);
  console.log('✓ sessions.sqlite eliminado');
}

console.log('\n⏳ Esperando que la BD se cree...\n');

// Esperar a que se creen las tablas
setTimeout(() => {
  const users = [
    { nombre: 'Administrador', username: 'admin', password: '123456', rol: 'admin' },
    { nombre: 'Jefe Principal', username: 'jefe', password: '123456', rol: 'jefe' },
    { nombre: 'Empleado Uno', username: 'emp1', password: '123456', rol: 'empleado' },
    { nombre: 'Empleado Dos', username: 'emp2', password: '123456', rol: 'empleado' }
  ];

  let processed = 0;

  users.forEach(user => {
    bcrypt.hash(user.password, 10, (err, hash) => {
      if (err) {
        console.error('❌ Error hashing:', err);
        return;
      }

      const query = 'INSERT OR IGNORE INTO users (nombre, username, password, rol) VALUES (?, ?, ?, ?)';
      db.run(query, [user.nombre, user.username, hash, user.rol], function(err) {
        if (err) {
          console.error(`❌ Error creando ${user.username}:`, err);
        } else {
          console.log(`✅ Usuario ${user.username} (${user.rol})`);
        }
        
        processed++;
        if (processed === users.length) {
          console.log('\n✅ Usuarios cargados correctamente');
          console.log('\n📋 Credenciales de prueba:');
          console.log('   admin / 123456 → /admin');
          console.log('   jefe / 123456 → /jefe');
          console.log('   emp1 / 123456 → /empleado');
          console.log('   emp2 / 123456 → /empleado');
          console.log('\n⏳ Cargando tareas de prueba...\n');
          
          // Cargar tareas
          require('./seed_tareas.js');
        }
      });
    });
  });
}, 1500);
