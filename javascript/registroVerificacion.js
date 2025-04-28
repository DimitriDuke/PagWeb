const form = document.getElementById('paginaRegistro');

            form.addEventListener('submit', async function(event){
                event.preventDefault();

                var mensajeError = document.querySelector('.apartadoError');

                const usernameInput = document.getElementById('username');
                const emailInput = document.getElementById('email');
                const passwordInput = document.getElementById('password');

                const username = usernameInput.value;
                const email = emailInput.value.trim();
                const password = passwordInput.value;

                const emailVer = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                function mostrarError(mensaje, inputElement) {
                    mensajeError.classList.remove("desaparecer-apartadoError");
                    mensajeError.classList.add("aparecer-apartadoError");
                    mensajeError.innerHTML = mensaje;
                    
                    inputElement.classList.add("error-input"); 
            
                    setTimeout(() => {
                        mensajeError.classList.remove("aparecer-apartadoError");
                        mensajeError.classList.add("desaparecer-apartadoError");
            
                        inputElement.classList.remove("error-input");
                    }, 3000);
                }

                if (username.length < 3)
                {
                    mostrarError ('Por favor, ingresa un nombre de usuario valido', usernameInput);
                    return;
                } if (!emailVer.test(email))
                {
                    mostrarError ('Por favor, ingresa un correo valido', emailInput);
                    return;
                } if (password.length < 6)
                {
                    mostrarError ('Por favor, ingresa una contraseña valida', passwordInput);
                    return;
                } else
                {
                    try {
                        const respuesta = await fetch('/registrarse', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, email, password })
                        });
    
                        const resultado = await respuesta.json();
                        alert(resultado.mensaje);
                    } catch (error) {
                        mensajeError.classList.remove("desaparecer-apartadoError");
                        mensajeError.classList.add("aparecer-apartadoError");

                        mensajeError.innerHTML = 'Error al registrarse';

                        setTimeout(() => {
                            mensajeError.classList.remove("aparecer-apartadoError");
                            mensajeError.classList.add("desaparecer-apartadoError");
                        }, 3000);
                        console.error(error);
                    }
                }

            });
