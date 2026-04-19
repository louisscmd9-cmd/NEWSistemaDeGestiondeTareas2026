const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Error en el pool de PostgreSQL:', err);
});

const initSessionTable = (callback) => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      PRIMARY KEY ("sid")
    ) WITH (OIDS=FALSE);
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
  `;

  pool.query(createTableSQL, (err) => {
    if (err) {
      console.error('Error creando tabla de sesiones:', err);
      if (callback) callback(err);
    } else {
      console.log('✅ Tabla de sesiones verificada/creada en PostgreSQL');
      if (callback) callback(null);
    }
  });
};

module.exports = pool;
module.exports.initSessionTable = initSessionTable;
