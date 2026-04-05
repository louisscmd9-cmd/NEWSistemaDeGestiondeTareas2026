// Cargar empleados para selects
async function loadEmpleados() {
    try {
        const response = await fetch('/api/auth/empleados');
        if (response.ok) {
            const empleados = await response.json();
            
            // Llenar select de creación
            const select = document.getElementById('empleado_id');
            empleados.forEach(empleado => {
                const option = document.createElement('option');
                option.value = empleado.id;
                option.textContent = empleado.nombre + ' (' + empleado.username + ')';
                select.appendChild(option);
            });

            // Llenar select de edición
            const editSelect = document.getElementById('editEmpleadoId');
            empleados.forEach(empleado => {
                const option = document.createElement('option');
                option.value = empleado.id;
                option.textContent = empleado.nombre + ' (' + empleado.username + ')';
                editSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando empleados:', error);
    }
}

// Crear tarea
document.getElementById('createTaskForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const empleado_id = document.getElementById('empleado_id').value;
    const recurrente = document.getElementById('recurrente').checked;
    
    try {
        const fecha = new Date().toISOString().split('T')[0];
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                titulo, 
                descripcion, 
                fecha, 
                idEmpleado: Number(empleado_id),
                recurrente 
            })
        });
        
        if (response.ok) {
            alert('Tarea creada exitosamente');
            document.getElementById('createTaskForm').reset();
            loadTasks();
        } else {
            const data = await response.json();
            alert(data.error || 'Error al crear tarea');
        }
    } catch (error) {
        alert('Error de conexión');
    }
});

// Cargar tareas
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
            const data = await response.json();
            const tasks = data.tareas || [];
            const tasksList = document.getElementById('tasksList');
            tasksList.innerHTML = '';
            
            if (tasks.length === 0) {
                tasksList.innerHTML = '<p class="text-muted">No hay tareas.</p>';
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
                tr.innerHTML = `
                    <td>${task.titulo}</td>
                    <td>${task.nombre_empleado}</td>
                    <td><span class="badge bg-info">${task.estado}</span></td>
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

// Logout
document.getElementById('logoutBtn').addEventListener('click', async function() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        console.error('Error en logout:', error);
    }
});

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    loadEmpleados();
    loadTasks();
});
