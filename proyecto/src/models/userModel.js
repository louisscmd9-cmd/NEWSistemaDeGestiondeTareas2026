const db = require('../config/database');

/**
 * Busca un usuario por nombre de usuario (username)
 * 
 * @param {string} username - Nombre de usuario único
 * @param {function} callback - (err, user) => { }
 */
const findUserByUsername = (username, callback) => {
  const query = 'SELECT * FROM users WHERE username = ?';
  db.get(query, [username], (err, user) => {
    if (err) {
      console.error('❌ Error en findUserByUsername:', err);
      return callback(err, null);
    }
    // user será undefined si no existe, null/objeto si existe
    callback(null, user);
  });
};

/**
 * Busca un usuario por su ID
 * 
 * @param {number} id - ID del usuario
 * @param {function} callback - (err, user) => { }
 */
const findUserById = (id, callback) => {
  const query = 'SELECT * FROM users WHERE id = ?';
  db.get(query, [id], (err, user) => {
    if (err) {
      console.error('❌ Error en findUserById:', err);
      return callback(err, null);
    }
    callback(null, user);
  });
};

/**
 * Crea un usuario nuevo en la base de datos
 * 
 * @param {string} nombre - Nombre completo
 * @param {string} username - Username único
 * @param {string} password - Contraseña (hash recomendado)
 * @param {string} rol - 'jefe' o 'empleado'
 * @param {function} callback - (err, user) => { }
 */
const createUser = (nombre, username, password, rol, callback) => {
  const query = 'INSERT INTO users (nombre, username, password, rol) VALUES (?, ?, ?, ?)';
  
  db.run(query, [nombre, username, password, rol], function(err) {
    if (err) {
      console.error('❌ Error en createUser:', err.message);
      return callback(err, null);
    }
    
    // this.lastID contiene el ID generado por AUTOINCREMENT
    const userId = this.lastID;
    
    // Recuperar el usuario creado para confirmación
    findUserById(userId, callback);
  });
};

/**
 * Obtiene todos los empleados
 * 
 * @param {function} callback - (err, empleados) => { }
 */
const findAllEmpleados = (callback) => {
  const query = 'SELECT id, username, nombre FROM users WHERE rol = ?';
  db.all(query, ['empleado'], (err, empleados) => {
    if (err) {
      console.error('❌ Error en findAllEmpleados:', err);
      return callback(err, null);
    }
    callback(null, empleados);
  });
};

/**
 * Actualiza nombre y username de un empleado
 * 
 * @param {number} id - ID del empleado
 * @param {string} nombre - Nuevo nombre
 * @param {string} username - Nuevo username
 * @param {function} callback - (err, user) => { }
 */
const updateEmpleado = (id, nombre, username, callback) => {
  // Primero verificar que el empleado existe y es rol 'empleado'
  findUserById(id, (err, user) => {
    if (err) return callback(err, null);
    if (!user) return callback(new Error('❌ Empleado no encontrado'), null);
    if (user.rol !== 'empleado') return callback(new Error('❌ Solo se pueden actualizar empleados'), null);

    // Verificar que el nuevo username no esté en uso (excepto el del mismo usuario)
    findUserByUsername(username, (err, existingUser) => {
      if (err) return callback(err, null);
      
      // Si existe otro usuario con este username (y no es el mismo)
      if (existingUser && existingUser.id !== id) {
        return callback(new Error('❌ El username ya está en uso'), null);
      }

      // Proceder con la actualización
      const query = 'UPDATE users SET nombre = ?, username = ? WHERE id = ?';
      db.run(query, [nombre, username, id], (err) => {
        if (err) {
          console.error('❌ Error en updateEmpleado:', err.message);
          return callback(err, null);
        }
        
        // Retornar el empleado actualizado
        findUserById(id, callback);
      });
    });
  });
};

/**
 * Elimina un empleado (verifica que no tenga tareas asignadas)
 * 
 * @param {number} id - ID del empleado
 * @param {function} callback - (err, message) => { }
 */
const deleteEmpleado = (id, callback) => {
  // Primero verificar que el empleado existe
  findUserById(id, (err, user) => {
    if (err) return callback(err, null);
    if (!user) return callback(new Error('❌ Empleado no encontrado'), null);
    if (user.rol !== 'empleado') return callback(new Error('❌ Solo se pueden eliminar empleados'), null);

    // Verificar que no tenga tareas asignadas
    const countQuery = 'SELECT COUNT(*) as count FROM tasks WHERE id_empleado = ?';
    db.get(countQuery, [id], (err, result) => {
      if (err) {
        console.error('❌ Error verificando tareas:', err);
        return callback(err, null);
      }

      if (result.count > 0) {
        return callback(
          new Error(`❌ No se puede eliminar. El empleado tiene ${result.count} tarea(s) asignada(s)`),
          null
        );
      }

      // Proceder con la eliminación
      const query = 'DELETE FROM users WHERE id = ?';
      db.run(query, [id], (err) => {
        if (err) {
          console.error('❌ Error en deleteEmpleado:', err.message);
          return callback(err, null);
        }
        
        callback(null, { message: '✅ Empleado eliminado correctamente' });
      });
    });
  });
};

module.exports = {
  findUserByUsername,
  findUserById,
  createUser,
  findAllEmpleados,
  updateEmpleado,
  deleteEmpleado
};
