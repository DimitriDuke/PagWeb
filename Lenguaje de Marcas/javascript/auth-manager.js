// auth-manager.js - Gestor de autenticación para todo el sitio

// Función para verificar si hay una sesión activa
function verificarSesion() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    // Verificar si hay token y datos de usuario
    return token && usuario && usuario.nickname;
}

// Función para actualizar la interfaz según el estado de autenticación
function actualizarInterfazUsuario() {
    const estaAutenticado = verificarSesion();
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const nombreUsuarioElement = document.getElementById('nombre-usuario');
    
    if (estaAutenticado) {
        // Usuario autenticado
        if (loginButton) loginButton.style.display = 'none';
        if (registerButton) registerButton.style.display = 'none';
        
        // Obtener información del usuario
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        
        // Crear o mostrar elementos para usuario autenticado
        const headerButtons = document.querySelector('.header-buttons');
        
        if (headerButtons) {
            // Si existen los botones de login/registro, reemplazarlos con info de usuario y botón de perfil
            headerButtons.innerHTML = `
                <span id="nombre-usuario">Hola, ${usuario.nickname || 'Usuario'}</span>
                <a href="perfil.html" id="perfil-button">Mi Perfil</a>
                <button id="logout-button">Cerrar Sesión</button>
            `;
            
            // Agregar evento al botón de cerrar sesión
            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', cerrarSesion);
            }
        }
    } else {
        // Usuario no autenticado
        if (loginButton) loginButton.style.display = 'inline-block';
        if (registerButton) registerButton.style.display = 'inline-block';
        
        // Si hay un elemento con nombre de usuario, ocultarlo
        if (nombreUsuarioElement) nombreUsuarioElement.style.display = 'none';
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    alert('Sesión cerrada correctamente');
    
    // Redirigir a la página principal
    window.location.href = 'index.html';
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    actualizarInterfazUsuario();
});

// Exportar funciones para uso global
window.authManager = {
    verificarSesion,
    actualizarInterfazUsuario,
    cerrarSesion
};