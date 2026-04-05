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
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const cookies = parseSetCookie(res.headers['set-cookie']);
        let jsonBody;
        try { jsonBody = body ? JSON.parse(body) : null; } catch { jsonBody = body; }
        resolve({ status: res.statusCode, body: jsonBody, cookies });
      });
    });

    req.on('error', reject);

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('🧪 Bloque 7: Rol Admin - Creación de empleado');

  const loginAdmin = await makeRequest('/api/auth/login', 'POST', { username: 'admin', password: '123456' });
  if (loginAdmin.status !== 200) throw new Error(`Login admin falló: ${loginAdmin.status}`);
  console.log('✅ Login admin OK');
  const adminCookie = loginAdmin.cookies;

  const username = `emp_new_${Date.now()}`;
  const nuevaPersona = { nombre: 'Empleado Nuevo', username, password: 'pw123' };

  const createResp = await makeRequest('/api/admin/empleados', 'POST', nuevaPersona, adminCookie);
  if (createResp.status !== 201) throw new Error(`Crear empleado falló: ${createResp.status} ${JSON.stringify(createResp.body)}`);
  console.log(`✅ Empleado ${username} creado OK`);

  const listResp = await makeRequest('/api/admin/empleados', 'GET', null, adminCookie);
  if (listResp.status !== 200 || !Array.isArray(listResp.body)) {
    throw new Error(`Listar empleados falló: ${listResp.status} ${JSON.stringify(listResp.body)}`);
  }

  if (!listResp.body.some(u => u.username === username)) {
    throw new Error('Empleado creado no aparece en lista de admin');
  }
  console.log('✅ Empleado aparece en listado de admin');

  // Logout admin
  await makeRequest('/api/auth/logout', 'POST', null, adminCookie);

  const loginNewEmp = await makeRequest('/api/auth/login', 'POST', { username, password: 'pw123' });
  if (loginNewEmp.status !== 200) throw new Error(`Login nuevo empleado falló: ${loginNewEmp.status}`);
  console.log('✅ Login nuevo empleado OK');

  console.log('🎉 Bloque 7 completado: admin crea empleado correctamente y empleado puede loguearse');
}

run().catch(error => {
  console.error('❌ Prueba Bloque 7 falló:', error.message || error);
  process.exit(1);
});