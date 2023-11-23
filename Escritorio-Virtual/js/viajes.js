"use strict";

class Viajes {

    constructor() {
        navigator.geolocation.getCurrentPosition(this.obtainPosition.bind(this), this.manageErrors.bind(this));
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

    manageErrors(error) {
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

        $("main").append("<h3>Esta es tu localización actual (Mapa estático): </h3>");
        /*
        // Request a Maps API
        var apiKey = "&key=AIzaSyCQHMvNMIE31xvj292ywRrpOOss9JWVv9k";
        var url = "https://maps.googleapis.com/maps/api/staticmap?";

        // Parameters for url (all separated by &)
        var center = "center=" + this.latitud + "," + this.longitud;
        var zoom = "&zoom=15"; // 10-city, 15-streets, 20-buildings
        var size = "&size=800x600";
        var locationMarker = "&markers=color:red%7Clabel:D%7C" + this.latitud + "," + this.longitud;

        // Mostrando el mapa
        var srcMap = url + center + zoom + size + locationMarker + apiKey;
        $("main>h3").after("<img src='" + srcMap + "' alt='Un mapa estatico que muestra tu localizacion actual'>")
        */
    }

    showDynamicMap() {
        $("main").append("<h3>Esta es tu localización actual (Mapa dinámico): </h3>");
        $("main").append("<section></section>"); // seccion donde se situara el mapa

        /* 
            Disclaimer!! Cabe resaltar que el codigo de abajo es muy similar al proporcionado
            de referencia. Sin embargo, esta forma de crear un mapa (a través de la etiqueta script)
            no es recomendada por Google. En su API podemos leer:
            "The legacy script loading tag is still supported. Google encourages migrating to the 
            Dynamic Library Loading API"
            Por ello, también se ha proporcionado la manera "actualizada" de hacer este ejercicio.
        */
        /*
        // Simplemente inicializando el mapa con unos valores cualquiera...
        var centro = { lat: 43.3672702, lng: -5.8502461 };
        var mapaGeoposicionado = new google.maps.Map(document.querySelector("main>section:last-of-type"), {
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
        */

        /*
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

}
