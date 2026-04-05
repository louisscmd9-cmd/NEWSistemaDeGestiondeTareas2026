const taskModel = require('../models/taskModel');
const userModel = require('../models/userModel');

/**
 * Controlador de tareas
 * Maneja creación, listado y actualización de tareas
 */

/**
 * POST /api/tasks
 * Crea una nueva tarea (solo jefe)
 */
const createTask = (req, res) => {
  const { titulo, descripcion, fecha, idEmpleado, recurrente } = req.body;
  const jefe = req.session.user;

  if (!titulo || !descripcion || !fecha || !idEmpleado) {
    return res.status(400).json({
      error: 'Todos los campos son requeridos: titulo, descripcion, fecha, idEmpleado'
    });
  }

  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!fechaRegex.test(fecha)) {
    return res.status(400).json({
      error: 'Formato de fecha inválido. Use YYYY-MM-DD'
    });
  }

  userModel.findUserById(idEmpleado, (err, empleado) => {
    if (err) {
      console.error('Error verificando empleado:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (!empleado) {
      return res.status(400).json({ error: 'Empleado no encontrado' });
    }

    if (empleado.rol !== 'empleado') {
      return res.status(400).json({ error: 'El usuario asignado debe ser un empleado' });
    }

    const isRecurrente = recurrente ? true : false;
    taskModel.createTask(titulo, descripcion, fecha, idEmpleado, jefe.id, isRecurrente, (err, tarea) => {
      if (err) {
        console.error('Error creando tarea:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      console.log(`✅ Jefe ${req.session.user.username} creó tarea "${titulo}"`);

      res.status(201).json({
        message: 'Tarea creada exitosamente',
        tarea: tarea
      });
    });
  });
};

/**
 * GET /api/tasks
 * Lista tareas según el rol del usuario
 */
const listTasks = (req, res) => {
  // El middleware ya verificó autenticación
  const { fecha } = req.query;
  const user = req.session.user;

  // Si no se especifica fecha, usar la fecha actual
  const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

  // Validar formato de fecha
  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!fechaRegex.test(fechaConsulta)) {
    return res.status(400).json({
      error: 'Formato de fecha inválido. Use YYYY-MM-DD'
    });
  }

  if (user.rol === 'jefe') {
    // Jefe: ver todas las tareas del día
    taskModel.listAllTasksByFecha(fechaConsulta, (err, tareas) => {
      if (err) {
        console.error('Error listando tareas para jefe:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      res.json({
        message: `Tareas del día ${fechaConsulta}`,
        tareas: tareas,
        total: tareas.length
      });
    });
  } else {
    // Empleado: ver solo sus tareas del día
    taskModel.listTasksByEmpleadoYFecha(user.id, fechaConsulta, (err, tareas) => {
      if (err) {
        console.error('Error listando tareas para empleado:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      res.json({
        message: `Tus tareas del día ${fechaConsulta}`,
        tareas: tareas,
        total: tareas.length
      });
    });
  }
};

/**
 * PUT /api/tasks/:id
 * Actualiza el estado de una tarea (solo empleado asignado)
 */
const updateTaskEstado = (req, res) => {
  // El middleware ya verificó que es empleado autenticado
  const { id } = req.params;
  const { estado, explicacion } = req.body;
  const user = req.session.user;

  // Validar datos requeridos
  if (!estado) {
    return res.status(400).json({ error: 'El campo estado es requerido' });
  }

  // Validar estado válido
  const estadosValidos = ['completada', 'no_completada'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({
      error: 'Estado inválido. Use: completada o no_completada'
    });
  }

  // Si es no_completada, validar explicación
  if (estado === 'no_completada' && (!explicacion || explicacion.trim() === '')) {
    return res.status(400).json({
      error: 'Una explicación es requerida cuando la tarea no fue completada'
    });
  }

  // Buscar la tarea para verificar que pertenece al empleado
  taskModel.findTaskById(id, (err, tarea) => {
    if (err) {
      console.error('Error buscando tarea:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Verificar que la tarea pertenece al empleado autenticado
    if (tarea.id_empleado !== user.id) {
      return res.status(403).json({
        error: 'No tienes permiso para modificar esta tarea'
      });
    }

    // Actualizar el estado
    taskModel.updateTaskEstado(id, estado, explicacion, (err, tareaActualizada) => {
      if (err) {
        console.error('Error actualizando tarea:', err);
        return res.status(500).json({ error: err.message || 'Error interno del servidor' });
      }

      console.log(`✅ Empleado ${user.username} marcó tarea "${tareaActualizada.titulo}" como ${estado}`);

      res.json({
        message: `Tarea marcada como ${estado}`,
        tarea: tareaActualizada
      });
    });
  });
};

/**
 * PUT /api/tasks/:id/update
 * Actualiza una tarea (solo jefe creador)
 */
const updateTask = (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha, idEmpleado } = req.body;
  const jefe = req.session.user;

  if (!titulo || !descripcion || !fecha || !idEmpleado) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  userModel.findUserById(idEmpleado, (err, empleado) => {
    if (err) return res.status(500).json({ error: 'Error interno' });
    if (!empleado || empleado.rol !== 'empleado') {
      return res.status(400).json({ error: 'Empleado inválido' });
    }

    taskModel.updateTask(id, titulo, descripcion, fecha, idEmpleado, jefe.id, (err, tarea) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      res.json({ message: 'Tarea actualizada', tarea });
    });
  });
};

/**
 * DELETE /api/tasks/:id
 * Elimina una tarea (solo jefe creador)
 */
const deleteTask = (req, res) => {
  const { id } = req.params;
  const jefe = req.session.user;

  taskModel.deleteTask(id, jefe.id, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    res.json(result);
  });
};

/**
 * PATCH /api/tasks/:id/recurrente
 * Marca/desmarca una tarea como recurrente
 */
const setTaskRecurrente = (req, res) => {
  const { id } = req.params;
  const { recurrente } = req.body;
  const jefe = req.session.user;

  taskModel.setTaskRecurrente(id, recurrente, jefe.id, (err, tarea) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    res.json({ message: 'Estado de recurrencia actualizado', tarea });
  });
};

module.exports = {
  createTask,
  listTasks,
  updateTaskEstado,
  updateTask,
  deleteTask,
  setTaskRecurrente
};
