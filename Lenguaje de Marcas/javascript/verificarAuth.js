
document.addEventListener('DOMContentLoaded', function() {
   
    if (!window.authManager || !window.authManager.verificarSesion()) {
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.replace('pagina-login.html');
        return;
    }
    
    
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    
    const nicknameElement = document.getElementById('nickname');
    const emailElement = document.getElementById('email');
    const edadElement = document.getElementById('edad');
    
    if (nicknameElement) nicknameElement.textContent = usuario.nickname || 'Usuario';
    if (emailElement) emailElement.textContent = usuario.email || 'Email no disponible';
    if (edadElement) edadElement.textContent = usuario.edad || 'No especificada';
    

    const btnCerrarSesion = document.getElementById('btnLogout');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            alert('Sesión cerrada correctamente');
            window.location.replace('pagina-login.html');
        });
    }
    
    async function cargarDatosPerfil() {
        try {
            const respuesta = await fetch('http://192.168.92.130:8080/api/perfil', {
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
                
                console.log('Datos del perfil cargados correctamente:', datos.data);
                
             
           
                
            } else {
                console.error('Error en la respuesta del servidor:', datos.message);
            }
            
        } catch (error) {
            console.error('Error al cargar el perfil:', error);
        }
    }
    
    
    cargarDatosPerfil();
});