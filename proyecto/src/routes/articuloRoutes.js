const express = require('express');
const router = express.Router();
const articuloController = require('../controllers/articuloController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { requireJefe, requireEmpleado } = require('../middlewares/roleMiddleware');

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Crear artículo (empleado)
router.post('/', requireEmpleado, articuloController.crearArticulo);

// Listar artículos (ambos roles)
router.get('/', articuloController.listarArticulos);

// Actualizar estado (jefe)
router.patch('/:id', requireJefe, articuloController.actualizarEstado);

// Eliminar artículo (empleado)
router.delete('/:id', requireEmpleado, articuloController.eliminarArticulo);

module.exports = router;
