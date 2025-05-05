document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando carga del perfil...');
    
    // Variables globales
    let datosUsuario = null;
    const elementos = {};
    
    // Inicializar referencias a elementos DOM
    function inicializarElementosDOM() {
        // Elementos básicos
        ['perfil-info', 'loading', 'estadisticas', 'loading-stats', 'error-message',
         'loading-partidas', 'partidas-container', 'no-partidas', 'partidas-body',
         'nickname', 'email', 'edad', 'total-partidas', 'promedio-puntos', 'mejor-nivel',
         'mejor-puntuacion', 'mejor-puntuacion-fecha', 'mejor-tiempo', 'mejor-tiempo-fecha',
         'btnEditarPerfil', 'modal-editar', 'form-editar-perfil', 'edit-nickname', 
         'edit-email', 'edit-edad', 'btnLogout'].forEach(id => {
            elementos[id] = document.getElementById(id);
        });
        
        elementos.closeModal = document.querySelector('.close');
    }
    
    // Cargar datos del usuario
    function cargarDatosUsuario() {
        const usuarioGuardado = localStorage.getItem('usuario');
        
        if (!usuarioGuardado) {
            console.error('No hay datos de usuario guardados');
            window.location.href = 'pagina-login.html';
            return false;
        }
        
        try {
            datosUsuario = JSON.parse(usuarioGuardado);
            console.log('Datos del usuario encontrados:', datosUsuario);
            return true;
        } catch (error) {
            console.error('Error al parsear datos del usuario:', error);
            window.location.href = 'pagina-login.html';
            return false;
        }
    }
    
    // Funciones auxiliares
    function formatearFecha(fechaStr) {
        return new Date(fechaStr).toLocaleDateString();
    }
    
    function formatearTiempo(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos}:${segs.toString().padStart(2, '0')}`;
    }
    
    function mostrarError(mensaje, esTemporal = true) {
        if (!elementos['error-message']) return;
        
        elementos['error-message'].textContent = mensaje;
        elementos['error-message'].style.display = 'block';
        
        if (esTemporal) {
            setTimeout(() => {
                elementos['error-message'].style.display = 'none';
            }, 5000);
        }
    }
    
    // Mostrar información básica del usuario
    function mostrarInfoBasica() {
        if (elementos.nickname) elementos.nickname.textContent = datosUsuario.nickname || 'No disponible';
        if (elementos.email) elementos.email.textContent = datosUsuario.email || 'No disponible';
        if (elementos.edad) elementos.edad.textContent = datosUsuario.edad || 'No especificada';
        
        if (elementos['edit-nickname']) elementos['edit-nickname'].value = datosUsuario.nickname || '';
        if (elementos['edit-email']) elementos['edit-email'].value = datosUsuario.email || '';
        if (elementos['edit-edad'] && datosUsuario.edad) elementos['edit-edad'].value = datosUsuario.edad;
    }
    
    // Calcular estadísticas
    function calcularEstadisticas(partidas) {
        if (!partidas || partidas.length === 0) return;
        
        const totalPartidas = partidas.length;
        const totalPuntos = partidas.reduce((sum, partida) => sum + (partida.pt_total || 0), 0);
        const promedioPuntos = totalPuntos / totalPartidas;
        
        const niveles = partidas.map(partida => partida.level).filter(Boolean);
        const mejorNivel = niveles.length > 0 ? Math.max(...niveles) : '-';
        
        if (elementos['total-partidas']) elementos['total-partidas'].textContent = totalPartidas;
        if (elementos['promedio-puntos']) elementos['promedio-puntos'].textContent = promedioPuntos.toFixed(2);
        if (elementos['mejor-nivel']) elementos['mejor-nivel'].textContent = mejorNivel;
    }
    
    // Calcular y mostrar récords
    function calcularRecords(partidas) {
        if (!partidas || partidas.length === 0) return;
        
        // Encontrar récords
        const partidaMaxPuntos = partidas.reduce((max, partida) => 
            (partida.pt_total > max.pt_total) ? partida : max, partidas[0]);
        
        const partidasConTiempo = partidas.filter(p => p.time && p.time > 0);
        let partidaMejorTiempo = partidasConTiempo.length > 0 
            ? partidasConTiempo.reduce((min, partida) => (partida.time < min.time) ? partida : min, partidasConTiempo[0])
            : null;
        
        // Mostrar récords
        if (elementos['mejor-puntuacion'] && partidaMaxPuntos) {
            elementos['mejor-puntuacion'].textContent = partidaMaxPuntos.pt_total.toLocaleString();
            elementos['mejor-puntuacion'].classList.add('record-highlight');
            
            if (elementos['mejor-puntuacion-fecha'] && partidaMaxPuntos.fecha) {
                elementos['mejor-puntuacion-fecha'].textContent = formatearFecha(partidaMaxPuntos.fecha);
            }
        }
        
        if (elementos['mejor-tiempo'] && partidaMejorTiempo) {
            elementos['mejor-tiempo'].textContent = formatearTiempo(partidaMejorTiempo.time);
            elementos['mejor-tiempo'].classList.add('record-highlight');
            
            if (elementos['mejor-tiempo-fecha'] && partidaMejorTiempo.fecha) {
                elementos['mejor-tiempo-fecha'].textContent = formatearFecha(partidaMejorTiempo.fecha);
            }
        }
        
        // Resaltar filas en la tabla
        setTimeout(() => resaltarRecordsEnTabla(partidaMaxPuntos, partidaMejorTiempo), 500);
    }
    
    // Resaltar récords en la tabla
    function resaltarRecordsEnTabla(partidaMaxPuntos, partidaMejorTiempo) {
        const partidasBody = elementos['partidas-body'];
        if (!partidasBody) return;
        
        const filas = partidasBody.querySelectorAll('tr');
        
        filas.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            if (celdas.length < 7) return;
            
            const partidaNum = celdas[0].textContent;
            const puntuacion = celdas[6].textContent;
            const tiempo = celdas[5].textContent;
            
            // Resaltar mejor puntuación
            if (partidaMaxPuntos && partidaNum == partidaMaxPuntos.partida && puntuacion == partidaMaxPuntos.pt_total) {
                fila.classList.add('record-puntuacion-fila');
                celdas[6].classList.add('record-puntuacion-celda');
            }
            
            // Resaltar mejor tiempo
            if (partidaMejorTiempo && partidaNum == partidaMejorTiempo.partida && tiempo == partidaMejorTiempo.time) {
                fila.classList.add('record-tiempo-fila');
                celdas[5].classList.add('record-tiempo-celda');
            }
        });
    }
    
    // Llenar tabla de partidas
    function llenarTablaPartidas(partidas) {
        const partidasBody = elementos['partidas-body'];
        if (!partidasBody) {
            console.error('No se encontró el elemento partidasBody');
            return;
        }
        
        // Ordenar partidas por fecha (más reciente primero)
        const partidasOrdenadas = [...partidas].sort((a, b) => {
            return new Date(b.fecha || 0) - new Date(a.fecha || 0);
        });
        
        // Limpiar contenido previo
        partidasBody.innerHTML = '';
        
        // Crear filas para cada partida
        partidasOrdenadas.forEach(partida => {
            const fila = document.createElement('tr');
            
            fila.innerHTML = `
                <td>${partida.partida || '-'}</td>
                <td>${partida.fecha ? formatearFecha(partida.fecha) : '-'}</td>
                <td class="nivel-${partida.level || 'D'}">${partida.level || '-'}</td>
                <td>${partida.kills || 0}</td>
                <td>${partida.deads || 0}</td>
                <td>${partida.time || 0}</td>
                <td>${partida.pt_total || 0}</td>
            `;
            
            partidasBody.appendChild(fila);
        });
        
        // Mostrar tabla y esconder loader
        if (elementos['loading-partidas']) elementos['loading-partidas'].style.display = 'none';
        if (elementos['partidas-container']) elementos['partidas-container'].style.display = 'block';
    }
    
    // Mostrar/ocultar elementos de la interfaz
    function actualizarInterfaz(tienePartidas = false) {
        // Información del perfil
        if (elementos.loading) elementos.loading.style.display = 'none';
        if (elementos['perfil-info']) elementos['perfil-info'].style.display = 'block';
        
        // Estadísticas
        if (elementos['loading-stats']) elementos['loading-stats'].style.display = 'none';
        if (elementos.estadisticas) elementos.estadisticas.style.display = 'block';
        
        // Partidas
        if (!tienePartidas) {
            if (elementos['loading-partidas']) elementos['loading-partidas'].style.display = 'none';
            if (elementos['no-partidas']) elementos['no-partidas'].style.display = 'block';
        }
    }
    
    // Procesar datos del jugador
    function procesarDatosJugador(jugador) {
        // Conservar ID si no viene en la respuesta
        if (!jugador.id && datosUsuario.id) {
            jugador.id = datosUsuario.id;
        }
        
        // Actualizar localStorage
        localStorage.setItem('usuario', JSON.stringify(jugador));
        datosUsuario = jugador;
        
        // Actualizar información en la página
        mostrarInfoBasica();
        
        // Verificar si hay partidas
        if (jugador.partidas && jugador.partidas.length > 0) {
            calcularEstadisticas(jugador.partidas);
            calcularRecords(jugador.partidas);
            llenarTablaPartidas(jugador.partidas);
            actualizarInterfaz(true);
        } else {
            actualizarInterfaz(false);
        }
    }
    
    // Cargar perfil desde la API
    async function cargarPerfilDesdeAPI() {
        try {
            console.log('Intentando cargar datos desde API...');
            const nickname = datosUsuario.nickname;
            
            const respuesta = await fetch(`http://192.168.126.129:8080/api/jugador/nickname/${nickname}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            console.log('Estado de la respuesta:', respuesta.status);
            
            // Verificar tipo de respuesta
            const contentType = respuesta.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn('La respuesta no es JSON. Content-Type:', contentType);
                const textoRespuesta = await respuesta.text();
                console.log('Primeros 100 caracteres:', textoRespuesta.substring(0, 100));
                throw new Error('Respuesta no válida del servidor (no es JSON)');
            }
            
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }
            
            const resultado = await respuesta.json();
            console.log('Datos recibidos:', resultado);
            
            if (resultado.status === "Success" && resultado.data) {
                const jugador = Array.isArray(resultado.data) ? resultado.data[0] : resultado.data;
                console.log('Datos del jugador:', jugador);
                procesarDatosJugador(jugador);
            } else {
                console.warn('No se pudieron cargar datos:', resultado.message);
                actualizarInterfaz(false);
            }
        } catch (error) {
            console.error('Error al cargar datos desde API:', error);
        }
    }
    
    // Cargar perfil
    async function cargarPerfil() {
        // Mostrar datos actuales
        mostrarInfoBasica();
        
        // Verificar si ya tenemos partidas en localStorage
        if (datosUsuario.partidas && datosUsuario.partidas.length > 0) {
            console.log('Partidas encontradas en localStorage:', datosUsuario.partidas);
            calcularEstadisticas(datosUsuario.partidas);
            calcularRecords(datosUsuario.partidas);
            llenarTablaPartidas(datosUsuario.partidas);
            actualizarInterfaz(true);
        }
        
        // Intentar obtener datos actualizados
        await cargarPerfilDesdeAPI();
    }
    
    // Actualizar perfil
    async function actualizarPerfil(event) {
        event.preventDefault();
        
        const email = elementos['edit-email'] ? elementos['edit-email'].value.trim() : '';
        const edad = elementos['edit-edad'] && elementos['edit-edad'].value ? parseInt(elementos['edit-edad'].value) : null;
        
        try {
            const usuarioId = datosUsuario.id;
            if (!usuarioId) throw new Error('ID de usuario no encontrado');
            
            mostrarError('Actualizando datos...', false);
            
            console.log('Datos para actualizar:', { email, edad });
            
            const respuesta = await fetch(`http://192.168.126.129:8080/api/modificarJugador/${usuarioId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, edad })
            });
            
            // Verificar respuesta
            const contentType = respuesta.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textoRespuesta = await respuesta.text();
                console.log('Respuesta no JSON:', textoRespuesta);
                throw new Error('Respuesta no válida del servidor');
            }
            
            const resultado = await respuesta.json();
            console.log('Resultado:', resultado);
            
            if (resultado.status === "Success") {
                // Cerrar modal
                if (elementos['modal-editar']) elementos['modal-editar'].style.display = 'none';
                
                // Actualizar información
                if (elementos.email) elementos.email.textContent = email;
                if (elementos.edad) elementos.edad.textContent = edad || 'No especificada';
                
                // Actualizar localStorage
                datosUsuario.email = email;
                datosUsuario.edad = edad;
                localStorage.setItem('usuario', JSON.stringify(datosUsuario));
                
                mostrarError('Perfil actualizado correctamente');
            } else {
                mostrarError(`Error: ${resultado.message}`);
            }
        } catch (error) {
            console.error('Error al actualizar:', error);
            mostrarError('Error al actualizar. Intenta más tarde.');
        }
    }
    
    // Configurar eventos UI
    function configurarEventosUI() {
        // Editar perfil
        if (elementos.btnEditarPerfil) {
            elementos.btnEditarPerfil.addEventListener('click', () => {
                if (elementos['modal-editar']) elementos['modal-editar'].style.display = 'block';
            });
        }
        
        // Cerrar modal con X
        if (elementos.closeModal) {
            elementos.closeModal.addEventListener('click', () => {
                if (elementos['modal-editar']) elementos['modal-editar'].style.display = 'none';
            });
        }
        
        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (event) => {
            if (elementos['modal-editar'] && event.target === elementos['modal-editar']) {
                elementos['modal-editar'].style.display = 'none';
            }
        });
        
        // Enviar formulario de edición
        if (elementos['form-editar-perfil']) {
            elementos['form-editar-perfil'].addEventListener('submit', actualizarPerfil);
        }
        
        // Cerrar sesión
        if (elementos.btnLogout) {
            elementos.btnLogout.addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                window.location.href = 'pagina-login.html';
            });
        }
    }
    
    // Inicializar
    function inicializar() {
        inicializarElementosDOM();
        if (!cargarDatosUsuario()) return;
        configurarEventosUI();
        cargarPerfil();
    }
    
    // Arrancar la aplicación
    inicializar();
});