/**
 * Script de prueba: Bloque 2 (Models)
 * 
 * Este archivo prueba:
 * - Crear usuarios (jefe y empleado)
 * - Buscar usuario por username
 * - Crear tareas
 * - Listar tareas
 * - Actualizar estado de tarea
 */

const database = require('./src/config/database');
const userModel = require('./src/models/userModel');
const taskModel = require('./src/models/taskModel');

console.log('🧪 Iniciando pruebas de Bloque 2 (Models)\n');

// Esperar a que la base de datos esté lista antes de ejecutar tests
database.onReady(() => {
  startTests();
});

function startTests() {
  // ============================
  // TEST 1: Crear un usuario (jefe)
  // ============================
  console.log('📝 TEST 1: Crear usuario JEFE');
  userModel.createUser('Juan Pérez', 'juan', 'pass123', 'jefe', (err, jefe) => {
    if (err) {
      console.error('❌ Error:', err.message);
      return;
    }
    console.log('✅ Jefe creado:', jefe);
    let idJefe = jefe.id;

    // ============================
    // TEST 2: Crear un usuario (empleado)
    // ============================
    console.log('\n📝 TEST 2: Crear usuario EMPLEADO');
    userModel.createUser('Carlos López', 'carlos', 'pass456', 'empleado', (err, empleado) => {
      if (err) {
        console.error('❌ Error:', err.message);
        return;
      }
      console.log('✅ Empleado creado:', empleado);
      let idEmpleado = empleado.id;

      // ============================
      // TEST 3: Buscar por username
      // ============================
      console.log('\n📝 TEST 3: Buscar usuario por username');
      userModel.findUserByUsername('carlos', (err, user) => {
        if (err) {
          console.error('❌ Error:', err.message);
          return;
        }
        console.log('✅ Usuario encontrado:', user);

        // ============================
        // TEST 4: Crear una tarea
        // ============================
        console.log('\n📝 TEST 4: Crear tarea');
        const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        taskModel.createTask(
          'Completar reporte mensual',
          'Entregar el reporte de ventas del mes anterior',
          hoy,
          idEmpleado,
          (err, tarea) => {
            if (err) {
              console.error('❌ Error:', err.message);
              return;
            }
            console.log('✅ Tarea creada:', tarea);
            let idTarea = tarea.id;

            // ============================
            // TEST 5: Listar tareas de empleado
            // ============================
            console.log('\n📝 TEST 5: Listar tareas del empleado para hoy');
            taskModel.listTasksByEmpleadoYFecha(idEmpleado, hoy, (err, tareas) => {
              if (err) {
                console.error('❌ Error:', err.message);
                return;
              }
              console.log('✅ Tareas encontradas:', tareas);

              // ============================
              // TEST 6: Listar todas las tareas para jefe
              // ============================
              console.log('\n📝 TEST 6: Listar TODAS las tareas para el jefe');
              taskModel.listAllTasksByFecha(hoy, (err, todasLasTareas) => {
                if (err) {
                  console.error('❌ Error:', err.message);
                  return;
                }
                console.log('✅ Todas las tareas:', todasLasTareas);

                // ============================
                // TEST 7: Marcar tarea como completada
                // ============================
                console.log('\n📝 TEST 7: Marcar tarea como COMPLETADA');
                taskModel.updateTaskEstado(idTarea, 'completada', null, (err, tareaActualizada) => {
                  if (err) {
                    console.error('❌ Error:', err.message);
                    return;
                  }
                  console.log('✅ Tarea actualizada:', tareaActualizada);

                  // ============================
                  // TEST 8: Crear segunda tarea para más tests
                  // ============================
                  console.log('\n📝 TEST 8: Crear segunda tarea para pruebas');
                  taskModel.createTask(
                    'Otra tarea de prueba',
                    'Test para error de explicación',
                    hoy,
                    idEmpleado,
                    (err, tarea2) => {
                      if (err) {
                        console.error('❌ Error:', err.message);
                        process.exit(1);
                      }
                      console.log('✅ Segunda tarea creada:', tarea2);

                      // ============================
                      // TEST 9: Intentar NO_COMPLETADA sin explicación (debe fallar)
                      // ============================
                      console.log('\n📝 TEST 9: Intentar NO_COMPLETADA sin explicación (debe fallar)');
                      taskModel.updateTaskEstado(tarea2.id, 'no_completada', '', (err, result) => {
                        if (err) {
                          console.log('✅ Error esperado capturado:', err.message);
                        } else {
                          console.log('❌ No se capturó el error esperado');
                        }

                        // ============================
                        // TEST 10: Marcar como no_completada CON explicación
                        // ============================
                        console.log('\n📝 TEST 10: Marcar como NO_COMPLETADA CON explicación');
                        taskModel.updateTaskEstado(
                          tarea2.id,
                          'no_completada',
                          'No tuve tiempo, muy ocupado con otros proyectos',
                          (err, tareaFallida) => {
                            if (err) {
                              console.error('❌ Error:', err.message);
                              return;
                            }
                            console.log('✅ Tarea marcada no completada:', tareaFallida);

                            console.log('\n🎉 Todos los tests completados!');
                            process.exit(0);
                          }
                        );
                      });
                    }
                  );
                });
              });
            });
          }
        );
      });
    });
  });
}
