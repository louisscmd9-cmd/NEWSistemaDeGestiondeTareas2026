document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Guardar en sessionStorage
            sessionStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirigir según el rol
            if (data.user.rol === 'jefe') {
                window.location.href = '/jefe';
            } else if (data.user.rol === 'empleado') {
                window.location.href = '/empleado';
            } else if (data.user.rol === 'admin') {
                window.location.href = '/admin';
            }
        } else {
            errorMessage.textContent = data.error || 'Error al iniciar sesión';
            errorMessage.style.display = 'block';
            showToast(data.error || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        errorMessage.textContent = 'Error de conexión';
        errorMessage.style.display = 'block';
        showToast('Error de conexión', 'error');
    }
});
