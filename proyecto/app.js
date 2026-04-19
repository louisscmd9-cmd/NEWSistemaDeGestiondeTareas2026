require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('./src/config/session');
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const articuloRoutes = require('./src/routes/articuloRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// CLAVE PARA RENDER: Trust proxy (necesario porque Render está detrás de HTTPS proxy)
app.set('trust proxy', 1);

// Middlewares globales
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware (express-session configurado en src/config/session.js)
app.use(session);

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Vistas (si tu proyecto usa template engine, aquí iría el motor. 
// Para archivos HTML locales solo usamos rutas de frontend y/o sendFile)

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/articulos', articuloRoutes);

// Redirigir la raíz al login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Rutas para vistas HTML
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/jefe', (req, res) => {
  if (!req.session.user || req.session.user.rol !== 'jefe') {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'jefe', 'index.html'));
});

app.get('/empleado', (req, res) => {
  if (!req.session.user || req.session.user.rol !== 'empleado') {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'empleado', 'index.html'));
});

app.get('/admin', (req, res) => {
  if (!req.session.user || req.session.user.rol !== 'admin') {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'views', 'admin', 'index.html'));
});

// Manejo de errores simples
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor Express en http://localhost:${PORT}`);
});
