/**
 * Script de verificación de usuarios en la BD
 * Ejecutar: node verify-users.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error conectando a la BD:', err.message);
    process.exit(1);
  }

  console.log('✅ Conectado a la BD\n');
  console.log('='.repeat(60));
  console.log('USUARIOS CARGADOS EN LA BASE DE DATOS');
  console.log('='.repeat(60));

  // Obtener todos los usuarios
  db.all('SELECT id, nombre, username, rol FROM users ORDER BY rol, username', [], (err, rows) => {
    if (err) {
      console.error('❌ Error consultando usuarios:', err);
      db.close();
      process.exit(1);
    }

    if (!rows || rows.length === 0) {
      console.log('❌ NO HAY USUARIOS CARGADOS\n');
      console.log('Ejecuta: npm start para cargar los usuarios por defecto');
    } else {
      console.log(`✅ Total de usuarios: ${rows.length}\n`);
      
      rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.nombre}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Rol: ${user.rol}`);
        console.log(`   ID: ${user.id}`);
        console.log();
      });

      console.log('='.repeat(60));
      console.log('CREDENCIALES POR DEFECTO PARA PRUEBAS:');
      console.log('='.repeat(60));
      console.log('Admin:    admin / 123456');
      console.log('Jefe:     jefe / 123456');
      console.log('Empleado: emp1 / 123456 o emp2 / 123456');
      console.log('='.repeat(60));
    }

    db.close();
  });
});
