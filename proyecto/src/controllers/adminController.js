const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

/**
 * POST /api/admin/empleados
 * Crea un empleado nuevo (solo admin)
 */
const createEmpleado = (req, res) => {
  const { nombre, username, password } = req.body;

  if (!nombre || !username || !password) {
    return res.status(400).json({ error: 'Nombre, username y password son requeridos' });
  }

  userModel.findUserByUsername(username, (err, existingUser) => {
    if (err) {
      console.error('Error verificando username:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'El username ya existe' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hash password:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      userModel.createUser(nombre, username, hashedPassword, 'empleado', (err, user) => {
        if (err) {
          console.error('Error creando empleado:', err);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.status(201).json({ message: 'Empleado creado', empleado: user });
      });
    });
  });
};

/**
 * GET /api/admin/empleados
 * Lista todos los empleados (solo admin)
 */
const listEmpleados = (req, res) => {
  userModel.findAllEmpleados((err, empleados) => {
    if (err) {
      console.error('Error listando empleados:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(empleados);
  });
};

/**
 * PUT /api/admin/empleados/:id
 * Actualiza un empleado (solo admin)
 */
const updateEmpleado = (req, res) => {
  const { id } = req.params;
  const { nombre, username } = req.body;

  if (!nombre || !username) {
    return res.status(400).json({ error: 'Nombre y username son requeridos' });
  }

  userModel.updateEmpleado(id, nombre, username, (err, updatedUser) => {
    if (err) {
      console.error('Error actualizando empleado:', err);
      return res.status(400).json({ error: err.message });
    }

    res.json({ message: 'Empleado actualizado correctamente', empleado: updatedUser });
  });
};

/**
 * DELETE /api/admin/empleados/:id
 * Elimina un empleado (solo admin)
 */
const deleteEmpleado = (req, res) => {
  const { id } = req.params;

  userModel.deleteEmpleado(id, (err, result) => {
    if (err) {
      console.error('Error eliminando empleado:', err);
      return res.status(400).json({ error: err.message });
    }

    res.json(result);
  });
};

module.exports = {
  createEmpleado,
  listEmpleados,
  updateEmpleado,
  deleteEmpleado
};