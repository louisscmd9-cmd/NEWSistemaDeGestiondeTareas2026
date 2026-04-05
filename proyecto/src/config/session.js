const session = require('express-session');
const path = require('path');
const SQLiteStore = require('connect-sqlite3')(session);

const sessionConfig = session({
  store: new SQLiteStore({
    db: 'sessions.sqlite',
    dir: path.join(__dirname, '../../'),
    table: 'sessions',
    concurrentDB: true,
  }),
  secret: process.env.SESSION_SECRET || 'supersecreto123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // 2 horas
    httpOnly: true,
    secure: false // true solo en HTTPS (producción)
  },
});

module.exports = sessionConfig;
