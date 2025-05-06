// Archivo: javascript/chat-flotante.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando chat flotante...');
    
    // Referencias a elementos DOM
    const elementos = {
        chatContainer: document.getElementById('chat-flotante'),
        chatButton: document.getElementById('chat-button'),
        chatPanel: document.getElementById('chat-panel'),
        chatBadge: document.getElementById('chat-badge'),
        chatMinimize: document.getElementById('chat-minimize'),
        
        // Vistas
        conversationsView: document.getElementById('chat-conversations'),
        messagesView: document.getElementById('chat-messages'),
        
        // Lista de usuarios
        loadingConversations: document.getElementById('chat-loading-conversations'),
        noMessages: document.getElementById('chat-no-messages'),
        usersList: document.getElementById('chat-users-list'),
        
        // Conversación
        backButton: document.getElementById('chat-back'),
        currentUser: document.getElementById('chat-current-user'),
        loadingMessages: document.getElementById('chat-loading-messages'),
        messageContainer: document.getElementById('chat-message-container'),
        chatInput: document.getElementById('chat-input'),
        sendButton: document.getElementById('chat-send'),
        
        // Búsqueda de usuarios
        newMessageBtn: document.getElementById('new-message-btn'),
        searchContainer: document.getElementById('chat-search-container'),
        userSearch: document.getElementById('user-search'),
        searchResults: document.getElementById('search-results'),
        cancelSearch: document.getElementById('cancel-search')
    };
    
    // Estado del chat
    const chatState = {
        open: false,
        currentView: 'conversations', // 'conversations' o 'messages'
        currentUserId: null,
        currentUserName: '',
        currentUserMessages: [],
        conversaciones: [],
        intervalId: null,
        totalNoLeidos: 0
    };
    
    // Verificar si el usuario está autenticado
    function verificarAutenticacion() {
        // Usamos la función del auth-manager para verificar si hay sesión
        if (window.authManager && typeof window.authManager.verificarSesion === 'function') {
            return window.authManager.verificarSesion();
        } else {
            // Verificación manual si no está disponible authManager
            const token = localStorage.getItem('token');
            const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
            return token && usuario && usuario.nickname;
        }
    }
    
    // Mostrar/ocultar el chat según la autenticación
    function inicializarVisibilidad() {
        const autenticado = verificarAutenticacion();
        if (elementos.chatContainer) {
            elementos.chatContainer.style.display = autenticado ? 'block' : 'none';
        }
    }
    
    // Formatear fecha para mostrar en mensajes
    function formatearFecha(fechaStr) {
        const fecha = new Date(fechaStr);
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);
        
        // Formato de hora
        const horas = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        const horaFormateada = `${horas}:${minutos}`;
        
        // Verificar si es hoy, ayer o mostrar fecha completa
        if (fecha.toDateString() === hoy.toDateString()) {
            return `Hoy ${horaFormateada}`;
        } else if (fecha.toDateString() === ayer.toDateString()) {
            return `Ayer ${horaFormateada}`;
        } else {
            const dia = fecha.getDate().toString().padStart(2, '0');
            const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
            return `${dia}/${mes} ${horaFormateada}`;
        }
    }
    
    // Obtener datos del usuario actual
    function obtenerDatosUsuario() {
        try {
            const usuarioGuardado = localStorage.getItem('usuario');
            if (!usuarioGuardado) {
                return null;
            }
            return JSON.parse(usuarioGuardado);
        } catch (error) {
            console.error('Error al obtener datos de usuario:', error);
            return null;
        }
    }
    
    // Cargar todos los usuarios
    async function cargarTodosUsuarios() {
        try {
            elementos.searchResults.innerHTML = '<div class="search-info">Cargando usuarios...</div>';
            
            const respuesta = await fetch('http://192.168.126.130:8080/api/jugador', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }
            
            const resultado = await respuesta.json();
            
            if (resultado.status === "Success" && resultado.data) {
                mostrarUsuariosEncontrados(resultado.data);
            } else {
                elementos.searchResults.innerHTML = '<div class="search-info">No se encontraron usuarios</div>';
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            elementos.searchResults.innerHTML = '<div class="search-info">Error al cargar usuarios</div>';
        }
    }
    
    // Mostrar usuarios encontrados
    function mostrarUsuariosEncontrados(usuarios) {
        elementos.searchResults.innerHTML = '';
        
        if (!usuarios || usuarios.length === 0) {
            elementos.searchResults.innerHTML = '<div class="search-info">No se encontraron usuarios</div>';
            return;
        }
        
        // Filtrar el usuario actual
        const usuarioActual = obtenerDatosUsuario();
        const usuariosFiltrados = usuarios.filter(u => {
            return u._id !== usuarioActual.id && u.nickname !== usuarioActual.nickname;
        });
        
        if (usuariosFiltrados.length === 0) {
            elementos.searchResults.innerHTML = '<div class="search-info">No hay otros usuarios disponibles</div>';
            return;
        }
        
        // Mostrar usuarios
        usuariosFiltrados.forEach(usuario => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.dataset.userId = usuario._id;
            item.dataset.userName = usuario.nickname;
            
            item.innerHTML = `
                <div class="search-user-name">${usuario.nickname}</div>
                <div class="search-user-email">${usuario.email || ''}</div>
            `;
            
            item.addEventListener('click', () => {
                abrirConversacion(usuario._id, usuario.nickname);
                ocultarBusquedaUsuarios();
            });
            
            elementos.searchResults.appendChild(item);
        });
    }
    
    // Mostrar búsqueda de usuarios
    function mostrarBusquedaUsuarios() {
        if (elementos.searchContainer) {
            elementos.searchContainer.style.display = 'block';
        }
        
        if (elementos.userSearch) {
            elementos.userSearch.focus();
        }
        
        // Cargar todos los usuarios
        cargarTodosUsuarios();
    }
    
    // Ocultar búsqueda de usuarios
    function ocultarBusquedaUsuarios() {
        if (elementos.searchContainer) {
            elementos.searchContainer.style.display = 'none';
        }
    }
    
    // Cargar conversaciones del usuario
    async function cargarConversaciones() {
        try {
            const usuario = obtenerDatosUsuario();
            if (!usuario || !usuario.id) {
                console.error('No se puede cargar conversaciones: Usuario no encontrado');
                return;
            }
            
            elementos.loadingConversations.style.display = 'block';
            elementos.noMessages.style.display = 'none';
            elementos.usersList.innerHTML = '';
            
            const respuesta = await fetch(`http://192.168.126.130:8080/api/mensajes/conversaciones/${usuario.id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }
            
            const resultado = await respuesta.json();
            
            if (resultado.status === "Success" && resultado.data) {
                chatState.conversaciones = resultado.data;
                mostrarConversaciones(resultado.data);
                actualizarContadorNoLeidos();
            } else {
                console.warn('No se pudieron cargar conversaciones:', resultado.message);
                elementos.noMessages.style.display = 'block';
            }
            
            elementos.loadingConversations.style.display = 'none';
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
            elementos.loadingConversations.style.display = 'none';
            elementos.noMessages.style.display = 'block';
        }
    }
    
    // Mostrar lista de conversaciones
    function mostrarConversaciones(conversaciones) {
        elementos.usersList.innerHTML = '';
        
        if (!conversaciones || conversaciones.length === 0) {
            elementos.noMessages.style.display = 'block';
            return;
        }
        
        elementos.noMessages.style.display = 'none';
        
        conversaciones.forEach(conv => {
            const elemento = document.createElement('li');
            elemento.className = 'chat-user-item';
            elemento.dataset.userId = conv.usuarioId;
            
            // Crear contenido del elemento
            elemento.innerHTML = `
                <div class="chat-user-info">
                    <div class="chat-user-name">${conv.nickname || 'Usuario'}</div>
                    <div class="chat-last-message">${formatearFecha(conv.ultimoMensaje)}</div>
                </div>
                ${conv.mensajesNoLeidos > 0 ? 
                    `<div class="chat-user-unread">${conv.mensajesNoLeidos}</div>` : 
                    ''}
            `;
            
            // Evento para abrir la conversación
            elemento.addEventListener('click', () => abrirConversacion(conv.usuarioId, conv.nickname));
            
            elementos.usersList.appendChild(elemento);
        });
    }
    
    // Actualizar contador de mensajes no leídos
    function actualizarContadorNoLeidos() {
        const totalNoLeidos = chatState.conversaciones.reduce((total, conv) => 
            total + (conv.mensajesNoLeidos || 0), 0);
        
        chatState.totalNoLeidos = totalNoLeidos;
        
        if (totalNoLeidos > 0) {
            elementos.chatBadge.textContent = totalNoLeidos > 9 ? '9+' : totalNoLeidos;
            elementos.chatBadge.style.display = 'flex';
        } else {
            elementos.chatBadge.style.display = 'none';
        }
    }
    
    // Abrir conversación con un usuario
    async function abrirConversacion(usuarioId, nombreUsuario) {
        try {
            const usuario = obtenerDatosUsuario();
            if (!usuario || !usuario.id) {
                console.error('No se puede abrir conversación: Usuario no encontrado');
                return;
            }
            
            chatState.currentUserId = usuarioId;
            chatState.currentUserName = nombreUsuario || 'Usuario';
            
            // Cambiar vista
            elementos.conversationsView.style.display = 'none';
            elementos.messagesView.style.display = 'flex';
            chatState.currentView = 'messages';
            
            // Actualizar nombre del usuario
            elementos.currentUser.textContent = chatState.currentUserName;
            
            // Mostrar loader
            elementos.loadingMessages.style.display = 'block';
            elementos.messageContainer.innerHTML = '';
            
            // Cargar mensajes
            const respuesta = await fetch(`http://192.168.126.130:8080/api/mensajes/conversacion/${usuario.id}/${usuarioId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }
            
            const resultado = await respuesta.json();
            
            if (resultado.status === "Success" && resultado.data) {
                chatState.currentUserMessages = resultado.data;
                mostrarMensajes(resultado.data);
                
                // Marcar mensajes como leídos
                marcarMensajesComoLeidos(usuarioId, usuario.id);
            } else {
                console.warn('No se pudieron cargar mensajes:', resultado.message);
                elementos.messageContainer.innerHTML = '<div class="chat-no-messages">No hay mensajes</div>';
            }
            
            elementos.loadingMessages.style.display = 'none';
            
            // Enfocar el input
            elementos.chatInput.focus();
        } catch (error) {
            console.error('Error al abrir conversación:', error);
            elementos.loadingMessages.style.display = 'none';
            elementos.messageContainer.innerHTML = '<div class="chat-no-messages">Error al cargar mensajes</div>';
        }
    }
    
    // Mostrar mensajes en la conversación
    function mostrarMensajes(mensajes) {
        elementos.messageContainer.innerHTML = '';
        
        if (!mensajes || mensajes.length === 0) {
            elementos.messageContainer.innerHTML = '<div class="chat-no-messages">No hay mensajes</div>';
            return;
        }
        
        const usuario = obtenerDatosUsuario();
        if (!usuario || !usuario.id) return;
        
        mensajes.forEach(mensaje => {
            const esMio = mensaje.emisorId === usuario.id || mensaje.emisorId._id === usuario.id;
            
            const elemento = document.createElement('div');
            elemento.className = `chat-message ${esMio ? 'chat-message-sent' : 'chat-message-received'}`;
            
            elemento.innerHTML = `
                <div class="chat-message-text">${mensaje.contenido}</div>
                <div class="chat-message-time">${formatearFecha(mensaje.fechaEnvio)}</div>
            `;
            
            elementos.messageContainer.appendChild(elemento);
        });
        
        // Scroll al último mensaje
        elementos.messageContainer.scrollTop = elementos.messageContainer.scrollHeight;
    }
    
    // Marcar mensajes como leídos
    async function marcarMensajesComoLeidos(emisorId, receptorId) {
        try {
            const respuesta = await fetch(`http://192.168.126.130:8080/api/mensajes/marcar-leidos/${emisorId}/${receptorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }
            
            const resultado = await respuesta.json();
            
            if (resultado.status === "Success") {
                console.log('Mensajes marcados como leídos');
                
                // Actualizar contador de no leídos en el estado
                chatState.conversaciones = chatState.conversaciones.map(conv => {
                    if (conv.usuarioId === emisorId) {
                        return { ...conv, mensajesNoLeidos: 0 };
                    }
                    return conv;
                });
                
                actualizarContadorNoLeidos();
            } else {
                console.warn('No se pudieron marcar mensajes como leídos:', resultado.message);
            }
        } catch (error) {
            console.error('Error al marcar mensajes como leídos:', error);
        }
    }
    
    // Enviar mensaje
    async function enviarMensaje() {
        try {
            const contenido = elementos.chatInput.value.trim();
            if (!contenido) return;
            
            const usuario = obtenerDatosUsuario();
            if (!usuario || !usuario.id || !chatState.currentUserId) {
                console.error('No se puede enviar mensaje: Datos de usuario incompletos');
                return;
            }
            
            // Limpiar input
            elementos.chatInput.value = '';
            
            // Mostrar mensaje en la interfaz (optimista)
            const mensajeLocal = {
                emisorId: usuario.id,
                receptorId: chatState.currentUserId,
                contenido: contenido,
                fechaEnvio: new Date(),
                leido: false
            };
            
            chatState.currentUserMessages.push(mensajeLocal);
            mostrarMensajes(chatState.currentUserMessages);
            
            // Enviar a la API
            const respuesta = await fetch('http://192.168.126.130:8080/api/mensajes/enviar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emisorId: usuario.id,
                    receptorId: chatState.currentUserId,
                    contenido: contenido
                })
            });
            
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }
            
            const resultado = await respuesta.json();
            
            if (resultado.status === "Success") {
                console.log('Mensaje enviado correctamente');
                
                // Actualizar conversaciones en segundo plano
                setTimeout(() => {
                    cargarConversaciones();
                }, 1000);
            } else {
                console.warn('Error al enviar mensaje:', resultado.message);
                alert('Error al enviar mensaje. Intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            alert('Error de conexión. Intenta más tarde.');
        }
    }
    
    // Volver a la lista de conversaciones
    function volverAConversaciones() {
        chatState.currentView = 'conversations';
        chatState.currentUserId = null;
        chatState.currentUserName = '';
        
        elementos.conversationsView.style.display = 'block';
        elementos.messagesView.style.display = 'none';
        
        // Recargar conversaciones
        cargarConversaciones();
    }
    
    // Abrir/cerrar panel de chat
    function toggleChatPanel() {
        chatState.open = !chatState.open;
        
        if (chatState.open) {
            elementos.chatPanel.style.display = 'flex';
            
            // Si estaba en la vista de mensajes, volver a conversaciones
            if (chatState.currentView === 'messages') {
                volverAConversaciones();
            } else {
                cargarConversaciones();
            }
            
            // Iniciar intervalo para actualizar conversaciones
            chatState.intervalId = setInterval(cargarConversaciones, 10000); // Cada 10 segundos
        } else {
            elementos.chatPanel.style.display = 'none';
            
            // Limpiar intervalo
            if (chatState.intervalId) {
                clearInterval(chatState.intervalId);
                chatState.intervalId = null;
            }
        }
    }
    
    // Configurar eventos
    function configurarEventos() {
        // Abrir/cerrar chat
        if (elementos.chatButton) {
            elementos.chatButton.addEventListener('click', toggleChatPanel);
        }
        
        // Minimizar chat
        if (elementos.chatMinimize) {
            elementos.chatMinimize.addEventListener('click', () => {
                chatState.open = false;
                elementos.chatPanel.style.display = 'none';
                
                // Limpiar intervalo
                if (chatState.intervalId) {
                    clearInterval(chatState.intervalId);
                    chatState.intervalId = null;
                }
            });
        }
        
        // Volver a conversaciones
        if (elementos.backButton) {
            elementos.backButton.addEventListener('click', volverAConversaciones);
        }
        
        // Enviar mensaje con botón
        if (elementos.sendButton) {
            elementos.sendButton.addEventListener('click', enviarMensaje);
        }
        
        // Enviar mensaje con Enter
        if (elementos.chatInput) {
            elementos.chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    enviarMensaje();
                    e.preventDefault();
                }
            });
        }
        
        // Eventos de búsqueda de usuarios
        if (elementos.newMessageBtn) {
            elementos.newMessageBtn.addEventListener('click', mostrarBusquedaUsuarios);
        }
        
        if (elementos.cancelSearch) {
            elementos.cancelSearch.addEventListener('click', ocultarBusquedaUsuarios);
        }
        
        if (elementos.userSearch) {
            elementos.userSearch.addEventListener('input', function(e) {
                const valor = e.target.value.trim().toLowerCase();
                
                // Filtrar resultados ya mostrados
                const items = elementos.searchResults.querySelectorAll('.search-result-item');
                let coincidencias = false;
                
                Array.from(items).forEach(item => {
                    const nombre = item.querySelector('.search-user-name').textContent.toLowerCase();
                    const email = item.querySelector('.search-user-email').textContent.toLowerCase();
                    
                    if (nombre.includes(valor) || email.includes(valor) || valor === '') {
                        item.style.display = 'block';
                        coincidencias = true;
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                // Mostrar mensaje si no hay coincidencias
                const infoElement = elementos.searchResults.querySelector('.search-info');
                
                if (!coincidencias && !infoElement) {
                    elementos.searchResults.innerHTML += '<div class="search-info">No hay coincidencias</div>';
                } else if (coincidencias && infoElement) {
                    infoElement.remove();
                }
            });
        }
    }
    
    // Inicializar chat
    function inicializarChat() {
        inicializarVisibilidad();
        
        if (!verificarAutenticacion()) {
            console.log('Chat no inicializado: Usuario no autenticado');
            return;
        }
        
        configurarEventos();
        console.log('Chat flotante inicializado correctamente');
        
        // Cargar conversaciones iniciales
        cargarConversaciones();
    }
    
    // Iniciar el chat
    inicializarChat();
    
    // Exponer algunas funciones para uso externo
    window.chatFlotante = {
        actualizar: cargarConversaciones,
        toggle: toggleChatPanel,
        cerrar: () => {
            chatState.open = false;
            elementos.chatPanel.style.display = 'none';
            
            if (chatState.intervalId) {
                clearInterval(chatState.intervalId);
                chatState.intervalId = null;
            }
        }
    };
});