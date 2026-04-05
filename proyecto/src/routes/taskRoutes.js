const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { requireJefe, requireEmpleado } = require('../middlewares/roleMiddleware');

// Todas las rutas de tareas requieren autenticación
router.use(requireAuth);

// Crear tarea: solo jefe
router.post('/', requireJefe, taskController.createTask);

// Listar tareas: jefe ve todas, empleado ve las suyas
router.get('/', taskController.listTasks);

// Actualizar estado de tarea: solo empleado asignado
router.put('/:id', requireEmpleado, taskController.updateTaskEstado);

// Actualizar tarea: solo jefe creador (NUEVO)
router.put('/:id/update', requireJefe, taskController.updateTask);

// Eliminar tarea: solo jefe creador (NUEVO)
router.delete('/:id', requireJefe, taskController.deleteTask);

// Toggle recurrente: solo jefe creador (NUEVO)
router.patch('/:id/recurrente', requireJefe, taskController.setTaskRecurrente);

module.exports = router;