const db = require('../config/database');

/**
 * Crea una nueva tarea
 * 
 * Regla de negocio (3.4): Las tareas se crean con un estado inicial **pendiente**.
 * 
 * @param {string} titulo - Título de la tarea
 * @param {string} descripcion - Descripción detallada
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {number} idEmpleado - ID del empleado asignado
 * @param {number} idJefe - ID del jefe que crea la tarea
 * @param {boolean} recurrente - Si la tarea es recurrente
 * @param {function} callback - (err, task) => { }
 */
const createTask = (titulo, descripcion, fecha, idEmpleado, idJefe, recurrente, callback) => {
  const query = `
    INSERT INTO tasks (titulo, descripcion, estado, fecha, id_empleado, id_jefe, recurrente, fecha_inicio_recurrencia, dias_recurrencia)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const estado = 'pendiente';
  const recurrenteValue = recurrente ? 1 : 0;
  const fechaInicio = recurrenteValue ? fecha : null;
  const diasRecurrencia = 7;
  
  db.run(query, [titulo, descripcion, estado, fecha, idEmpleado, idJefe, recurrenteValue, fechaInicio, diasRecurrencia], function(err) {
    if (err) {
      console.error('❌ Error en createTask:', err.message);
      return callback(err, null);
    }
    
    const taskId = this.lastID;
    findTaskById(taskId, callback);
  });
};

/**
 * Busca una tarea por su ID (función auxiliar)
 * 
 * @param {number} id - ID de la tarea
 * @param {function} callback - (err, task) => { }
 */
const findTaskById = (id, callback) => {
  const query = 'SELECT * FROM tasks WHERE id = ?';
  db.get(query, [id], (err, task) => {
    if (err) {
      console.error('❌ Error en findTaskById:', err);
      return callback(err, null);
    }
    callback(null, task);
  });
};

/**
 * Lista las tareas de un empleado específico para una fecha determinada
 * 
 * Regla de negocio (4.1 y 4.2):
 * - El sistema muestra únicamente las tareas correspondientes a la **fecha actual**.
 * - Un empleado solo puede visualizar las tareas que le fueron asignadas.
 * 
 * @param {number} idEmpleado - ID del empleado
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {function} callback - (err, tasks) => { }
 */
const listTasksByEmpleadoYFecha = (idEmpleado, fecha, callback) => {
  const query = `
    SELECT * FROM tasks
    WHERE id_empleado = ? AND fecha = ?
    ORDER BY id ASC
  `;
  
  db.all(query, [idEmpleado, fecha], (err, tasks) => {
    if (err) {
      console.error('❌ Error en listTasksByEmpleadoYFecha:', err);
      return callback(err, null);
    }
    
    // tasks es un array (vacío si no hay tareas)
    callback(null, tasks || []);
  });
};

/**
 * Lista TODAS las tareas para una fecha dada (solo para jefe)
 * 
 * Regla de negocio (4.3):
 * - El Jefe puede visualizar todas las tareas creadas para la fecha en curso.
 * 
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {function} callback - (err, tasks) => { }
 */
const listAllTasksByFecha = (fecha, callback) => {
  const query = `
    SELECT t.*, 
           u.nombre AS nombre_empleado, 
           u.username AS username_empleado,
           COALESCE(j.nombre, 'Desconocido') AS nombre_jefe,
           COALESCE(j.username, 'N/A') AS username_jefe
    FROM tasks t
    LEFT JOIN users u ON t.id_empleado = u.id
    LEFT JOIN users j ON t.id_jefe = j.id
    WHERE t.fecha = ?
    ORDER BY t.id ASC
  `;
  
  db.all(query, [fecha], (err, tasks) => {
    if (err) {
      console.error('❌ Error en listAllTasksByFecha:', err);
      return callback(err, null);
    }
    callback(null, tasks || []);
  });
};

/**
 * Actualiza una tarea existente (jefe puede editar tareas pendientes de sus empleados)
 * 
 * @param {number} id - ID de la tarea
 * @param {string} titulo - Nuevo título
 * @param {string} descripcion - Nueva descripción
 * @param {string} fecha - Nueva fecha
 * @param {number} idEmpleado - Nuevo ID de empleado
 * @param {number} idJefe - ID del jefe (quien solicita editar)
 * @param {function} callback - (err, task) => { }
 */
const updateTask = (id, titulo, descripcion, fecha, idEmpleado, idJefe, callback) => {
  // Verificar que la tarea existe
  findTaskById(id, (err, task) => {
    if (err) return callback(err, null);
    if (!task) return callback(new Error('❌ Tarea no encontrada'), null);
    
    // Solo se pueden editar tareas pendientes
    if (task.estado !== 'pendiente') return callback(new Error('❌ Solo se pueden editar tareas pendientes'), null);

    const query = `
      UPDATE tasks 
      SET titulo = ?, descripcion = ?, fecha = ?, id_empleado = ?
      WHERE id = ?
    `;
    
    db.run(query, [titulo, descripcion, fecha, idEmpleado, id], (err) => {
      if (err) {
        console.error('❌ Error en updateTask:', err.message);
        return callback(err, null);
      }
      
      findTaskById(id, callback);
    });
  });
};

/**
 * Elimina una tarea (jefe puede eliminar tareas pendientes de sus empleados)
 * 
 * @param {number} id - ID de la tarea
 * @param {number} idJefe - ID del jefe (quien solicita eliminar)
 * @param {function} callback - (err, result) => { }
 */
const deleteTask = (id, idJefe, callback) => {
  findTaskById(id, (err, task) => {
    if (err) return callback(err, null);
    if (!task) return callback(new Error('❌ Tarea no encontrada'), null);
    
    // El jefe puede eliminar: solo tareas pendientes (no completadas ni no completadas)
    if (task.estado !== 'pendiente') return callback(new Error('❌ Solo se pueden eliminar tareas pendientes'), null);

    const query = 'DELETE FROM tasks WHERE id = ?';
    
    db.run(query, [id], (err) => {
      if (err) {
        console.error('❌ Error en deleteTask:', err.message);
        return callback(err, null);
      }
      
      callback(null, { message: '✅ Tarea eliminada correctamente' });
    });
  });
};

/**
 * Marca/desmarca una tarea como recurrente
 * 
 * @param {number} id - ID de la tarea
 * @param {boolean} recurrente - Valor del flag
 * @param {number} idJefe - ID del jefe (quien solicita cambiar)
 * @param {function} callback - (err, task) => { }
 */
const setTaskRecurrente = (id, recurrente, idJefe, callback) => {
  findTaskById(id, (err, task) => {
    if (err) return callback(err, null);
    if (!task) return callback(new Error('❌ Tarea no encontrada'), null);

    const recurrenteValue = recurrente ? 1 : 0;
    const query = 'UPDATE tasks SET recurrente = ? WHERE id = ?';
    
    db.run(query, [recurrenteValue, id], (err) => {
      if (err) {
        console.error('❌ Error en setTaskRecurrente:', err.message);
        return callback(err, null);
      }
      
      findTaskById(id, callback);
    });
  });
};

/**
 * Crea copias de tareas recurrentes para los próximos 7 días
 * 
 * @param {function} callback - (err, count) => { }
 */
const createRecurrentTasksForTomorrow = (callback) => {
  const today = new Date().toISOString().split('T')[0];

  // Buscar tareas recurrentes activas
  const query = `
    SELECT * FROM tasks 
    WHERE recurrente = 1 AND estado = 'pendiente'
    AND DATE(fecha_inicio_recurrencia) <= DATE(?)
    AND DATE(fecha_inicio_recurrencia, '+' || dias_recurrencia || ' days') >= DATE(?)
  `;

  db.all(query, [today, today], (err, tasks) => {
    if (err) {
      console.error('❌ Error en createRecurrentTasksForTomorrow:', err);
      return callback(err, null);
    }

    if (!tasks || tasks.length === 0) {
      return callback(null, 0);
    }

    let inserted = 0;
    let processed = 0;

    tasks.forEach((task) => {
      // Generar copias para los próximos 7 días desde fecha_inicio_recurrencia
      const startDate = new Date(task.fecha_inicio_recurrencia);
      
      for (let i = 0; i < 7; i++) {
        const targetDate = new Date(startDate);
        targetDate.setDate(targetDate.getDate() + i);
        const targetDateStr = targetDate.toISOString().split('T')[0];

        // No crear si ya existe esa tarea en esa fecha
        const checkQuery = 'SELECT id FROM tasks WHERE id_jefe = ? AND fecha = ? AND titulo = ? AND id_empleado = ?';
        db.get(checkQuery, [task.id_jefe, targetDateStr, task.titulo, task.id_empleado], (err, existing) => {
          if (!existing && !err) {
            const insertQuery = `
              INSERT INTO tasks (titulo, descripcion, estado, fecha, id_empleado, id_jefe, recurrente, fecha_inicio_recurrencia, dias_recurrencia)
              VALUES (?, ?, 'pendiente', ?, ?, ?, 1, ?, ?)
            `;

            db.run(
              insertQuery,
              [task.titulo, task.descripcion, targetDateStr, task.id_empleado, task.id_jefe, task.fecha_inicio_recurrencia, task.dias_recurrencia],
              function(err) {
                if (!err) inserted++;
                processed++;
                if (processed === tasks.length * 7) {
                  callback(null, inserted);
                }
              }
            );
          } else {
            processed++;
            if (processed === tasks.length * 7) {
              callback(null, inserted);
            }
          }
        });
      }
    });
  });
};

/**
 * Actualiza el estado de una tarea
 * 
 * Reglas de negocio (5):
 * - 5.1: Solo el empleado asignado a una tarea puede modificar su estado.
 * - 5.2: Estados válidos: 'pendiente', 'completada', 'no_completada'
 * - 5.3: Si estado = 'no_completada', la explicacion es obligatoria
 * - 5.4: Una vez que una tarea ha sido marcada como completada o no completada,
 *        no puede ser modificada nuevamente.
 * 
 * @param {number} idTask - ID de la tarea
 * @param {string} nuevoEstado - 'completada' o 'no_completada'
 * @param {string|null} explicacion - Requerida si nuevoEstado = 'no_completada'
 * @param {function} callback - (err, cambios) => { }
 */
const updateTaskEstado = (idTask, nuevoEstado, explicacion, callback) => {
  // Validar que el estado sea válido
  const estadosValidos = ['completada', 'no_completada'];
  if (!estadosValidos.includes(nuevoEstado)) {
    return callback(new Error('❌ Estado inválido. Use: completada, no_completada'), null);
  }
  
  // Si es no_completada, validar que explicacion sea proporcionada
  if (nuevoEstado === 'no_completada' && (!explicacion || explicacion.trim() === '')) {
    return callback(new Error('❌ Una explicación es requerida si la tarea no fue completada'), null);
  }
  
  // Primero, verificar el estado actual (regla 5.4: no puede editarse si ya está completada/no_completada)
  findTaskById(idTask, (err, task) => {
    if (err) return callback(err, null);
    if (!task) return callback(new Error('❌ Tarea no encontrada'), null);
    
    // Si la tarea ya fue completada o no completada, no permitir cambios
    if (task.estado !== 'pendiente') {
      return callback(
        new Error('❌ Esta tarea ya fue finalizada y no puede ser modificada'),
        null
      );
    }
    
    // Proceder con la actualización
    let query;
    let params;
    
    if (nuevoEstado === 'completada') {
      // Si se marca como completada, no hay explicación
      query = 'UPDATE tasks SET estado = ? WHERE id = ?';
      params = [nuevoEstado, idTask];
    } else {
      // Si es no_completada, guardar también la explicación
      query = 'UPDATE tasks SET estado = ?, explicacion = ? WHERE id = ?';
      params = [nuevoEstado, explicacion, idTask];
    }
    
    db.run(query, params, function(err) {
      if (err) {
        console.error('❌ Error en updateTaskEstado:', err.message);
        return callback(err, null);
      }
      
      // Retornar la tarea actualizada
      findTaskById(idTask, callback);
    });
  });
};

module.exports = {
  createTask,
  findTaskById,
  listTasksByEmpleadoYFecha,
  listAllTasksByFecha,
  updateTaskEstado,
  updateTask,
  deleteTask,
  setTaskRecurrente,
  createRecurrentTasksForTomorrow
};
