const db = require('./src/config/database');
const bcrypt = require('bcrypt');

// Crear usuarios de prueba
const users = [
  { nombre: 'Administrador', username: 'admin', password: '123456', rol: 'admin' },
  { nombre: 'Jefe Principal', username: 'jefe', password: '123456', rol: 'jefe' },
  { nombre: 'Empleado Uno', username: 'emp1', password: '123456', rol: 'empleado' },
  { nombre: 'Empleado Dos', username: 'emp2', password: '123456', rol: 'empleado' }
];

db.onReady(() => {
  users.forEach(user => {
    bcrypt.hash(user.password, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return;
      }
      
      const query = 'INSERT OR IGNORE INTO users (nombre, username, password, rol) VALUES (?, ?, ?, ?)';
      db.run(query, [user.nombre, user.username, hash, user.rol], function(err) {
        if (err) {
          console.error('Error creando usuario:', err);
        } else {
          console.log(`✅ Usuario ${user.username} creado o ya existe`);
        }
      });
    });
  });
  
  // Cerrar después de tiempo
  setTimeout(() => {
    console.log('Datos de prueba cargados correctamente');
    process.exit(0);
  }, 2000);
});