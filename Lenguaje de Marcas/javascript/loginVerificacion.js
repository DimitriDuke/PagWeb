const form = document.getElementById('paginaLogin');

            form.addEventListener('submit', async function(event) {
                event.preventDefault();

                const mensajeError = document.querySelector('.apartadoError');

                const usernameInput = document.getElementById('username');
                const passwordInput = document.getElementById('password');

                const username = usernameInput.value;
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

                if (username.length <= 0)
                {
                    mostrarError('Uno o mas campos estan vacios', usernameInput);
                    return;
                }

                if (password.length <= 0)
                {
                    mostrarError('Uno o mas campos estan vacios', passwordInput);
                    return;
                }
                
            });