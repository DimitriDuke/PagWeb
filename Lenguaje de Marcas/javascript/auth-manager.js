

function verificarSesion() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    // Verificar si hay token y datos de usuario
    return token && usuario && usuario.nickname;
}


function actualizarInterfazUsuario() {
    const estaAutenticado = verificarSesion();
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const nombreUsuarioElement = document.getElementById('nombre-usuario');
    
    if (estaAutenticado) {
    
        if (loginButton) loginButton.style.display = 'none';
        if (registerButton) registerButton.style.display = 'none';
        
       
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        
       
        const headerButtons = document.querySelector('.header-buttons');
        
        if (headerButtons) {
          
            headerButtons.innerHTML = `
                <span id="nombre-usuario">Hola, ${usuario.nickname || 'Usuario'}</span>
                <a href="perfil.html" id="perfil-button">Mi Perfil</a>
                <button id="logout-button">Cerrar Sesión</button>
            `;
            
            
            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', cerrarSesion);
            }
        }
    } else {
       
        if (loginButton) loginButton.style.display = 'inline-block';
        if (registerButton) registerButton.style.display = 'inline-block';
        
        
        if (nombreUsuarioElement) nombreUsuarioElement.style.display = 'none';
    }
}


function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    alert('Sesión cerrada correctamente');
    
   
    window.location.href = 'index.html';
}


document.addEventListener('DOMContentLoaded', function() {
    actualizarInterfazUsuario();
});


window.authManager = {
    verificarSesion,
    actualizarInterfazUsuario,
    cerrarSesion
};