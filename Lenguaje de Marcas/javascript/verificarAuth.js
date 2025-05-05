// verificarAuth.js - Versión actualizada
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si existe un token en localStorage
    if (!window.authManager || !window.authManager.verificarSesion()) {
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.replace('pagina-login.html');
        return;
    }
    
    // Si llegamos aquí, el usuario está autenticado
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    // Mostrar información del usuario si existen los elementos
    const nicknameElement = document.getElementById('nickname');
    const emailElement = document.getElementById('email');
    const edadElement = document.getElementById('edad');
    
    if (nicknameElement) nicknameElement.textContent = usuario.nickname || 'Usuario';
    if (emailElement) emailElement.textContent = usuario.email || 'Email no disponible';
    if (edadElement) edadElement.textContent = usuario.edad || 'No especificada';
    
    // Función para cerrar sesión
    const btnCerrarSesion = document.getElementById('btnLogout');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            alert('Sesión cerrada correctamente');
            window.location.replace('pagina-login.html');
        });
    }
    
    // Función para cargar datos del perfil desde el servidor si es necesario
    async function cargarDatosPerfil() {
        try {
            const respuesta = await fetch('http://192.168.126.129:8080/api/perfil', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!respuesta.ok) {
                throw new Error('Error al cargar los datos del perfil');
            }
            
            const datos = await respuesta.json();
            
            if (datos.status === 'Success') {
                // Actualizar la información del perfil con los datos del servidor
                console.log('Datos del perfil cargados correctamente:', datos.data);
                
                // Aquí puedes actualizar más elementos de la página con los datos recibidos
                // ...
                
            } else {
                console.error('Error en la respuesta del servidor:', datos.message);
            }
            
        } catch (error) {
            console.error('Error al cargar el perfil:', error);
        }
    }
    
    // Llamar a la función para cargar datos adicionales si es necesario
    cargarDatosPerfil();
});