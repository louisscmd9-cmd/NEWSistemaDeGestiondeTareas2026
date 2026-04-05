const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

/**
 * Controlador de autenticación
 * Maneja login y logout de usuarios
 */

/**
 * POST /api/auth/login
 * Autentica a un usuario y crea sesión
 */
const login = (req, res) => {
  const { username, password } = req.body;

  // Validar que se enviaron los datos requeridos
  if (!username || !password) {
    return res.status(400).json({
      error: 'Usuario y contraseña son requeridos'
    });
  }

  // Buscar usuario por username
  userModel.findUserByUsername(username, (err, user) => {
    if (err) {
      console.error('Error en login:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Si no existe el usuario
    if (!user) {
      return res.status(401).json({
        error: 'Usuario o contraseña incorrectos'
      });
    }

    // Verificar contraseña (comparar con hash)
    bcrypt.compare(password, user.password, (err, isValid) => {
      if (err) {
        console.error('Error comparando contraseña:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (!isValid) {
        return res.status(401).json({
          error: 'Usuario o contraseña incorrectos'
        });
      }

      // Contraseña correcta: crear sesión
      req.session.user = {
        id: user.id,
        nombre: user.nombre,
        username: user.username,
        rol: user.rol
      };

      console.log(`✅ Usuario ${user.username} (${user.rol}) inició sesión`);

      res.json({
        message: 'Login exitoso',
        user: {
          id: user.id,
          nombre: user.nombre,
          username: user.username,
          rol: user.rol
        }
      });
    });
  });
};

/**
 * POST /api/auth/logout
 * Cierra la sesión del usuario
 */
const logout = (req, res) => {
  if (!req.session.user) {
    return res.status(400).json({ error: 'No hay sesión activa' });
  }

  const username = req.session.user.username;

  req.session.destroy((err) => {
    if (err) {
      console.error('Error cerrando sesión:', err);
      return res.status(500).json({ error: 'Error cerrando sesión' });
    }

    console.log(`👋 Usuario ${username} cerró sesión`);
    res.json({ message: 'Sesión cerrada exitosamente' });
  });
};

module.exports = {
  login,
  logout
};
