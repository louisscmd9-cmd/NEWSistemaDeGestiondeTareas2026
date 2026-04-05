const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');

// Todas las rutas admin requieren auth + rol admin
router.use(requireAuth);
router.use(requireAdmin);

router.post('/empleados', adminController.createEmpleado);
router.get('/empleados', adminController.listEmpleados);
router.put('/empleados/:id', adminController.updateEmpleado);
router.delete('/empleados/:id', adminController.deleteEmpleado);

module.exports = router;