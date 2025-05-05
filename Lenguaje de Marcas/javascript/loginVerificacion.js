document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('paginaLogin');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const mensajeError = document.querySelector('.apartadoError');
        const mensajeExito = document.getElementById('mensajeExito');
        const nicknameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        const nickname = nicknameInput.value;
        const password = passwordInput.value;

        // Función para mostrar errores
        function mostrarError(mensaje, inputElement) {
            mensajeError.classList.remove("desaparecer-apartadoError");
            mensajeError.classList.add("aparecer-apartadoError");
            mensajeError.innerHTML = mensaje;
            
            if (inputElement) {
                inputElement.classList.add("error-input");
            }

            setTimeout(() => {
                mensajeError.classList.remove("aparecer-apartadoError");
                mensajeError.classList.add("desaparecer-apartadoError");

                if (inputElement) {
                    inputElement.classList.remove("error-input");
                }
            }, 5000);
        }

        // Validación de campos
        if (nickname.length <= 0) {
            mostrarError('Uno o más campos están vacíos', nicknameInput);
            return;
        }

        if (password.length <= 0) {
            mostrarError('Uno o más campos están vacíos', passwordInput);
            return;
        }

        try {
            console.log('Enviando solicitud de login con nickname:', nickname);
            
            const respuesta = await fetch('http://192.168.126.129:8080/api/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    nickname: nickname,
                    password: password 
                })
            });
            
            console.log('Respuesta completa:', respuesta);
            
            if (!respuesta.ok) {
                throw new Error(`¡Error HTTP! estado: ${respuesta.status}`);
            }
            
            const resultado = await respuesta.json();
            console.log('Datos de respuesta JSON:', resultado);
            
            if (resultado.status === "Success") {
                // Acceder al token dentro de data si existe
                console.log('Datos en la respuesta:', resultado.data);
                
                // Buscar token en data
                const token = resultado.token || (resultado.data && resultado.data.token);
                console.log("Login exitoso, guardando token:", token);
                
                if (token) {
                    localStorage.setItem('token', token);
                } else {
                    console.warn("No se recibió token en la respuesta");
                    // Guardamos un token vacío para evitar errores
                    localStorage.setItem('token', 'temp_token');
                }
                
                // Guardar directamente el objeto data como usuario si no hay jugador específico
                if (resultado.jugador) {
                    localStorage.setItem('usuario', JSON.stringify(resultado.jugador));
                    console.log("Información de usuario guardada:", resultado.jugador);
                } else if (resultado.data) {
                    localStorage.setItem('usuario', JSON.stringify(resultado.data));
                    console.log("Información de usuario guardada desde data:", resultado.data);
                } else {
                    console.warn("No se recibió información del jugador en la respuesta");
                    // Crear objeto de usuario mínimo
                    localStorage.setItem('usuario', JSON.stringify({nickname: nickname}));
                }
                
                // Mostrar mensaje de éxito
                alert('¡Inicio de sesión exitoso! Redirigiendo a tu perfil...');
                
                // Redirigir directamente a la página de perfil
                window.location.href = "perfil.html";
                
                return false;
            } else {
                mostrarError(resultado.message || 'Credenciales incorrectas', nicknameInput);
            }
        } catch (error) {
            console.error('Error completo:', error);
            mostrarError('Error de conexión. Intenta más tarde.', document.querySelector('.submit'));
        }
    });
});