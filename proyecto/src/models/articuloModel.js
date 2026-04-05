/**
 * Modelo de Artículos/Materiales
 * Gestión de solicitudes de materiales desde empleados
 */

const db = require('../config/database');

/**
 * Crear solicitud de artículo
 */
const crearArticulo = (nombre, descripcion, cantidad, idEmpleado, callback) => {
  const query = `
    INSERT INTO articulos (nombre, descripcion, cantidad, id_empleado, estado)
    VALUES (?, ?, ?, ?, 'pendiente')
  `;
  
  db.run(query, [nombre, descripcion, cantidad, idEmpleado], function(err) {
    if (err) {
      console.error('❌ Error en crearArticulo:', err.message);
      return callback(err, null);
    }
    
    const articuloId = this.lastID;
    obtenerArticuloById(articuloId, callback);
  });
};

/**
 * Obtener artículo por ID
 */
const obtenerArticuloById = (id, callback) => {
  const query = `
    SELECT a.*, u.nombre as nombre_empleado, u.username as username_empleado
    FROM articulos a
    LEFT JOIN users u ON a.id_empleado = u.id
    WHERE a.id = ?
  `;
  
  db.get(query, [id], (err, articulo) => {
    if (err) {
      console.error('❌ Error en obtenerArticuloById:', err);
      return callback(err, null);
    }
    callback(null, articulo);
  });
};

/**
 * Listar artículos según rol
 * - Empleado: solo ve los suyos
 * - Jefe: ve todos pendientes
 */
const listarArticulos = (idUsuario, rolUsuario, callback) => {
  let query;
  
  if (rolUsuario === 'empleado') {
    query = `
      SELECT a.*, u.nombre as nombre_empleado, u.username as username_empleado
      FROM articulos a
      LEFT JOIN users u ON a.id_empleado = u.id
      WHERE a.id_empleado = ?
      ORDER BY a.fecha_solicitud DESC
    `;
    db.all(query, [idUsuario], callback);
  } else if (rolUsuario === 'jefe') {
    query = `
      SELECT a.*, u.nombre as nombre_empleado, u.username as username_empleado
      FROM articulos a
      LEFT JOIN users u ON a.id_empleado = u.id
      WHERE a.estado IN ('pendiente', 'solicitado')
      ORDER BY a.fecha_solicitud DESC
    `;
    db.all(query, [], callback);
  } else {
    return callback(new Error('Rol no permitido'), null);
  }
};

/**
 * Actualizar estado de artículo
 */
const actualizarEstadoArticulo = (id, nuevoEstado, idJefe, callback) => {
  // Validar estado
  const estadosValidos = ['pendiente', 'solicitado', 'abastecido'];
  if (!estadosValidos.includes(nuevoEstado)) {
    return callback(new Error('Estado inválido'), null);
  }

  let query;
  let params;

  if (nuevoEstado === 'abastecido') {
    query = `
      UPDATE articulos 
      SET estado = ?, id_jefe = ?, fecha_abastecimiento = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    params = [nuevoEstado, idJefe, id];
  } else {
    query = `
      UPDATE articulos 
      SET estado = ?, id_jefe = ?
      WHERE id = ?
    `;
    params = [nuevoEstado, idJefe, id];
  }

  db.run(query, params, (err) => {
    if (err) {
      console.error('❌ Error en actualizarEstadoArticulo:', err.message);
      return callback(err, null);
    }
    
    obtenerArticuloById(id, callback);
  });
};

/**
 * Eliminar solicitud de artículo
 */
const eliminarArticulo = (id, idEmpleado, callback) => {
  // Solo el empleado que lo creó puede eliminar si está pendiente
  const query = `
    DELETE FROM articulos
    WHERE id = ? AND id_empleado = ? AND estado = 'pendiente'
  `;

  db.run(query, [id, idEmpleado], function(err) {
    if (err) {
      console.error('❌ Error en eliminarArticulo:', err.message);
      return callback(err, null);
    }

    if (this.changes === 0) {
      return callback(new Error('No se pudo eliminar el artículo'), null);
    }

    callback(null, { message: '✅ Artículo eliminado' });
  });
};

module.exports = {
  crearArticulo,
  obtenerArticuloById,
  listarArticulos,
  actualizarEstadoArticulo,
  eliminarArticulo
};
