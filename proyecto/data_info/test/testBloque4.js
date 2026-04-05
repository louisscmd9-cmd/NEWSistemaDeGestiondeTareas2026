/**
 * Script de prueba: Bloque 4 (Middlewares)
 *
 * Este archivo prueba los middlewares de autenticación y roles
 */

const http = require('http');

// Configuración del servidor
const HOST = 'localhost';
const PORT = 3000;

// Función helper para hacer requests HTTP
function makeRequest(method, path, data = null, sessionCookie = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (sessionCookie) {
      options.headers['Cookie'] = sessionCookie;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body)
          };
          resolve(response);
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Función para extraer cookie de sesión
function extractSessionCookie(response) {
  const setCookie = response.headers['set-cookie'];
  if (setCookie) {
    return setCookie[0].split(';')[0];
  }
  return null;
}

// Tests del Bloque 4
async function runTests() {
  console.log('🧪 Iniciando pruebas de Bloque 4 (Middlewares)\n');

  let sessionCookieJefe = null;
  let sessionCookieEmpleado = null;

  try {
    // ============================
    // TEST 1: Acceder a rutas protegidas sin autenticación
    // ============================
    console.log('📝 TEST 1: Acceder a rutas protegidas sin login');

    // Intentar crear tarea sin login
    let response = await makeRequest('POST', '/api/tasks', {
      titulo: 'Tarea sin login',
      descripcion: 'Esto debería fallar',
      fecha: '2026-04-03',
      idEmpleado: 1
    });
    if (response.status === 401) {
      console.log('✅ Middleware auth bloqueó creación de tarea sin login');
    } else {
      console.log('❌ Error esperado:', response.body);
    }

    // Intentar listar tareas sin login
    response = await makeRequest('GET', '/api/tasks');
    if (response.status === 401) {
      console.log('✅ Middleware auth bloqueó listado de tareas sin login');
    } else {
      console.log('❌ Error esperado:', response.body);
    }

    // ============================
    // TEST 2: Login doble (requireNoAuth)
    // ============================
    console.log('\n📝 TEST 2: Preparando usuarios y probando login doble');

    const database = require('./src/config/database');
    const userModel = require('./src/models/userModel');
    const bcrypt = require('bcrypt');

    // Esperar a que la BD esté lista
    database.onReady(async () => {
      try {
        // Crear usuarios de prueba
        const jefePassword = await bcrypt.hash('jefe123', 10);
        const empleadoPassword = await bcrypt.hash('empleado123', 10);

        const jefe = await new Promise((resolve, reject) => {
          userModel.createUser('María López', 'maria_jefe', jefePassword, 'jefe', (err, user) => {
            if (err) reject(err);
            else resolve(user);
          });
        });

        const empleado = await new Promise((resolve, reject) => {
          userModel.createUser('Carlos Ruiz', 'carlos_empleado', empleadoPassword, 'empleado', (err, user) => {
            if (err) reject(err);
            else resolve(user);
          });
        });

        console.log('✅ Usuarios de prueba creados');

        // Login como jefe
        response = await makeRequest('POST', '/api/auth/login', {
          username: 'maria_jefe',
          password: 'jefe123'
        });
        sessionCookieJefe = extractSessionCookie(response);

        // Intentar login nuevamente (debería fallar por requireNoAuth)
        response = await makeRequest('POST', '/api/auth/login', {
          username: 'maria_jefe',
          password: 'jefe123'
        }, sessionCookieJefe);

        if (response.status === 400 && response.body.error.includes('sesión activa')) {
          console.log('✅ Middleware requireNoAuth bloqueó login doble');
        } else {
          console.log('❌ Error esperado:', response.body);
        }

        // ============================
        // TEST 3: Acceso a rutas de jefe como empleado
        // ============================
        console.log('\n📝 TEST 3: Acceso a rutas de jefe como empleado');

        // Logout jefe
        await makeRequest('POST', '/api/auth/logout', null, sessionCookieJefe);

        // Login como empleado
        response = await makeRequest('POST', '/api/auth/login', {
          username: 'carlos_empleado',
          password: 'empleado123'
        });
        sessionCookieEmpleado = extractSessionCookie(response);

        // Intentar crear tarea como empleado (debería fallar)
        response = await makeRequest('POST', '/api/tasks', {
          titulo: 'Tarea como empleado',
          descripcion: 'Esto debería fallar',
          fecha: '2026-04-03',
          idEmpleado: empleado.id
        }, sessionCookieEmpleado);

        if (response.status === 403 && response.body.error.includes('Solo el jefe')) {
          console.log('✅ Middleware role bloqueó creación de tarea para empleado');
        } else {
          console.log('❌ Error esperado:', response.body);
        }

        // ============================
        // TEST 4: Acceso a rutas de empleado como jefe
        // ============================
        console.log('\n📝 TEST 4: Acceso a rutas de empleado como jefe');

        // Logout empleado
        await makeRequest('POST', '/api/auth/logout', null, sessionCookieEmpleado);

        // Login como jefe nuevamente
        response = await makeRequest('POST', '/api/auth/login', {
          username: 'maria_jefe',
          password: 'jefe123'
        });
        sessionCookieJefe = extractSessionCookie(response);

        // Intentar actualizar tarea como jefe (debería fallar)
        response = await makeRequest('PUT', '/api/tasks/999', {
          estado: 'completada'
        }, sessionCookieJefe);

        if (response.status === 403 && response.body.error.includes('Solo empleados')) {
          console.log('✅ Middleware role bloqueó actualización de tarea para jefe');
        } else {
          console.log('❌ Error esperado:', response.body);
        }

        // ============================
        // TEST 5: Flujo completo autorizado
        // ============================
        console.log('\n📝 TEST 5: Flujo completo autorizado');

        // Jefe crea tarea
        response = await makeRequest('POST', '/api/tasks', {
          titulo: 'Tarea de prueba middleware',
          descripcion: 'Probando middlewares',
          fecha: '2026-04-03',
          idEmpleado: empleado.id
        }, sessionCookieJefe);

        if (response.status === 201) {
          console.log('✅ Jefe pudo crear tarea');
          const tareaId = response.body.tarea.id;

          // Jefe lista tareas
          response = await makeRequest('GET', '/api/tasks?fecha=2026-04-03', null, sessionCookieJefe);
          if (response.status === 200) {
            console.log('✅ Jefe pudo listar tareas');
          }

          // Logout jefe
          await makeRequest('POST', '/api/auth/logout', null, sessionCookieJefe);

          // Login empleado
          response = await makeRequest('POST', '/api/auth/login', {
            username: 'carlos_empleado',
            password: 'empleado123'
          });
          sessionCookieEmpleado = extractSessionCookie(response);

          // Empleado lista sus tareas
          response = await makeRequest('GET', '/api/tasks?fecha=2026-04-03', null, sessionCookieEmpleado);
          if (response.status === 200) {
            console.log('✅ Empleado pudo listar sus tareas');
          }

          // Empleado actualiza tarea
          response = await makeRequest('PUT', `/api/tasks/${tareaId}`, {
            estado: 'completada'
          }, sessionCookieEmpleado);

          if (response.status === 200) {
            console.log('✅ Empleado pudo actualizar tarea');
          }

          // Logout empleado
          await makeRequest('POST', '/api/auth/logout', null, sessionCookieEmpleado);

        } else {
          console.log('❌ Jefe no pudo crear tarea:', response.body);
        }

        console.log('\n🎉 Todos los tests del Bloque 4 completados!');
        process.exit(0);

      } catch (error) {
        console.error('❌ Error en tests:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Error en tests:', error);
    process.exit(1);
  }
}

// Ejecutar tests
runTests();