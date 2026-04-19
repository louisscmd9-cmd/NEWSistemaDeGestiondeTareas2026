/**
 * Utilidades compartidas - Lo de Jacinto
 * Toast notifications, helpers, etc.
 */

/**
 * Mostrar notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'warning'
 */
function showToast(message, type = 'success') {
  const zone = document.getElementById('toastZone');
  if (!zone) return alert(message);
  
  const colors = {
    success: 'text-bg-success',
    error: 'text-bg-danger',
    warning: 'text-bg-warning',
    info: 'text-bg-info'
  };
  
  const color = colors[type] || colors.success;
  
  const toast = document.createElement('div');
  toast.className = `toast align-items-center ${color} border-0`;
  toast.role = 'alert';
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  
  zone.appendChild(toast);
  const t = new bootstrap.Toast(toast, { delay: 2200 });
  t.show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

/**
 * Configurar información del usuario en navbar
 * @param {string} username
 * @param {string} rol
 */
function setupUserInfo(username, rol) {
  const userInfo = document.getElementById('userInfo');
  if (userInfo) {
    const roleEmoji = rol === 'admin' ? '👨‍💼' : (rol === 'jefe' ? '👨‍💻' : '👤');
    const roleLabel = {
      admin: 'Administrador',
      jefe: 'Jefe',
      empleado: 'Empleado'
    }[rol] || rol;
    
    userInfo.textContent = `${roleEmoji} ${username} · ${roleLabel}`;
  }
}

/**
 * Cargar información del usuario desde sesión
 */
function loadUserInfoFromSession() {
  const userSession = sessionStorage.getItem('user');
  if (userSession) {
    try {
      const user = JSON.parse(userSession);
      setupUserInfo(user.username, user.rol);
    } catch (e) {
      console.error('Error parsing user session:', e);
    }
  }
}

/**
 * Mostrar loader/spinner
 */
function showLoader(show = true) {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = show ? 'flex' : 'none';
  }
}

/**
 * Formatea fechas
 */
function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Obtener fecha actual en formato YYYY-MM-DD
 */
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Inicializar tooltips y popovers de Bootstrap
 */
function initBootstrapComponents() {
  // Tooltips
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    new bootstrap.Tooltip(el);
  });
  
  // Popovers
  document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => {
    new bootstrap.Popover(el);
  });
}

/**
 * Confirmación segura
 */
function confirmDeletion(message = '¿Estás seguro de eliminar esto?') {
  return new Promise(resolve => {
    if (confirm(message)) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

// Inicializar al cargar página
document.addEventListener('DOMContentLoaded', function() {
  loadUserInfoFromSession();
  initBootstrapComponents();
  
  // Cargar zona de toasts si no existe
  if (!document.getElementById('toastZone')) {
    const toastZone = document.createElement('div');
    toastZone.id = 'toastZone';
    toastZone.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastZone);
  }
});
