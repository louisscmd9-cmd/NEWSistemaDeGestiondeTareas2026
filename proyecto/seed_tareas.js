const db = require('./src/config/database');

db.onReady(() => {
  // Obtener ID del jefe (admin con ID 2 normalmente)
  const hoy = new Date().toISOString().split('T')[0];
  const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const pasadoManana = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  const tareas = [
    // Hoy
    { titulo: 'Reunión con cliente', descripcion: 'Discusión de nuevo proyecto', estado: 'pendiente', fecha: hoy, id_empleado: 3, id_jefe: 2, recurrente: 1 },
    { titulo: 'Revisar reportes', descripcion: 'Revisar reportes mensuales', estado: 'pendiente', fecha: hoy, id_empleado: 4, id_jefe: 2, recurrente: 1 },
    { titulo: 'Actualizar documentación', descripcion: 'Docs del sistema', estado: 'pendiente', fecha: hoy, id_empleado: 3, id_jefe: 2, recurrente: 0 },
    
    // Ayer
    { titulo: 'Tarea completada', descripcion: 'Esta fue completada', estado: 'completada', fecha: ayer, id_empleado: 3, id_jefe: 2, recurrente: 0 },
    
    // Mañana
    { titulo: 'Tarea programada', descripcion: 'Para el siguiente día', estado: 'pendiente', fecha: manana, id_empleado: 4, id_jefe: 2, recurrente: 0 },
    
    // Pasado mañana
    { titulo: 'Reunión importante', descripcion: 'Presentación a directivos', estado: 'pendiente', fecha: pasadoManana, id_empleado: 3, id_jefe: 2, recurrente: 0 }
  ];

  let count = 0;
  tareas.forEach(tarea => {
    const query = `INSERT INTO tasks (titulo, descripcion, estado, fecha, id_empleado, id_jefe, recurrente) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [tarea.titulo, tarea.descripcion, tarea.estado, tarea.fecha, tarea.id_empleado, tarea.id_jefe, tarea.recurrente], function(err) {
      if (err) {
        console.error('Error insertando tarea:', err);
      } else {
        console.log(`✅ Tarea "${tarea.titulo}" insertada`);
        count++;
      }
      
      if (count === tareas.length) {
        console.log('✅ Todas las tareas de prueba cargadas');
        process.exit(0);
      }
    });
  });
});
