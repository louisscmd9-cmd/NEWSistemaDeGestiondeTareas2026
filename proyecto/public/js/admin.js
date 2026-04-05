async function loadEmpleados() {
  try {
    const response = await fetch('/api/admin/empleados');
    if (!response.ok) throw new Error('Error cargando empleados');

    const empleados = await response.json();
    const container = document.getElementById('empleadosList');
    if (empleados.length === 0) {
      container.innerHTML = '<p class="text-muted">Aún no hay empleados.</p>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'table table-sm table-hover';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Username</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="empleadosTbody">
      </tbody>
    `;
    container.innerHTML = '';
    container.appendChild(table);
    
    // Agregar filas de forma segura (evita problemas con caracteres especiales)
    const tbody = document.getElementById('empleadosTbody');
    empleados.forEach(emp => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${emp.nombre}</td>
        <td>${emp.username}</td>
        <td>
          <button class="btn btn-sm btn-warning">Editar</button>
          <button class="btn btn-sm btn-danger">Eliminar</button>
        </td>
      `;
      
      // Agregar event listeners a los botones (forma segura)
      tr.querySelector('.btn-warning').addEventListener('click', () => {
        openEditModal(emp.id, emp.nombre, emp.username);
      });
      
      tr.querySelector('.btn-danger').addEventListener('click', () => {
        deleteEmpleado(emp.id, emp.nombre);
      });
      
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
    document.getElementById('empleadosList').innerHTML = '<p class="text-danger">No se pudieron cargar empleados.</p>';
  }
}

async function createEmpleado(e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/admin/empleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, username, password })
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error creando empleado');
    }

    alert('Empleado creado con éxito');
    e.target.reset();
    loadEmpleados();
  } catch (error) {
    alert(error.message);
  }
}

function openEditModal(id, nombre, username) {
  document.getElementById('editEmpleadoId').value = id;
  document.getElementById('editNombre').value = nombre;
  document.getElementById('editUsername').value = username;
  new bootstrap.Modal(document.getElementById('editEmpleadoModal')).show();
}

async function updateEmpleado() {
  const id = document.getElementById('editEmpleadoId').value;
  const nombre = document.getElementById('editNombre').value;
  const username = document.getElementById('editUsername').value;

  try {
    const response = await fetch(`/api/admin/empleados/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, username })
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error actualizando empleado');
    }

    alert('Empleado actualizado correctamente');
    bootstrap.Modal.getInstance(document.getElementById('editEmpleadoModal')).hide();
    loadEmpleados();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteEmpleado(id, nombre) {
  if (!confirm(`¿Está seguro de que desea eliminar a ${nombre}?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/admin/empleados/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error eliminando empleado');
    }

    alert('Empleado eliminado correctamente');
    loadEmpleados();
  } catch (error) {
    alert(error.message);
  }
}

document.getElementById('createEmpleadoForm').addEventListener('submit', createEmpleado);

document.getElementById('saveEditBtn').addEventListener('click', updateEmpleado);

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  location.assign('/login');
});

document.addEventListener('DOMContentLoaded', loadEmpleados);