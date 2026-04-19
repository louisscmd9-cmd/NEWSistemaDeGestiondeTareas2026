const session = require('express-session');
const path = require('path');

let sessionConfig;

// Si hay DATABASE_URL, usar PostgreSQL (producción en Render)
if (process.env.DATABASE_URL) {
  const pgPool = require('./postgres');
  const PostgresStore = require('connect-pg-simple')(session);

  sessionConfig = session({
    store: new PostgresStore({
      pool: pgPool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'supersecreto123',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  });
} else {
  // Desarrollo local: usar SQLite
  const SQLiteStore = require('connect-sqlite3')(session);

  sessionConfig = session({
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
      maxAge: 1000 * 60 * 60 * 2,
      httpOnly: true,
      secure: false,
    },
  });
}

module.exports = sessionConfig;
