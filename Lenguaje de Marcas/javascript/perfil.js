// Archivo: javascript/perfil.js
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay un token almacenado
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'pagina-login.html';
        return;
    }

    // Elementos del DOM
    const perfilInfo = document.getElementById('perfil-info');
    const loadingElement = document.getElementById('loading');
    const estadisticasElement = document.getElementById('estadisticas');
    const loadingStatsElement = document.getElementById('loading-stats');
    const errorMessage = document.getElementById('error-message');
    
    // Elementos de información
    const nicknameElement = document.getElementById('nickname');
    const emailElement = document.getElementById('email');
    const edadElement = document.getElementById('edad');
    const totalPartidasElement = document.getElementById('total-partidas');
    const promedioPuntosElement = document.getElementById('promedio-puntos');
    const mejorNivelElement = document.getElementById('mejor-nivel');
    
    // Elementos para editar perfil
    const btnEditarPerfil = document.getElementById('btnEditarPerfil');
    const modalEditar = document.getElementById('modal-editar');
    const closeModal = document.querySelector('.close');
    const formEditarPerfil = document.getElementById('form-editar-perfil');
    const editEmailInput = document.getElementById('edit-email');
    const editEdadInput = document.getElementById('edit-edad');
    
    // Botón de logout
    const btnLogout = document.getElementById('btnLogout');
    
    // Cargar información del perfil
    async function cargarPerfil() {
        try {
            const respuesta = await fetch('http://192.168.92.129:8080/api/perfil', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const resultado = await respuesta.json();
            
            if (resultado.status === "Success") {
                const jugador = resultado.data;
                
                // Mostrar información del perfil
                nicknameElement.textContent = jugador.nickname;
                emailElement.textContent = jugador.email;
                edadElement.textContent = jugador.edad || 'No especificada';
                
                // Preparar datos para editar
                editEmailInput.value = jugador.email;
                editEdadInput.value = jugador.edad || '';
                
                // Calcular estadísticas si hay partidas
                if (jugador.partidas && jugador.partidas.length > 0) {
                    const totalPartidas = jugador.partidas.length;
                    const totalPuntos = jugador.partidas.reduce((sum, partida) => sum + (partida.pt_total || 0), 0);
                    const promedioPuntos = totalPuntos / totalPartidas;
                    
                    // Encontrar el mejor nivel
                    const niveles = jugador.partidas.map(partida => partida.level).filter(Boolean);
                    const mejorNivel = niveles.length > 0 ? Math.max(...niveles) : '-';
                    
                    totalPartidasElement.textContent = totalPartidas;
                    promedioPuntosElement.textContent = promedioPuntos.toFixed(2);
                    mejorNivelElement.textContent = mejorNivel;
                }
                
                // Mostrar secciones de información
                loadingElement.style.display = 'none';
                perfilInfo.style.display = 'block';
                loadingStatsElement.style.display = 'none';
                estadisticasElement.style.display = 'block';
            } else {
                mostrarError(resultado.message);
            }
        } catch (error) {
            mostrarError('Error al cargar el perfil. Intenta más tarde.');
            console.error(error);
        }
    }
    
    // Función para mostrar errores
    function mostrarError(mensaje) {
        errorMessage.textContent = mensaje;
        errorMessage.style.display = 'block';
        
        loadingElement.style.display = 'none';
        loadingStatsElement.style.display = 'none';
        
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
    
    // Abrir modal para editar perfil
    btnEditarPerfil.addEventListener('click', () => {
        modalEditar.style.display = 'block';
    });
    
    // Cerrar modal
    closeModal.addEventListener('click', () => {
        modalEditar.style.display = 'none';
    });
    
    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === modalEditar) {
            modalEditar.style.display = 'none';
        }
    });
    
    // Enviar formulario de edición
    formEditarPerfil.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const email = editEmailInput.value.trim();
        const edad = editEdadInput.value ? parseInt(editEdadInput.value) : null;
        
        try {
            const respuesta = await fetch('http://192.168.92.129:8080/api/actualizar-perfil', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email,
                    edad
                })
            });
            
            const resultado = await respuesta.json();
            
            if (resultado.status === "Success") {
                // Cerrar modal y recargar perfil
                modalEditar.style.display = 'none';
                
                // Actualizar la información en la página
                emailElement.textContent = email;
                edadElement.textContent = edad || 'No especificada';
                
                alert('Perfil actualizado correctamente');
            } else {
                alert(`Error: ${resultado.message}`);
            }
        } catch (error) {
            alert('Error al actualizar el perfil. Intenta más tarde.');
            console.error(error);
        }
    });
    
    // Cerrar sesión
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = 'pagina-login.html';
    });
    
    // Cargar perfil al iniciar
    cargarPerfil();
});