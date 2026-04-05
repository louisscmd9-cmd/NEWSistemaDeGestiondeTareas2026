// Cargar artículos solicitados por empleados
async function loadArticulos() {
    try {
        const response = await fetch('/api/articulos');
        if (response.ok) {
            const data = await response.json();
            const articulos = data.articulos || [];
            const articulosList = document.getElementById('articulosList');
            articulosList.innerHTML = '';
            
            if (articulos.length === 0) {
                articulosList.innerHTML = '<p class="text-muted text-sm">Sin solicitudes</p>';
                return;
            }
            
            articulos.forEach(art => {
                const div = document.createElement('div');
                div.className = 'border-bottom pb-2 mb-2';
                div.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <div style="flex:1;">
                            <strong>${art.nombre}</strong>
                            <small class="d-block text-muted">${art.descripcion}</small>
                            <small class="d-block">Cant: ${art.cantidad} | Por: <span class="text-primary">${art.nombre_empleado}</span></small>
                        </div>
                        <select class="form-select form-select-sm" style="width:100px;" onchange="updateArticuloEstado(${art.id}, this.value)">
                            <option value="pendiente" ${art.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="solicitado" ${art.estado === 'solicitado' ? 'selected' : ''}>Solicitado</option>
                            <option value="abastecido" ${art.estado === 'abastecido' ? 'selected' : ''}>Abastecido</option>
                        </select>
                    </div>
                `;
                articulosList.appendChild(div);
            });
        }
    } catch (error) {
        console.error('Error cargando artículos:', error);
    }
}

// Actualizar estado de artículo
async function updateArticuloEstado(id, estado) {
    try {
        const response = await fetch(`/api/articulos/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado })
        });
        
        if (response.ok) {
            loadArticulos();
        } else {
            alert('Error al actualizar');
            loadArticulos();
        }
    } catch (error) {
        alert('Error de conexión');
    }
}

