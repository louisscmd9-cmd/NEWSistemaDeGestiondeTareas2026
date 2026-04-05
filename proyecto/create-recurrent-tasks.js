/**
 * Script para crear tareas recurrentes automáticamente
 * Maneja recurrencia semanal (7 días)
 * Ejecutar diariamente (idealmente con cron o task scheduler)
 * 
 * Uso: node create-recurrent-tasks.js
 */

const db = require('./src/config/database');

console.log('🔄 Iniciando creación de tareas recurrentes...\n');

db.onReady(() => {
  const today = new Date().toISOString().split('T')[0];

  // Buscar tareas recurrentes que hayan pasado 7 días desde su inicio
  const queryExpired = `
    SELECT * FROM tasks 
    WHERE recurrente = 1 
    AND DATE(fecha_inicio_recurrencia, '+' || dias_recurrencia || ' days') < DATE(?)
  `;

  db.all(queryExpired, [today], (err, expiredTasks) => {
    if (err) {
      console.error('❌ Error:', err);
      process.exit(1);
    }

    if (expiredTasks && expiredTasks.length > 0) {
      console.log(`⏰ Advertencia: ${expiredTasks.length} tareas recurrentes vencidas\n`);
      expiredTasks.forEach(task => {
        const fechaFin = new Date(task.fecha_inicio_recurrencia);
        fechaFin.setDate(fechaFin.getDate() + task.dias_recurrencia);
        console.log(`  📋 "${task.titulo}" (vence: ${fechaFin.toISOString().split('T')[0]})`);
      });
      console.log('\n  💡 El jefe debe decidir si continuar o eliminar la recurrencia\n');
    }

    // Crear copias para tareas recurrentes activas
    const queryActive = `
      SELECT * FROM tasks 
      WHERE recurrente = 1 
      AND DATE(fecha_inicio_recurrencia) <= DATE(?)
      AND DATE(fecha_inicio_recurrencia, '+' || dias_recurrencia || ' days') > DATE(?)
      AND estado = 'pendiente'
    `;

    db.all(queryActive, [today, today], (err, activeTasks) => {
      if (err) {
        console.error('❌ Error:', err);
        process.exit(1);
      }

      if (!activeTasks || activeTasks.length === 0) {
        console.log('✅ No hay tareas recurrentes activas\n');
        process.exit(0);
      }

      console.log(`📅 Tareas recurrentes activas: ${activeTasks.length}\n`);

      let totalInserted = 0;
      let processed = 0;
      const totalToProcess = activeTasks.length;

      activeTasks.forEach(task => {
        const startDate = new Date(task.fecha_inicio_recurrencia);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + task.dias_recurrencia);

        // Crear para hoy y mañana si están en rango
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const datesToCreate = [today, tomorrowStr].filter(date => {
          const d = new Date(date);
          return d >= startDate && d < endDate;
        });

        let datesProcessed = 0;

        datesToCreate.forEach(targetDate => {
          const checkQuery = 'SELECT id FROM tasks WHERE id_jefe = ? AND fecha = ? AND titulo = ? AND id_empleado = ?';
          db.get(checkQuery, [task.id_jefe, targetDate, task.titulo, task.id_empleado], (err, existing) => {
            if (!existing && !err) {
              const insertQuery = `
                INSERT INTO tasks (titulo, descripcion, estado, fecha, id_empleado, id_jefe, recurrente, fecha_inicio_recurrencia, dias_recurrencia)
                VALUES (?, ?, 'pendiente', ?, ?, ?, 1, ?, ?)
              `;

              db.run(insertQuery, [task.titulo, task.descripcion, targetDate, task.id_empleado, task.id_jefe, task.fecha_inicio_recurrencia, task.dias_recurrencia], (err) => {
                if (!err) {
                  totalInserted++;
                  console.log(`  ✅ "${task.titulo}" creada para ${targetDate}`);
                }
              });
            }
            
            datesProcessed++;
            if (datesProcessed === datesToCreate.length) {
              processed++;
              if (processed === totalToProcess) {
                console.log(`\n✅ Total creadas: ${totalInserted} tareas recurrentes\n`);
                process.exit(0);
              }
            }
          });
        });
      });
    });
  });
});

// Timeout de seguridad (10 segundos)
setTimeout(() => {
  console.error('⏱️ Timeout: base de datos no respondió\n');
  process.exit(1);
}, 10000);
