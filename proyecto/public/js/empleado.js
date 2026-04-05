// Cargar tareas asignadas
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
            const data = await response.json();
            const tasks = data.tareas || [];
            const tasksList = document.getElementById('tasksList');
            tasksList.innerHTML = '';
            
            if (tasks.length === 0) {
                tasksList.innerHTML = '<p class="text-muted">No tienes tareas asignadas.</p>';
                return;
            }
            
            const table = document.createElement('table');
            table.className = 'table table-striped';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Fecha Creación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;
            
            const tbody = table.querySelector('tbody');
            tasks.forEach(task => {
                const row = document.createElement('tr');
                const estadoSelect = `
                    <select class="form-select estado-select" data-task-id="${task.id}">
                        <option value="pendiente" ${task.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="completada" ${task.estado === 'completada' ? 'selected' : ''}>Completada</option>
                        <option value="no_completada" ${task.estado === 'no_completada' ? 'selected' : ''}>No completada</option>
                    </select>
                `;
                row.innerHTML = `
                    <td>${task.id}</td>
                    <td>${task.titulo}</td>
                    <td>${task.descripcion}</td>
                    <td>${estadoSelect}</td>
                    <td>${new Date(task.fecha).toLocaleDateString()}</td>
                    <td><button class="btn btn-primary btn-sm update-btn" data-task-id="${task.id}">Actualizar</button></td>
                `;
                tbody.appendChild(row);
            });
            
            tasksList.appendChild(table);
            
            // Agregar event listeners a los botones de actualizar
            document.querySelectorAll('.update-btn').forEach(btn => {
                btn.addEventListener('click', updateTaskEstado);
            });
        }
    } catch (error) {
        console.error('Error cargando tareas:', error);
    }
}

// Actualizar estado de tarea
async function updateTaskEstado(e) {
    const taskId = e.target.getAttribute('data-task-id');
    const select = document.querySelector(`.estado-select[data-task-id="${taskId}"]`);
    const nuevoEstado = select.value;

    if (nuevoEstado === 'no_completada') {
        // Mostrar modal para explicación
        document.getElementById('taskIdForExplicacion').value = taskId;
        const modal = new bootstrap.Modal(document.getElementById('explicacionModal'));
        modal.show();
    } else {
        // Enviar directamente si es completada o pendiente
        await enviarActualizacion(taskId, nuevoEstado, null);
    }
}

// Enviar actualización de tarea
async function enviarActualizacion(taskId, nuevoEstado, explicacion) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: nuevoEstado, explicacion })
        });
        
        if (response.ok) {
            alert('Estado actualizado exitosamente');
            // Cerrar modal si está abierto
            const modal = bootstrap.Modal.getInstance(document.getElementById('explicacionModal'));
            if (modal) modal.hide();
            loadTasks();
        } else {
            const data = await response.json();
            alert(data.error || 'Error al actualizar estado');
        }
    } catch (error) {
        alert('Error de conexión');
    }
}

// Cargar artículos solicitados
async function loadArticulos() {
    try {
        const response = await fetch('/api/articulos');
        if (response.ok) {
            const data = await response.json();
            const articulos = data.articulos || [];
            const articulosList = document.getElementById('articulosList');
            articulosList.innerHTML = '';
            
            if (articulos.length === 0) {
                articulosList.innerHTML = '<p class="text-muted">Sin solicitudes.</p>';
                return;
            }
            
            articulos.forEach(art => {
                const div = document.createElement('div');
                div.className = 'p-2 border-bottom';
                div.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start">
                        <div style="flex: 1;">
                            <strong>${art.nombre}</strong>
                            <p class="mb-0 text-sm">${art.descripcion}</p>
                            <small class="text-muted">Cant: ${art.cantidad} | Estado: <span class="badge bg-info">${art.estado}</span></small>
                        </div>
                        ${art.estado === 'pendiente' ? `<button class="btn btn-danger btn-sm" onclick="deleteArticulo(${art.id})">X</button>` : ''}
                    </div>
                `;
                articulosList.appendChild(div);
            });
        }
    } catch (error) {
        console.error('Error cargando artículos:', error);
    }
}

// Crear artículo
async function createArticulo(e) {
    e.preventDefault();
    const nombre = document.getElementById('articuloNombre').value;
    const descripcion = document.getElementById('articuloDescripcion').value;
    const cantidad = parseInt(document.getElementById('articuloCantidad').value);

    try {
        const response = await fetch('/api/articulos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion, cantidad_requerida: cantidad })
        });
        
        if (response.ok) {
            document.getElementById('articuloForm').reset();
            loadArticulos();
            alert('Artículo solicitado correctamente');
        } else {
            const data = await response.json();
            alert(data.error || 'Error al solicitar artículo');
        }
    } catch (error) {
        alert('Error de conexión');
    }
}

// Eliminar artículo
async function deleteArticulo(id) {
    if (!confirm('¿Eliminar esta solicitud?')) return;
    
    try {
        const response = await fetch(`/api/articulos/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadArticulos();
        } else {
            alert('Error al eliminar');
        }
    } catch (error) {
        alert('Error de conexión');
    }
}

// Confirmar explicación en modal
document.addEventListener('DOMContentLoaded', function() {
    const confirmarBtn = document.getElementById('confirmarExplicacionBtn');
    if (confirmarBtn) {
        confirmarBtn.addEventListener('click', async function() {
            const taskId = document.getElementById('taskIdForExplicacion').value;
            const explicacion = document.getElementById('explicacionText').value;
            
            if (!explicacion || explicacion.trim() === '') {
                alert('Debes ingresar una explicación');
                return;
            }
            
            // Limpiar texto
            document.getElementById('explicacionText').value = '';
            
            await enviarActualizacion(taskId, 'no_completada', explicacion);
        });
    }

    // Form para artículos
    const articuloForm = document.getElementById('articuloForm');
    if (articuloForm) {
        articuloForm.addEventListener('submit', createArticulo);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
            } catch (error) {
                console.error('Error en logout:', error);
            }
        });
    }

    loadTasks();
    loadArticulos();
});
