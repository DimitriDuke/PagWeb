const form = document.getElementById('paginaRegistro');

form.addEventListener('submit', async function(event){
    event.preventDefault();

    const mensajeError = document.querySelector('.apartadoError');

    const nicknameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const nickname = nicknameInput.value;
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const emailVer = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordVer = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

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

    if (nickname.length <= 0) {
        mostrarError('Uno o más campos están vacíos', nicknameInput);
        return;
    } 
    if (nickname.length < 5) {
        mostrarError('Por favor ingresa un nombre de usuario válido', nicknameInput);
        return;
    } 
    if (email.length <= 0) {
        mostrarError('Uno o más campos están vacíos', emailInput);
        return;
    } 
    if (!emailVer.test(email)) {
        mostrarError('Por favor ingresa un correo válido', emailInput);
        return;
    } 
    if (password.length <= 0) {
        mostrarError('Uno o más campos están vacíos', passwordInput);
        return;
    } 
    if (!passwordVer.test(password)) {
        mostrarError('Por favor ingresa una contraseña con al menos 6 caracteres, una letra mayúscula y un número', passwordInput);
        return;
    } 
    
    try {
       
        const respuesta = await fetch('http://192.168.126.130:8080/api/anadirJugador', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
      
            body: JSON.stringify({ 
                nickname: nickname, 
                email: email, 
                password: password 
            })
        });

        const resultado = await respuesta.json();
        
        if (resultado.status === "Success") {
            alert("Registro exitoso. Ahora puedes iniciar sesión.");
            window.location.href = "pagina-login.html";
        } else {
  
            mostrarError(resultado.message, document.querySelector('.submit'));
        }
    } catch (error) {
        mensajeError.classList.remove("desaparecer-apartadoError");
        mensajeError.classList.add("aparecer-apartadoError");
        mensajeError.innerHTML = 'Error de conexión. Intenta más tarde.';

        setTimeout(() => {
            mensajeError.classList.remove("aparecer-apartadoError");
            mensajeError.classList.add("desaparecer-apartadoError");
        }, 3000);
        console.error(error);
    }
});
