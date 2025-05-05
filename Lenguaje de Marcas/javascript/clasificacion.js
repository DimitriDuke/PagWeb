// Versión ultra robusta que debería funcionar con cualquier formato razonable de respuesta
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página cargada, iniciando carga de ranking...");
    
    // Mostrar mensaje de carga
    const tablaBody = document.querySelector('table tbody');
    if (tablaBody) {
        tablaBody.innerHTML = '<tr><td colspan="3">Cargando ranking...</td></tr>';
    } else {
        console.error("No se encontró el elemento tbody de la tabla");
        return;
    }
    
    // URL de la API
    const apiUrl = 'http://192.168.126.129:8080/api/top-jugadores';
    
    console.log("Intentando conectar a:", apiUrl);
    
    // Función para extraer los datos relevantes de cualquier formato de respuesta
    function extraerJugadores(respuesta) {
        console.log("Extrayendo jugadores de la respuesta:", respuesta);
        
        // Intento 1: Formato esperado {status, data: [jugadores]}
        if (respuesta && respuesta.data && Array.isArray(respuesta.data)) {
            console.log("Formato encontrado: {status, data: [jugadores]}");
            return respuesta.data;
        }
        
        // Intento 2: El propio objeto es un array de jugadores
        if (Array.isArray(respuesta)) {
            console.log("Formato encontrado: [jugadores]");
            return respuesta;
        }
        
        // Intento 3: Buscar cualquier array dentro del objeto que pueda contener jugadores
        for (const key in respuesta) {
            if (Array.isArray(respuesta[key])) {
                console.log("Formato encontrado: array en propiedad", key);
                return respuesta[key];
            }
        }
        
        // No se encontró ningún formato válido
        console.error("No se pudo encontrar un formato válido de jugadores en la respuesta");
        return null;
    }
    
    // Función para obtener un valor seguro (evita errores si la propiedad no existe)
    function valorSeguro(objeto, propiedad, valorPorDefecto) {
        try {
            const partes = propiedad.split('.');
            let valor = objeto;
            
            for (const parte of partes) {
                if (valor === null || valor === undefined) return valorPorDefecto;
                valor = valor[parte];
            }
            
            return (valor !== null && valor !== undefined) ? valor : valorPorDefecto;
        } catch (error) {
            return valorPorDefecto;
        }
    }
    
    // Realizar la petición al servidor
    fetch(apiUrl)
        .then(function(response) {
            console.log("Respuesta recibida con estado:", response.status);
            return response.json();
        })
        .then(function(respuesta) {
            console.log("Datos recibidos:", respuesta);
            
            // Intentar extraer los jugadores
            const jugadores = extraerJugadores(respuesta);
            
            // Limpiar la tabla
            tablaBody.innerHTML = '';
            
            // Si no hay jugadores, mostrar mensaje
            if (!jugadores || jugadores.length === 0) {
                tablaBody.innerHTML = '<tr><td colspan="3">No hay jugadores registrados aún</td></tr>';
                return;
            }
            
            // Recorrer los jugadores y añadirlos a la tabla
            jugadores.forEach(function(jugador, indice) {
                console.log("Procesando jugador:", jugador);
                
                // Crear una nueva fila
                const fila = document.createElement('tr');
                
                // Destacar los tres primeros lugares
                if (indice < 3) {
                    fila.className = 'top-' + (indice + 1);
                }
                
                // Buscar el nickname (podría estar en diferentes propiedades)
                const nickname = valorSeguro(jugador, 'nickname', 
                                valorSeguro(jugador, 'name', 
                                valorSeguro(jugador, 'nombre', 'Jugador ' + (indice + 1))));
                
                // Buscar la puntuación (podría estar en diferentes propiedades)
                let puntuacionRaw = valorSeguro(jugador, 'puntuacionMedia', 
                                  valorSeguro(jugador, 'puntuacion',
                                  valorSeguro(jugador, 'score',
                                  valorSeguro(jugador, 'points', 0))));
                
                // Formatear la puntuación
                let puntuacion = '0.00';
                if (typeof puntuacionRaw === 'number') {
                    puntuacion = puntuacionRaw.toFixed(2);
                } else if (typeof puntuacionRaw === 'string' && !isNaN(parseFloat(puntuacionRaw))) {
                    puntuacion = parseFloat(puntuacionRaw).toFixed(2);
                }
                
                // Añadir las celdas a la fila
                fila.innerHTML = '<td>' + (indice + 1) + '</td>' +
                                '<td>' + nickname + '</td>' +
                                '<td>' + puntuacion + '</td>';
                
                // Añadir la fila a la tabla
                tablaBody.appendChild(fila);
            });
        })
        .catch(function(error) {
            console.error('Error al conectar con la API:', error);
            tablaBody.innerHTML = '<tr><td colspan="3">Error al cargar el ranking. Por favor, intenta más tarde.</td></tr>';
        });
});