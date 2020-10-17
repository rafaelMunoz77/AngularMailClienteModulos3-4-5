/**
 * Función que se encarga de realizar un petición AJAX para autenticar usuario y obtener un JWT
 */
function autenticaUsuario() {
    // Voy a enviar un JSON al seridor, contendrá los valores escritos por el usuario del formulario.
    // Estos valores se encapsulan en un objeto JavaScript. Más adelante ese objeto se convertirá en 
    // una cadena de caracteres (serialización) y se enviará junto con la petición web.
    var jsonObject = {
        usuario: document.getElementById("usuario").value,  // Utilizo el id de los campos del formulario
        password: document.getElementById("password").value
    }; 

    // Sólo a efectos de depuración muestro el objeto que voy a enviar al servidor
    console.log("u: " + jsonObject.usuario + " - p: " + jsonObject.password);

    // Una petición XMLHttpRequest es parecido a un request, pero mucho más rico. Por ejemplo, permite usar
    // formato JSON para encapsular la información que viaja entre cliente y servidor.
    var xhttp = new XMLHttpRequest();

    // Los objetos XMLHttpRequest permiten establecer una función de CallBack, esto es una función
    // asíncrona que se ejecutará en diferentes momentos, en los que el estado de la respuesta esperada
    // cambie. La respuesta puede pasar por varios "readyState":
    //  - 1 - OPENED - La petición web se acaba de enviar.
    //  - 2 - HEADERS_RECEIVED - Disponemos de las cabeceras y el estado de la respuesta del servidor
    //  - 3 - LOADING - La respuesta completa del servidor se está descargando.
    //  - 4 - DONE - La respuesta del servidor está completamente disponible.
    // Además, una respuesta también tiene varios "status". Se puede consultar lista completa en https://www.restapitutorial.com/httpstatuscodes.html
    // Baste decir que el éxito de la respuesta es el código 200.
    xhttp.onreadystatechange = function () {
        // Aunque dispongamos del estado de una respuesta, necesitamos esperar hasta que la carga
        // de la misma ha terminado.
        if (this.readyState == 4 && this.status == 200) {
            // Cuando obtengo la respuesta, que es una cadena de texto en formato JSON, con un campo llamado "jwt"
            // parseo ese texto para convertirlo en un objeto JavaScript
            var objConJWT = JSON.parse(this.response);
            // Utilizo el jwt para pedir un listado de mensajes de la bandeja de entrada del usuario encriptado en el JWT
            pedirListadoMensajesMedianteJWT(objConJWT.jwt);
        }
    };
    // Voy a configurar una petición a enviar al servidor. Se trata de autenticar al usuario
    xhttp.open("POST", "http://localhost:8080/usuario/autentica", true);
    // Especifico una cabecera en la petición (request) para indicar que la comunicación es JSON y UTF-8
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    // Con JSON.stringify serializo el objeto y lo convierto en formato JSON.
    // Con la función "send(...)" anexo el texto JSON a la petición y la envío. Ahora toca esperar
    // a que se ejecute la función de callback y los valores de readyState y status de la respuesta sean correctos
    xhttp.send(JSON.stringify(jsonObject));
}




/*
* Función que recibe un JWT válido, lo incorpora a la cabecera de una petición XHR y pide la lista
* de mensajes de la bandeja de entrada del usuario cuyo id va encriptado dentro del JWT.
* Obtiene únicamente los 10 primeros mensajes.
*/
function pedirListadoMensajesMedianteJWT (jwt) {
    var xhttp = new XMLHttpRequest();  // Creación del objeto XHR

    // Función de callback. Se ejecutará cada vez que la respuesta a la petición XHR cambie de estado
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) { // readyState 4 = "resp. recibida" y status = 200 "Todo Ok"
            // Tomo la cadena de texto con los mensajes obtenidos, en formato JSON, y lo convierto en un array JavaScript 
            var arrayMensajes = JSON.parse(this.response);
            // Inserto en el div correspondiente una tabla HTML obtenida co el array de mensajes
            document.getElementById("respuestaDelServidor").innerHTML = getTablaFromArrayMensajes(arrayMensajes); 
        }
    };
    // Abro la petición XHR
    xhttp.open("GET", "http://localhost:8080/mensajes/recibidos?pagina=0&mensajesPorPagina=10", true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); // Configuro la petición
    xhttp.setRequestHeader("Authorization", "Bearer " + jwt); // Incluyo el jwt de autenticación
    xhttp.send(); // Envío la petición XHR
}



/*
* Función que toma un array de elementos de tipo "mensaje" y construye una tabla HTML con ellos
*/
function getTablaFromArrayMensajes (arrayMensajes) {
    var htmlADevolver = "<table  class='table table-bordered table-striped'>" +
    "<thead><th>Id</th><th>Asunto</th><th>Fecha</th><tbody>"; // Comienzo a construir la tabla
    arrayMensajes.forEach(mensaje => {   // Para cada elemento del array de mensajes utilizo una función arrow
        var fechaDeMensaje = new Date(mensaje.fecha);  // La fecha llega en milisegundos, la convierto en un objeto Date
        var strFechaHora = fechaDeMensaje.toLocaleDateString() + " " + fechaDeMensaje.toLocaleTimeString(); // Construyo una cadena de texto con fecha y hora
        // Con las variables anteriores construyo un elemento <tr> con cada mensaje, dentro hay tres columnas
        htmlADevolver += "<tr><td>" + mensaje.id + "</td><td>" + mensaje.asunto + "</td><td>" + strFechaHora + "</td></tr>"
    });
    htmlADevolver += "</tbody></table>" // Cierro la tabla y devuelvo
    return htmlADevolver;
}