// Cargar empleados para selects
async function loadEmpleados() {
    try {
        const response = await fetch('/api/auth/empleados');
        if (response.ok) {
            const empleados = await response.json();
            
            // Llenar select de creación
            const select = document.getElementById('empleadoId');
            if (select) {
                empleados.forEach(empleado => {
                    const option = document.createElement('option');
                    option.value = empleado.id;
                    option.textContent = empleado.nombre + ' (' + empleado.username + ')';
                    select.appendChild(option);
                });
            }

            // Llenar select de edición
            const editSelect = document.getElementById('editEmpleadoId');
            if (editSelect) {
                empleados.forEach(empleado => {
                    const option = document.createElement('option');
                    option.value = empleado.id;
                    option.textContent = empleado.nombre + ' (' + empleado.username + ')';
                    editSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error cargando empleados:', error);
    }
}

// Crear tarea
async function createTask(e) {
    e.preventDefault();
    
    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const empleadoId = document.getElementById('empleadoId').value;
    const fecha = document.getElementById('fecha').value;
    const recurrente = document.getElementById('recurrente').checked;
    
    if (!fecha) {
        showToast('Debes seleccionar una fecha para la tarea', 'warning');
        return;
    }
    
    if (!empleadoId) {
        showToast('Debes seleccionar un empleado', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                titulo, 
                descripcion, 
                fecha,
                idEmpleado: Number(empleadoId),
                recurrente 
            })
        });
        
        if (response.ok) {
            showToast('✅ Tarea creada exitosamente', 'success');
            document.getElementById('createTaskForm').reset();
            // Establecer fecha por defecto a hoy
            const hoy = new Date().toISOString().split('T')[0];
            document.getElementById('fecha').value = hoy;
            loadTasks();
        } else {
            const data = await response.json();
            showToast(data.error || 'Error al crear tarea', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'error');
    }
}

// Cargar tareas con filtro de fecha
async function loadTasks(fecha = null) {
    try {
        // Usar fecha del filtro o la proporcionada
        const fechaFiltro = fecha || document.getElementById('fechaFiltro').value;
        const url = fechaFiltro ? `/api/tasks?fecha=${fechaFiltro}` : '/api/tasks';
        
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            const tasks = data.tareas || [];
            const tasksList = document.getElementById('tasksList');
            tasksList.innerHTML = '';
            
            if (tasks.length === 0) {
                tasksList.innerHTML = `<p class="text-muted">No hay tareas para ${fechaFiltro || 'hoy'}.</p>`;
                return;
            }
            
            const table = document.createElement('table');
            table.className = 'table table-striped table-sm';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Empleado</th>
                        <th>Estado</th>
                        <th>Explicación</th>
                        <th>Recurrente</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tasksTableBody">
                </tbody>
            `;
            
            const tbody = table.querySelector('tbody');
            tasks.forEach(task => {
                const tr = document.createElement('tr');
                const explicacion = task.estado === 'no_completada' && task.explicacion 
                    ? task.explicacion 
                    : (task.estado === 'no_completada' ? 'Sin especificar' : '-');
                
                tr.innerHTML = `
                    <td>${task.titulo}</td>
                    <td>${task.nombre_empleado}</td>
                    <td><span class="badge bg-info">${task.estado}</span></td>
                    <td>
                        <small class="text-muted">${explicacion}</small>
                    </td>
                    <td>
                        <input type="checkbox" ${task.recurrente ? 'checked' : ''} 
                               onchange="toggleRecurrente(${task.id}, this.checked)" />
                    </td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="openEditModal(${task.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            tasksList.appendChild(table);
        }
    } catch (error) {
        console.error('Error cargando tareas:', error);
    }
}

// Abrir modal de edición
async function openEditModal(taskId) {
    try {
        // Obtener datos de la tarea
        const response = await fetch(`/api/tasks?taskId=${taskId}`);
        if (!response.ok) throw new Error('No se pudo cargar la tarea');

        const data = await response.json();
        const task = data.tareas?.find(t => t.id === taskId);
        
        if (!task) throw new Error('Tarea no encontrada');

        document.getElementById('editTaskId').value = task.id;
        document.getElementById('editTitulo').value = task.titulo;
        document.getElementById('editDescripcion').value = task.descripcion;
        document.getElementById('editEmpleadoId').value = task.id_empleado;

        new bootstrap.Modal(document.getElementById('editTaskModal')).show();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Guardar cambios de la tarea
document.getElementById('saveEditBtn').addEventListener('click', async function() {
    const taskId = document.getElementById('editTaskId').value;
    const titulo = document.getElementById('editTitulo').value;
    const descripcion = document.getElementById('editDescripcion').value;
    const idEmpleado = document.getElementById('editEmpleadoId').value;

    try {
        const response = await fetch(`/api/tasks/${taskId}/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, descripcion, fecha: new Date().toISOString().split('T')[0], idEmpleado: Number(idEmpleado) })
        });

        if (response.ok) {
            alert('Tarea actualizada exitosamente');
            bootstrap.Modal.getInstance(document.getElementById('editTaskModal')).hide();
            loadTasks();
        } else {
            const data = await response.json();
            alert(data.error || 'Error al actualizar');
        }
    } catch (error) {
        alert('Error de conexión');
    }
});

// Eliminar tarea
async function deleteTask(taskId) {
    if (!confirm('¿Está seguro de que desea eliminar esta tarea?')) {
        return;
    }

    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            alert('Tarea eliminada exitosamente');
            loadTasks();
        } else {
            const data = await response.json();
            alert(data.error || 'Error al eliminar');
        }
    } catch (error) {
        alert('Error de conexión');
    }
}

// Toggle recurrente
async function toggleRecurrente(taskId, isRecurrente) {
    try {
        const response = await fetch(`/api/tasks/${taskId}/recurrente`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recurrente: isRecurrente })
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Error al actualizar');
            loadTasks();
        }
    } catch (error) {
        console.error('Error:', error);
        loadTasks();
    }
}

// Event listener único para DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha actual por defecto en el filtro
    const hoy = new Date().toISOString().split('T')[0];
    
    const fechaFiltro = document.getElementById('fechaFiltro');
    if (fechaFiltro) {
        fechaFiltro.value = hoy;
        fechaFiltro.addEventListener('change', function() {
            loadTasks();
        });
    }
    
    // Establecer fecha por defecto en formulario de crear
    const fechaTarea = document.getElementById('fecha');
    if (fechaTarea) {
        fechaTarea.value = hoy;
        fechaTarea.min = hoy;
    }
    
    const createForm = document.getElementById('createTaskForm');
    if (createForm) {
        createForm.addEventListener('submit', createTask);
    }
    
    // Logout button
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
    
    // Cargar datos iniciales
    loadEmpleados();
    loadTasks();
    loadArticulos();
});
