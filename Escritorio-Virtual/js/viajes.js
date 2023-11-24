"use strict";

class Viajes {


    constructor() {
        // PREGUNTAR!! NO SE XQ EL THIS SE PIERDE!!
        navigator.geolocation.getCurrentPosition(this.obtainPosition.bind(this), this.manageErrorsFromPosition.bind(this));

        // Verificamos que el usuario tiene API file (usado para los ejercicios de API file)
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert("Este navegador no soporta el API file!! Puede que algunas características de la página no se desarrollen correctamente.");
        }

        this.isAnXmlLoaded = false;
        this.isKMLSectionLoaded = false;
        this.isAnSVGSectionLoaded = false;
        this.counterPerfiles = 1;
    }

    obtainPosition(position) {
        this.longitud = position.coords.longitude;
        this.latitud = position.coords.latitude;
        this.precision = position.coords.accuracy;
        this.altitud = position.coords.altitude;
        this.precisionAltitud = position.coords.altitudeAccuracy;
        this.rumbo = position.coords.heading;
        this.velocidad = position.coords.speed;
    }

    manageErrorsFromPosition(error) {

        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert("Petición de geolocalización denegada. No se puede mostrar los contenidos.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Información de geolocalización no disponible. No se puede mostrar los contenidos.");
                break;
            case error.TIMEOUT:
                alert("La petición de geolocalización ha caducado. No se puede mostrar los contenidos.");
                break;
            case error.UNKNOWN_ERROR:
                alert("Se ha producido un error desconocido. No se puede mostrar los contenidos.");
                break;
        }
    }

    showStaticMap() {

        // Request a Maps API
        var apiKey = "&key=AIzaSyCQHMvNMIE31xvj292ywRrpOOss9JWVv9k";
        var url = "https://maps.googleapis.com/maps/api/staticmap?";

        // Intentamos obtener la ubicacion real del usuario
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {

                var lat = pos.coords.latitude;
                var long = pos.coords.longitude;

                // Parameters for url (all separated by &)
                var center = "center=" + lat + "," + long;
                var zoom = "&zoom=15"; // 10-city, 15-streets, 20-buildings
                var size = "&size=800x600";
                var locationMarker = "&markers=color:red%7Clabel:D%7C" + lat + "," + long;

                // Mostrando el mapa
                var srcMap = url + center + zoom + size + locationMarker + apiKey;
                $("main>section:first").append("<img src='" + srcMap + "' alt='Un mapa estatico que muestra tu localizacion actual'>");
            });
        }
    }

    showDynamicMap() {
        $("main>section:nth-of-type(2)").append("<section></section>"); // seccion donde se situara el mapa

        /* 
            Disclaimer!! Cabe resaltar que el codigo de abajo es muy similar al proporcionado
            de referencia. Sin embargo, esta forma de crear un mapa (a través de la etiqueta script)
            no es recomendada por Google. En su API podemos leer:
            "The legacy script loading tag is still supported. Google encourages migrating to the 
            Dynamic Library Loading API"
            Por ello, también se ha proporcionado la manera "actualizada" de hacer este ejercicio.
        */

        // Simplemente inicializando el mapa con unos valores cualquiera...
        var centro = { lat: 43.3672702, lng: -5.8502461 };
        var mapaGeoposicionado = new google.maps.Map(document.querySelector("main>section:nth-of-type(2) section"), {
            zoom: 8,
            center: centro,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        // Intentamos obtener la ubicacion real del usuario
        var infoWindow = new google.maps.InfoWindow;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                infoWindow.setPosition(pos);
                infoWindow.setContent('Localización encontrada');
                infoWindow.open(mapaGeoposicionado);
                mapaGeoposicionado.setCenter(pos);
            }, function () {
                error(true, infoWindow, mapaGeoposicionado.getCenter());
            });
        } else {
            // Browser doesn't support Geolocation
            error(false, infoWindow, mapaGeoposicionado.getCenter());
        }


        var error = (browserHasGeolocation, infoWindow, pos) => {
            infoWindow.setPosition(pos);
            infoWindow.setContent(browserHasGeolocation ?
                'Error: Ha fallado la geolocalización' :
                'Error: Su navegador no soporta geolocalización');
            infoWindow.open(mapaGeoposicionado);
        }

        /* Forma recomendada de Google utilizando funciones asíncronas e importando
            librerias de forma dinámica.

        // Inicializamos y añadimos el mapa
        let map;

        async function initMap() {
            // En este caso tendriamos que obtener la latitud y longitud del API geolocation
            // Estas coordenadas son meramente ilustrativas
            const position = { lat: -25.344, lng: 131.031 };
            
            // Librerias necesarias.
            const { Map } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

            // El mapa centrado en el usuario
            map = new Map(document.querySelector("main>section:last-of-type"), {
                zoom: 4,
                center: position,
                mapId: "DEMO_MAP_ID",
            });

            // El marcador en el punto del usuario
            const marker = new AdvancedMarkerElement({
                map: map,
                position: position,
                title: "Ubicacion usuario",
            });
        }

        initMap();
        */


    }

    procesaXML(files) {

        var file = files[0]; // Solo permite seleccionar un archivo

        // Solo permitimos archivos XML y comprobamos usando "MIME types"
        if (file.type.match("application/xml") || file.type.match("text/xml")) {

            if (this.isAnXmlLoaded) { // Para sobreescribir en vez de crear otra seccion
                $("input:first").next().remove();
            }

            var reader = new FileReader();
            reader.onload = (event) => {

                $("input:first").after("<section></section>"); // Creamos una seccion para mostrar datos de XML

                var name = "Nombre del archivo: " + file.name;
                var size = "Tamaño del archivo: " + file.size + " bytes";
                var fileType = "Tipo del archivo: " + file.type;
                var lastMod = "Última modificación: " + file.lastModifiedDate;

                // Parseamos el XML y obtenemos el numero de nodos que tiene
                var xml = new DOMParser().parseFromString(reader.result, "application/xml");
                var numberNodes = "Número de nodos XML: " + $("*", xml).length;

                $("input:first").next().append("<p>" + name + "</p>");
                $("input:first").next().append("<p>" + size + "</p>");
                $("input:first").next().append("<p>" + fileType + "</p>");
                $("input:first").next().append("<p>" + lastMod + "</p>");
                $("input:first").next().append("<p>" + numberNodes + "</p>");
                $("input:first").next().append("<p>Contenido del XML: </p>");
                $("input:first").next().append("<pre></pre>");
                $("pre").text(reader.result);

                this.isAnXmlLoaded = true;
            }
            reader.readAsText(file);


        } else
            alert("Solo se permite subir archivos XML ( NombreArchivo.xml )");

    }

    procesaKML(files) {

        if (!this.isKMLSectionLoaded) {
            $("main>section:nth-of-type(4)").append("<section></section>"); // Creamos una seccion para mostrarlas rutas KML
            this.isKMLSectionLoaded = true;
        }

        // Creamos el mapa centrado en Monaco
        var map = new google.maps.Map(document.querySelector("main>section:nth-of-type(4) section"), {
            center: new google.maps.LatLng(43.737414330497565, 7.421303172016904),
            zoom: 14,
            mapTypeId: 'terrain'
        });


        var readKML = (file) => {
            var reader = new FileReader();
            reader.onload = (event) => {

                // Parseamos el KML
                var kml = new DOMParser().parseFromString(reader.result, "application/xml");

                // Path a dibujar en Google
                var googlePath = [];

                // Obtenemos todas las coordenadas del KML
                var coordinates = $("coordinates", kml).text().trim().split("\n");
                for (var j = 0; j < coordinates.length; j++) {
                    var coord = coordinates[j].trim().split(",");
                    // Por cada coordenada creamos un map con las variables necesarias
                    googlePath.push({ lat: +coord[1], lng: +coord[0] })
                }

                // Todas las rutas tienen el color rojo pero se podria cambiar con un generador de colores
                // var colorPath = $("color", kml).text();
                var colorPath = "#000000";
                var widthPath = $("width", kml).text();
                var namePath = $("name", kml).text();

                // Una vez tenemos las coordenadas, creamos una polilinea
                var poly = new google.maps.Polyline({
                    strokeColor: colorPath,
                    strokeOpacity: 1.0,
                    strokeWeight: +widthPath,
                });

                poly.setMap(map); // Insertamos en google maps

                // Por cada coordenada...
                for (var j = 0; j < googlePath.length; j++) {

                    var c = new google.maps.LatLng(googlePath[j]["lat"], googlePath[j]["lng"]);
                    poly.getPath().push(c);

                    new google.maps.Marker({
                        position: c,
                        map: map,
                        label: (j + 1) + "",
                        title: namePath + " - Hito: " + (j + 1),
                    });
                }


            }
            reader.readAsText(file);
        }


        for (var i = 0; i < files.length; i++) {
            // Se tiene que hacer en una funcion aparte ya que cada vez que se declaraba
            // la variable "var reader = new FileReader();" esta siempre se eliminaba y era
            // reemplazada por otra nueva instancia del fileReader(). Esto ocasionaba que solo
            // se leyese el ultimo archivo.
            // Por ello se crea una nueva funcion donde todas sus variables son unicas al scope
            // donde se encuentran.
            readKML(files[i]);
        }

    }

    procesaSVG(files) {

        if (!this.isAnSVGSectionLoaded) {
            $("main>section:last").append("<section></section>"); // Creamos una seccion para mostrar datos de SVG
            this.isAnSVGSectionLoaded = true;
        }

        var readSVG = (file) => {
            var reader = new FileReader();
            reader.onload = (event) => {

                // Parseamos el SVG
                var svg = new DOMParser().parseFromString(reader.result, "application/xml");

                $("main>section:last section").append("<h4>Perfil " + this.counterPerfiles + "</h4>");
                this.counterPerfiles += 1;
                $("main>section:last section>h4:last").after('<svg height="500" width="500"></svg>');

                var polyline = $("polyline", svg);
                var text = $("text", svg);
                $("main>section:last section>svg:last").append(polyline);
                $("main>section:last section>svg:last").append(text);
            }
            reader.readAsText(file);
        }

        for (var i = 0; i < files.length; i++) {
            readSVG(files[i]);
        }
    }

}

var viaje = new Viajes();