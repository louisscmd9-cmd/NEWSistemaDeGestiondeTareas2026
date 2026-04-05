const db = require('./src/config/database');
db.get('SELECT id,username,rol,password FROM users WHERE username = ?', ['admin'], (err, user) => {
  if (err) {
    console.error('error', err);
  } else {
    console.log('admin user:', user);
  }
  db.close();
});