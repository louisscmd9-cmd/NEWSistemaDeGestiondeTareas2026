# Bloque 12 - Sistema de Gestión de Artículos

## Resumen de Cambios

### ✅ Backend
- **src/models/articuloModel.js**: CRUD completo para artículos
- **src/controllers/articuloController.js**: Handlers para POST, GET, PATCH, DELETE
- **src/routes/articuloRoutes.js**: Rutas con control de roles (empleado, jefe)
- **src/config/database.js**: Tabla `articulos` con campos:
  - id, nombre, descripcion, cantidad
  - estado (pendiente, solicitado, abastecido)
  - id_empleado, id_jefe
  - fecha_solicitud, fecha_abastecimiento
- **app.js**: Importado y montado `articuloRoutes`

### ✅ Frontend - Empleado
- **views/empleado/index.html**: Formulario de solicitud en panel lateral
  - Campos: nombre, descripción, cantidad
  - Historial de solicitudes con estado
- **public/js/empleado.js**: 
  - `loadArticulos()`: Carga solicitudes del empleado
  - `createArticulo()`: POST a /api/articulos
  - `deleteArticulo()`: DELETE (solo pendientes)

### ✅ Frontend - Jefe
- **views/jefe/index.html**: Panel de solicitudes pendientes
- **public/js/jefe.js**:
  - `loadArticulos()`: Carga todas las solicitudes (pendiente, solicitado)
  - `updateArticuloEstado()`: PATCH para cambiar estado
  - Dropdown para cambiar estado en tiempo real

## Flujo de Uso

1. **Empleado** puede solicitar artículos via formulario en panel derecho
2. **Empleado** ve historial de sus solicitudes y puede eliminar las pendientes
3. **Jefe** ve todas las solicitudes pendientes/solicitadas en su panel
4. **Jefe** puede cambiar estado:
   - pendiente → solicitado (confirmando que va a ordenar)
   - solicitado → abastecido (cuando llega el material)
5. Estados se sincronizan automáticamente

## Validaciones
- Solo empleados pueden crear artículos
- Solo jefe puede cambiar estados
- Solo empleado puede eliminar si está en pendiente
- Campos requeridos: nombre, descripción, cantidad > 0

## URLs API
- POST /api/articulos - Crear (empleado)
- GET /api/articulos - Listar (empleado: suyas, jefe: todas)
- PATCH /api/articulos/:id - Cambiar estado (jefe)
- DELETE /api/articulos/:id - Eliminar (empleado, pendiente)

## Pruebas Pendientes
1. Abrir servidor: node app.js
2. Login como empleado (emp1 / 123456)
3. Solicitar artículo
4. Logout, login como jefe (jefe / 123456)
5. Ver solicitud y cambiar estado
6. Verificar que se sincronice
