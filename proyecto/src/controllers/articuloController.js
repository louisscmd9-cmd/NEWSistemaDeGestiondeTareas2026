/**
 * Controlador de Artículos
 */

const articuloModel = require('../models/articuloModel');

/**
 * POST /api/articulos
 * Crear solicitud de artículo (empleado)
 */
const crearArticulo = (req, res) => {
  const { nombre, descripcion, cantidad_requerida } = req.body;
  const user = req.session.user;

  if (!nombre || !descripcion || !cantidad_requerida) {
    return res.status(400).json({
      error: 'Campos requeridos: nombre, descripcion, cantidad_requerida'
    });
  }

  if (isNaN(cantidad_requerida) || cantidad_requerida <= 0) {
    return res.status(400).json({
      error: 'La cantidad debe ser un número mayor a 0'
    });
  }

  articuloModel.crearArticulo(nombre, descripcion, cantidad_requerida, user.id, (err, articulo) => {
    if (err) {
      console.error('Error creando artículo:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    console.log(`✅ Empleado ${user.username} solicitó artículo: "${nombre}"`);

    res.status(201).json({
      message: 'Artículo solicitado exitosamente',
      articulo
    });
  });
};

/**
 * GET /api/articulos
 * Listar artículos
 */
const listarArticulos = (req, res) => {
  const user = req.session.user;

  articuloModel.listarArticulos(user.id, user.rol, (err, articulos) => {
    if (err) {
      console.error('Error listando artículos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.json({
      articulos: articulos || [],
      total: (articulos || []).length
    });
  });
};

/**
 * PATCH /api/articulos/:id
 * Actualizar estado de artículo (jefe)
 */
const actualizarEstado = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const user = req.session.user;

  if (!estado) {
    return res.status(400).json({ error: 'El campo estado es requerido' });
  }

  articuloModel.actualizarEstadoArticulo(id, estado, user.id, (err, articulo) => {
    if (err) {
      console.error('Error actualizando estado:', err);
      return res.status(400).json({ error: err.message });
    }

    console.log(`✅ Jefe ${user.username} actualizó artículo a "${estado}"`);

    res.json({
      message: 'Estado actualizado',
      articulo
    });
  });
};

/**
 * DELETE /api/articulos/:id
 * Eliminar solicitud de artículo
 */
const eliminarArticulo = (req, res) => {
  const { id } = req.params;
  const user = req.session.user;

  articuloModel.eliminarArticulo(id, user.id, (err, result) => {
    if (err) {
      console.error('Error eliminando artículo:', err);
      return res.status(400).json({ error: err.message });
    }

    console.log(`✅ Empleado ${user.username} eliminó solicitud de artículo`);

    res.json(result);
  });
};

module.exports = {
  crearArticulo,
  listarArticulos,
  actualizarEstado,
  eliminarArticulo
};
