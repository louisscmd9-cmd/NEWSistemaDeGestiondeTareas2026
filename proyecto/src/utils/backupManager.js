const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database.sqlite');
const BACKUP_DIR = path.join(__dirname, '../../backups');

function createBackup() {
  if (!fs.existsSync(DB_PATH)) {
    console.warn('⚠️ No existe base de datos para respaldar');
    return;
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
  }

  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/:/g, '-')
    .replace('T', '_')
    .split('.')[0];
  const backupFile = `db_${timestamp}.sqlite`;
  const backupPath = path.join(BACKUP_DIR, backupFile);

  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`✅ Backup creado: ${backupFile}`);

  // Política de retención: mantener solo los últimos 10 backups
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.sqlite'))
    .sort();

  while (files.length > 10) {
    const fileToDelete = files.shift();
    fs.unlinkSync(path.join(BACKUP_DIR, fileToDelete));
    console.log(`🗑️ Backup antiguo eliminado: ${fileToDelete}`);
  }
}

module.exports = { createBackup };