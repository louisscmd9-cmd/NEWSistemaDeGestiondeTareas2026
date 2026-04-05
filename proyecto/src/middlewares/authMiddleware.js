/**
 * Middleware de autenticación
 * Verifica que el usuario esté logueado (tiene sesión activa)
 */

/**
 * Middleware que verifica si el usuario está autenticado
 * Si no está autenticado, devuelve error 401
 * Si está autenticado, continúa con la siguiente función
 */
const requireAuth = (req, res, next) => {
  // Verificar si existe sesión de usuario
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      error: 'Acceso no autorizado. Debes iniciar sesión.'
    });
  }

  // Usuario autenticado, continuar
  next();
};

/**
 * Middleware que verifica si NO está autenticado
 * Útil para rutas como login (no permitir acceso si ya está logueado)
 */
const requireNoAuth = (req, res, next) => {
  // Si ya está autenticado, redirigir o devolver error
  if (req.session && req.session.user) {
    return res.status(400).json({
      error: 'Ya tienes una sesión activa.'
    });
  }

  // No está autenticado, continuar
  next();
};

module.exports = {
  requireAuth,
  requireNoAuth
};
