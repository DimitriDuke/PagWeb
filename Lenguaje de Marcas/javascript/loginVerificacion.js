// Archivo: javascript/loginVerificacion.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('paginaLogin');
    
    if (!form) {
        console.error('No se pudo encontrar el formulario de login');
        return;
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const mensajeError = document.querySelector('.apartadoError');
        const mensajeExito = document.getElementById('mensajeExito');
        const nicknameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        const nickname = nicknameInput.value;
        const password = passwordInput.value;

        function mostrarError(mensaje, inputElement) {
            mensajeError.classList.remove("desaparecer-apartadoError");
            mensajeError.classList.add("aparecer-apartadoError");
            mensajeError.innerHTML = mensaje;
            
            inputElement.classList.add("error-input");
            
            setTimeout(() => {
                mensajeError.classList.remove("aparecer-apartadoError");
                mensajeError.classList.add("desaparecer-apartadoError");

                inputElement.classList.remove("error-input");
            }, 5000);
        }

        function mostrarExito(mensaje) {
            mensajeExito.textContent = mensaje;
            mensajeExito.style.display = 'block';
            
            setTimeout(() => {
                mensajeExito.style.display = 'none';
                // Redirigir a la página de perfil después de mostrar el mensaje
                window.location.href = "perfil.html";
            }, 2000);
        }

        if (nickname.length <= 0) {
            mostrarError('Uno o más campos están vacíos', nicknameInput);
            return;
        }

        if (password.length <= 0) {
            mostrarError('Uno o más campos están vacíos', passwordInput);
            return;
        }

        try {
            console.log('Enviando solicitud de login...');
            const respuesta = await fetch('http://192.168.92.129:8080/api/login', {
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
            
            console.log('Respuesta recibida:', respuesta);
            const resultado = await respuesta.json();
            console.log('Datos de respuesta:', resultado);
            
            if (resultado.status === "Success") {
                // Guardar el token y la información del usuario en localStorage
                localStorage.setItem('token', resultado.token);
                localStorage.setItem('usuario', JSON.stringify(resultado.jugador));
                
                // Mostrar mensaje de éxito
                mostrarExito('¡Inicio de sesión exitoso! Redirigiendo...');
            } else {
                // Si hay un error, mostrar el mensaje de error
                mostrarError(resultado.message || 'Credenciales incorrectas', document.querySelector('.submit'));
            }
        } catch (error) {
            console.error('Error completo:', error);
            mensajeError.classList.remove("desaparecer-apartadoError");
            mensajeError.classList.add("aparecer-apartadoError");
            mensajeError.innerHTML = 'Error de conexión. Intenta más tarde.';

            setTimeout(() => {
                mensajeError.classList.remove("aparecer-apartadoError");
                mensajeError.classList.add("desaparecer-apartadoError");
            }, 3000);
        }
    });
});