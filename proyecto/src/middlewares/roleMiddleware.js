/**
 * Middleware de control de roles
 * Verifica que el usuario tenga el rol requerido para acceder a una ruta
 */

/**
 * Middleware factory que crea un verificador de rol específico
 * @param {string|string[]} allowedRoles - Rol(es) permitidos
 * @returns {function} Middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Primero verificar que esté autenticado (esto debería hacerse con authMiddleware)
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        error: 'Acceso no autorizado. Debes iniciar sesión.'
      });
    }

    const userRole = req.session.user.rol;

    // Convertir allowedRoles a array si es string
    const rolesPermitidos = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Verificar si el rol del usuario está en los permitidos
    if (!rolesPermitidos.includes(userRole)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`
      });
    }

    // Rol válido, continuar
    next();
  };
};

/**
 * Middlewares específicos para roles comunes
 */
const requireJefe = requireRole('jefe');
const requireEmpleado = requireRole('empleado');
const requireAdmin = requireRole('admin');
const requireJefeOEmpleado = requireRole(['jefe', 'empleado']);

module.exports = {
  requireRole,
  requireJefe,
  requireEmpleado,
  requireAdmin,
  requireJefeOEmpleado
};
