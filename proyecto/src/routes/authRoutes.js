const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireNoAuth, requireAuth } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const userModel = require('../models/userModel');

// Login: solo si NO está autenticado
router.post('/login', requireNoAuth, authController.login);

// Logout: requiere estar autenticado
router.post('/logout', authController.logout);

// Obtener lista de empleados: requiere ser jefe o admin
router.get('/empleados', requireAuth, requireRole(['jefe', 'admin']), (req, res) => {
  userModel.findAllEmpleados((err, empleados) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener empleados' });
    }
    res.json(empleados);
  });
});

module.exports = router;