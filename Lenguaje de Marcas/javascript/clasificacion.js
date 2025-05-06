document.addEventListener('DOMContentLoaded', function() {
    console.log("Página cargada, iniciando carga de ranking...");
    

    const tablaBody = document.querySelector('table tbody');
    if (tablaBody) {
        tablaBody.innerHTML = '<tr><td colspan="3">Cargando ranking...</td></tr>';
    } else {
        console.error("No se encuentra el elemento tbody de la tabla");
        return;
    }
    

    const apiUrl = 'http://192.168.92.130:8080/api/top-jugadores';

    fetch(apiUrl)
        .then(function(response) {
            console.log("Respuesta recibida con estado:", response.status);
            return response.json();
        })
        .then(function(respuesta) {
            console.log("Datos recibidos:", respuesta);
            
          
            const jugadores = respuesta.data;
            
            // Limpiar la tabla
            tablaBody.innerHTML = '';
            
     
            if (!jugadores || jugadores.length === 0) {
                tablaBody.innerHTML = '<tr><td colspan="3">No hay jugadores registrados aún</td></tr>';
                return;
            }
            
            // Recorrer los jugadores y añadirlos a la tabla
            jugadores.forEach(function(jugador, indice) {
           
                const fila = document.createElement('tr');
                
         
                if (indice < 3) {
                    fila.className = 'top-' + (indice + 1);
                }
                
       
                const puntuacion = jugador.puntuacionMedia ? jugador.puntuacionMedia.toFixed(2) : '0.00';
 
                fila.innerHTML = '<td>' + (indice + 1) + '</td>' +
                                '<td>' + jugador.nickname + '</td>' +
                                '<td>' + puntuacion + '</td>';
                
   
                tablaBody.appendChild(fila);
            });
        })
        .catch(function(error) {
            console.error('Error al conectar con la API:', error);
            tablaBody.innerHTML = '<tr><td colspan="3">Error al cargar el ranking. Por favor, intenta más tarde.</td></tr>';
        });
});