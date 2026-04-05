const http = require('http');

function parseSetCookie(setCookieHeaders) {
  if (!setCookieHeaders) return '';
  if (!Array.isArray(setCookieHeaders)) setCookieHeaders = [setCookieHeaders];
  return setCookieHeaders.map(cookie => cookie.split(';')[0]).join('; ');
}

function makeRequest(path, method = 'GET', data = null, cookie = '') {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (cookie) opts.headers.Cookie = cookie;

    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const cookies = parseSetCookie(res.headers['set-cookie']);
        let jsonBody;
        try {
          jsonBody = body ? JSON.parse(body) : null;
        } catch (err) {
          jsonBody = body;
        }
        resolve({ status: res.statusCode, body: jsonBody, cookies });
      });
    });

    req.on('error', (err) => reject(err));

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('🧪 Bloque 6: Pruebas integradas E2E');

  const today = new Date().toISOString().slice(0, 10);

  // Login jefe
  const loginJefe = await makeRequest('/api/auth/login', 'POST', { username: 'jefe', password: '123456' });
  if (loginJefe.status !== 200) {
    throw new Error(`Login jefe falló: ${loginJefe.status} ${JSON.stringify(loginJefe.body)}`);
  }
  console.log('✅ Login jefe OK');

  let cookieJar = loginJefe.cookies;

  // Obtener un empleado válido desde la API (requiere rol jefe)
  const empleadosResp = await makeRequest('/api/auth/empleados', 'GET', null, cookieJar);
  if (empleadosResp.status !== 200 || !Array.isArray(empleadosResp.body)) {
    throw new Error(`Obtener empleados falló: ${empleadosResp.status} ${JSON.stringify(empleadosResp.body)}`);
  }
  let empleado = empleadosResp.body.find(u => u.username === 'emp1');
  if (!empleado) {
    empleado = empleadosResp.body[0];
  }
  if (!empleado) {
    throw new Error('No hay empleados disponibles para asignar la tarea');
  }

  // Crear tarea como jefe
  const newTask = { titulo: 'Tarea de prueba X', descripcion: 'Prueba bloque 6', fecha: today, idEmpleado: empleado.id };
  const createTask = await makeRequest('/api/tasks', 'POST', newTask, cookieJar);
  if (createTask.status !== 201) {
    throw new Error(`Crear tarea falló: ${createTask.status} ${JSON.stringify(createTask.body)}`);
  }
  const taskId = createTask.body.tarea.id;
  console.log(`✅ Tarea creada con ID ${taskId} para empleado ${empleado.username}`);

  // Listar tareas como jefe
  const listJefe = await makeRequest('/api/tasks', 'GET', null, cookieJar);
  if (listJefe.status !== 200 || !Array.isArray(listJefe.body.tareas)) {
    throw new Error(`Listar tareas jefe falló: ${listJefe.status} ${JSON.stringify(listJefe.body)}`);
  }
  const jefeTasks = listJefe.body.tareas;
  if (!jefeTasks.some(t => t.id === taskId)) {
    throw new Error('Tarea no aparece en el listado de jefe');
  }
  console.log('✅ Listado de tareas jefe contiene la tarea creada');

  // Logout jefe
  await makeRequest('/api/auth/logout', 'POST', null, cookieJar);

  // Login con el mismo empleado al que se asignó la tarea
  const loginEmpleadoAsignado = await makeRequest('/api/auth/login', 'POST', { username: empleado.username, password: '123456' });
  if (loginEmpleadoAsignado.status !== 200) {
    throw new Error(`Login empleado (${empleado.username}) falló: ${loginEmpleadoAsignado.status} ${JSON.stringify(loginEmpleadoAsignado.body)}`);
  }
  cookieJar = loginEmpleadoAsignado.cookies;
  console.log(`✅ Login ${empleado.username} OK`);

  // Listar tareas emp1, debe contener la tarea
  const listEmp = await makeRequest('/api/tasks', 'GET', null, cookieJar);
  if (listEmp.status !== 200 || !Array.isArray(listEmp.body.tareas)) {
    throw new Error(`Listar tareas emp1 falló: ${listEmp.status} ${JSON.stringify(listEmp.body)}`);
  }
  const empTasks = listEmp.body.tareas;
  if (!empTasks.some(t => t.id === taskId)) {
    throw new Error('Tarea no aparece en el listado del empleado');
  }
  console.log('✅ Listado de tareas empleado contiene la tarea asignada');

  // Actualizar estado a completada
  const update = await makeRequest(`/api/tasks/${taskId}`, 'PUT', { estado: 'completada' }, cookieJar);
  if (update.status !== 200 || update.body.tarea.estado !== 'completada') {
    throw new Error(`Actualizar estado falló: ${update.status} ${JSON.stringify(update.body)}`);
  }
  console.log('✅ Estado de tarea actualizado a completada');

  // Repetir listado para confirmar
  const listEmpAfter = await makeRequest('/api/tasks', 'GET', null, cookieJar);
  const updatedTask = listEmpAfter.body.tareas.find(t => t.id === taskId);
  if (!updatedTask || updatedTask.estado !== 'completada') {
    throw new Error('Estado de tarea no se actualizó como esperado');
  }
  console.log('✅ Confirmado: tarea está completada en listado de empleado');

  console.log('\n🎉 Bloque 6 completado. Flujo integrado OK.');
}

run().catch((error) => {
  console.error('❌ Prueba falló:', error.message || error);
  process.exit(1);
});