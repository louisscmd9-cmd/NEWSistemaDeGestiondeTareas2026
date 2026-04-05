/**
 * Script de prueba: Bloque 3 (Controllers)
 *
 * Este archivo prueba los controllers a través de las rutas HTTP
 * Prueba login, creación de tareas, listado y actualización
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

// Tests del Bloque 3
async function runTests() {
  console.log('🧪 Iniciando pruebas de Bloque 3 (Controllers)\n');

  let sessionCookie = null;

  try {
    // ============================
    // TEST 1: Login con usuario inexistente
    // ============================
    console.log('📝 TEST 1: Login con usuario inexistente');
    let response = await makeRequest('POST', '/api/auth/login', {
      username: 'usuario_inexistente',
      password: 'password123'
    });

    if (response.status === 401) {
      console.log('✅ Error esperado:', response.body.error);
    } else {
      console.log('❌ Respuesta inesperada:', response);
    }

    // ============================
    // TEST 2: Crear usuarios de prueba (usando modelos directamente)
    // ============================
    console.log('\n📝 TEST 2: Preparando usuarios de prueba');
    const database = require('./src/config/database');
    const userModel = require('./src/models/userModel');
    const bcrypt = require('bcrypt');

    // Esperar a que la BD esté lista
    database.onReady(async () => {
      try {
        // Crear jefe (usar username único)
        const jefePassword = await bcrypt.hash('jefe123', 10);
        const jefe = await new Promise((resolve, reject) => {
          userModel.createUser('Ana García', 'ana_jefe', jefePassword, 'jefe', (err, user) => {
            if (err) reject(err);
            else resolve(user);
          });
        });
        console.log('✅ Usuario jefe creado');

        // Crear empleado (usar username único)
        const empleadoPassword = await bcrypt.hash('empleado123', 10);
        const empleado = await new Promise((resolve, reject) => {
          userModel.createUser('Pedro Martínez', 'pedro_empleado', empleadoPassword, 'empleado', (err, user) => {
            if (err) reject(err);
            else resolve(user);
          });
        });
        console.log('✅ Usuario empleado creado');

        // ============================
        // TEST 3: Login exitoso como jefe
        // ============================
        console.log('\n📝 TEST 3: Login exitoso como jefe');
        response = await makeRequest('POST', '/api/auth/login', {
          username: 'ana_jefe',
          password: 'jefe123'
        });

        if (response.status === 200) {
          sessionCookie = extractSessionCookie(response);
          console.log('✅ Login exitoso:', response.body.message);
          console.log('👤 Usuario:', response.body.user.nombre, `(${response.body.user.rol})`);
        } else {
          console.log('❌ Error en login:', response.body);
          return;
        }

        // ============================
        // TEST 4: Crear tarea como jefe
        // ============================
        console.log('\n📝 TEST 4: Crear tarea como jefe');
        const hoy = new Date().toISOString().split('T')[0];
        response = await makeRequest('POST', '/api/tasks', {
          titulo: 'Revisar documentación del proyecto',
          descripcion: 'Verificar que toda la documentación esté completa y actualizada',
          fecha: hoy,
          idEmpleado: empleado.id
        }, sessionCookie);

        if (response.status === 201) {
          console.log('✅ Tarea creada:', response.body.tarea.titulo);
          const tareaId = response.body.tarea.id;
        } else {
          console.log('❌ Error creando tarea:', response.body);
          return;
        }

        // ============================
        // TEST 5: Listar tareas como jefe
        // ============================
        console.log('\n📝 TEST 5: Listar tareas como jefe');
        response = await makeRequest('GET', `/api/tasks?fecha=${hoy}`, null, sessionCookie);

        if (response.status === 200) {
          console.log('✅ Tareas listadas:', response.body.total, 'tareas encontradas');
          if (response.body.tareas.length > 0) {
            console.log('📋 Primera tarea:', response.body.tareas[0].titulo);
          }
        } else {
          console.log('❌ Error listando tareas:', response.body);
        }

        // ============================
        // TEST 6: Logout como jefe
        // ============================
        console.log('\n📝 TEST 6: Logout como jefe');
        response = await makeRequest('POST', '/api/auth/logout', null, sessionCookie);

        if (response.status === 200) {
          console.log('✅ Logout exitoso:', response.body.message);
          sessionCookie = null;
        } else {
          console.log('❌ Error en logout:', response.body);
        }

        // ============================
        // TEST 7: Login como empleado
        // ============================
        console.log('\n📝 TEST 7: Login como empleado');
        response = await makeRequest('POST', '/api/auth/login', {
          username: 'pedro_empleado',
          password: 'empleado123'
        });

        if (response.status === 200) {
          sessionCookie = extractSessionCookie(response);
          console.log('✅ Login exitoso:', response.body.message);
          console.log('👤 Usuario:', response.body.user.nombre, `(${response.body.user.rol})`);
        } else {
          console.log('❌ Error en login:', response.body);
          return;
        }

        // ============================
        // TEST 8: Listar tareas como empleado
        // ============================
        console.log('\n📝 TEST 8: Listar tareas como empleado');
        response = await makeRequest('GET', `/api/tasks?fecha=${hoy}`, null, sessionCookie);

        if (response.status === 200) {
          console.log('✅ Tareas listadas:', response.body.total, 'tareas encontradas');
        } else {
          console.log('❌ Error listando tareas:', response.body);
        }

        // ============================
        // TEST 9: Actualizar estado de tarea como empleado
        // ============================
        console.log('\n📝 TEST 9: Marcar tarea como completada');
        const tareaParaActualizar = response.body.tareas[0];
        if (tareaParaActualizar) {
          response = await makeRequest('PUT', `/api/tasks/${tareaParaActualizar.id}`, {
            estado: 'completada'
          }, sessionCookie);

          if (response.status === 200) {
            console.log('✅ Tarea actualizada:', response.body.tarea.estado);
          } else {
            console.log('❌ Error actualizando tarea:', response.body);
          }
        } else {
          console.log('⚠️ No hay tareas para actualizar');
        }

        // ============================
        // TEST 10: Logout como empleado
        // ============================
        console.log('\n📝 TEST 10: Logout como empleado');
        response = await makeRequest('POST', '/api/auth/logout', null, sessionCookie);

        if (response.status === 200) {
          console.log('✅ Logout exitoso:', response.body.message);
        } else {
          console.log('❌ Error en logout:', response.body);
        }

        console.log('\n🎉 Todos los tests del Bloque 3 completados!');
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