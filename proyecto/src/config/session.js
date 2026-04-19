const session = require('express-session');
const pgPool = require('./postgres');
const PostgresStore = require('connect-pg-simple')(session);

const sessionConfig = session({
  store: new PostgresStore({
    pool: pgPool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'supersecreto123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // 2 horas
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
});

module.exports = sessionConfig;
