"use strict";

class Viajes {


    constructor() {

        // Verificamos los permisos de geolocalizacion
        navigator.geolocation.getCurrentPosition(this.obtainPosition.bind(this), this.manageErrorsFromPosition.bind(this));

        // Verificamos que el usuario tiene API file (usado para los ejercicios de API file)
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert("Este navegador no soporta el API file!! Puede que algunas características de la página no se desarrollen correctamente.");
        }

        this.isAnXmlLoaded = false;
        this.isKMLSectionLoaded = false;
        this.isAnSVGSectionLoaded = false;
        this.counterPerfiles = 1;

        // Carrusel
        this.curSlide = 0;
    }

    obtainPosition(position) {
        this.longitud = position.coords.longitude;
        this.latitud = position.coords.latitude;
        this.showStaticMap();
        this.showDynamicMap();
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

        // Dado a la inclusion de librerias y demas componentes por parte de la API
        // de Google. La propiedad navigator.geolocation tarda en encontrar la localizacion
        // del usuario. Si se espera unos segundos, se mostrara.

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
        $("main>section:first").append("<img src='" + srcMap + "' alt='Un mapa estatico que muestra tu localizacion actual'>");


        /*
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
        */
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
        var pos = {
            lat: this.latitud,
            lng: this.longitud
        };

        var infoWindow = new google.maps.InfoWindow;
        infoWindow.setPosition(pos);
        infoWindow.setContent('Localización encontrada');
        infoWindow.open(mapaGeoposicionado);
        mapaGeoposicionado.setCenter(pos);

        /*
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

        var parseDuration = (durationXML) => {

            var durationString = "";

            // Removemos la P del inicio e "intentamos" dividir por la T
            var partes = durationXML.substring(1).split("T");
            // Siempre está
            var partesDate = partes[0];
            // Puede que no haya tiempo, si no lo hay simplemente es un string vacio
            var partesTiempo = partes[1] || "";


            // Parseamos el Date
            var years =
                partesDate.includes("Y") ?
                    partesDate.split("Y")[0].slice(-1) : "";
            var month =
                partesDate.includes("M") ?
                    partesDate.split("M")[0].slice(-1) : "";
            var days =
                partesDate.includes("D") ?
                    partesDate.split("D")[0].slice(-1) : "";

            // Parseamos el Time
            var hours;
            var minutes;
            var seconds;
            if (partesTiempo != "") {
                hours = partesTiempo.includes("H") ?
                    partesTiempo.split("H")[0].slice(-1) : "";
                minutes = partesTiempo.includes("M") ?
                    partesTiempo.split("M")[0].slice(-1) : "";
                seconds = partesTiempo.includes("S") ?
                    partesTiempo.split("S")[0].slice(-1) : "";
            }

            if (years)
                durationString += years + " año/s ";
            if (month)
                durationString += month + " mes/es ";
            if (days)
                durationString += days + " día/s ";
            if (hours)
                durationString += hours + " hora/s ";
            if (minutes)
                durationString += minutes + " minuto/s ";
            if (seconds)
                durationString += seconds + " segundo/s";


            return durationString;
        }

        var createInfoPrincipal = (ruta, seccionRuta) => {

            // Seccion que representa la informacion principal
            var seccionInfoPrincipal = $("<section></section>");

            // Subtitulo
            seccionInfoPrincipal.append("<h5>Información Principal</h5>");
            // Descripcion
            var descripcion = $("descripcion", ruta).first().text();
            seccionInfoPrincipal.append("<p>" + descripcion + "</p>");
            // Medio de transporte
            var medioTransporte = $(ruta).attr("medioTransporte");
            // Duracion
            var duracion = $("duracion", ruta).text();
            // Agencia
            var agencia = $("agencia", ruta).text();
            // Adecuaciones
            var adecuaciones = $("adecuaciones", ruta).first();
            // Recomendacion
            var recomendacion = $("recomendacion", ruta).text();

            // Añadimos la lista con toda la informacion
            var listaGeneral = $("<ul></ul>");
            listaGeneral.append("<li>Medio de transporte: " + medioTransporte + "</li>");
            listaGeneral.append("<li>Duracion: " + parseDuration(duracion) + "</li>");
            listaGeneral.append("<li>Agencia: " + agencia + "</li>");

            var listaAdecuaciones = "<li>Adecuaciones: <ul>";
            for (var adecuacion of $("adecuacion", adecuaciones))
                listaAdecuaciones += "<li>" + $(adecuacion).text() + "</li>";
            listaAdecuaciones += "</ul></li>";

            listaGeneral.append(listaAdecuaciones);
            listaGeneral.append("<li>Recomendación: " + recomendacion + "</li>");
            seccionInfoPrincipal.append(listaGeneral);

            // Añadimos la seccion InfoPrincipal a la Seccion ruta
            seccionInfoPrincipal.appendTo(seccionRuta);
        }

        var createInicioRuta = (ruta, seccionRuta) => {

            // Seccion que representa el Inicio de la Ruta
            var seccionInicioRuta = $("<section></section>");

            // Subtitulo
            seccionInicioRuta.append("<h5>Inicio de la ruta</h5>");
            // Inicio
            var inicio = $("inicio", ruta);
            // Lugar de inicio
            var lugar = $("lugar", inicio).text();
            // Direccion de inicio
            var direccion = $("direccion", inicio).text();
            // Coordenadas
            var coordenadas = $("coordenadas", inicio);


            // Añadimos la lista con toda la informacion
            var listaGeneral = $("<ul></ul>");
            listaGeneral.append("<li>Lugar: " + lugar + "</li>");
            listaGeneral.append("<li>Dirección: " + direccion + "</li>");

            var listaCoordenadas = "<li>Coordenadas: <ul>";
            listaCoordenadas += "<li>Longitud: " + $("longitud", coordenadas).text() + "</li>";
            listaCoordenadas += "<li>Latitud: " + $("latitud", coordenadas).text() + "</li>";
            listaCoordenadas += "<li>Altitud: " + $("altitud", coordenadas).text() + "mts.</li>"
            listaCoordenadas += "</ul></li>";

            listaGeneral.append(listaCoordenadas);
            seccionInicioRuta.append(listaGeneral);

            seccionInicioRuta.appendTo(seccionRuta);
        }

        var createReferencias = (ruta, seccionRuta) => {

            // Seccion que representa el Inicio de la Ruta
            var seccionReferencias = $("<section></section>");

            // Subtitulo
            seccionReferencias.append("<h5>Referencias</h5>");
            // Referencias
            var referencias = $("referencias", ruta);

            // Añadimos la lista con toda la informacion
            var listaGeneral = $("<ul></ul>");
            for (var referencia of $("referencia", referencias)) {
                var enlaceLi = "<li>";
                enlaceLi += '<a href="' + $(referencia).text() + '">';
                enlaceLi += $(referencia).text() + "</a>";
                enlaceLi += "</li>";
                listaGeneral.append(enlaceLi);
            }
            seccionReferencias.append(listaGeneral);

            seccionReferencias.appendTo(seccionRuta);
        }

        var createHito = (hito, seccionHitos) => {

            // Seccion que contiene el hito
            var seccionHito = $("<section></section>");

            // Titulo de la ruta
            var tituloRuta = $(hito).attr("nombre");
            // Descripcion
            var descripcion = $("descripcion", hito).text();
            // DistanciaHitoAnterior
            var hitoAnterior = $("distanciaHitoAnterior", hito).text() + $("distanciaHitoAnterior", hito).attr("unidades");
            // Fotografias
            var fotografias = $("foto", hito);

            // Introducimos todos los elementos en la seccion
            seccionHito.append("<h6>" + tituloRuta + "</h6>");
            seccionHito.append("<p>" + descripcion + "</p>");
            seccionHito.append("<p>Coordenadas:</p>");

            var listaCoordenadas = "<ul>";
            listaCoordenadas += "<li>Longitud: " + $("longitud", hito).text() + "</li>";
            listaCoordenadas += "<li>Latitud: " + $("latitud", hito).text() + "</li>";
            listaCoordenadas += "<li>Altitud: " + $("altitud", hito).text() + "mts.</li>"
            listaCoordenadas += "</ul>";

            seccionHito.append(listaCoordenadas);
            seccionHito.append("<p>Distancia al hito anterior: " + hitoAnterior + "</p>")

            seccionHito.append("<p>Galeria:</p>");
            for (var foto of fotografias) {
                var imgLink = $(foto).text();
                var imgAlt = imgLink.split(".")[0];
                var imgSrc = "xml/" + imgLink;
                seccionHito.append('<img src="' + imgSrc + '" alt="' + imgAlt + '" >');
            }


            seccionHito.appendTo(seccionHitos);
        }

        var createHitos = (ruta, seccionRuta) => {
            // Seccion que contiene todos los Hitos 
            var seccionHitos = $("<section></section>");

            // Subtitulo
            seccionHitos.append("<h5>Hitos de la ruta</h5>");
            // Seccion de cada Hito
            for (var hito of $("hito", ruta))
                createHito(hito, seccionHitos);

            seccionHitos.appendTo(seccionRuta);
        }

        var createNewRuta = (ruta) => {
            // Seccion que representa la ruta
            var seccionRuta = $("<section></section>");

            // Introducimos el titulo y el tipo de la ruta
            var titulo = $(ruta).attr("nombre");
            var tipo = $(ruta).attr("tipo")
            seccionRuta.append("<h4>" + titulo + " - " + tipo + "</h4>");

            // Introducimos su informacion principal
            createInfoPrincipal(ruta, seccionRuta);
            // Introducimos el inicio de la ruta
            createInicioRuta(ruta, seccionRuta);
            // Introducimos las referencias de la ruta
            createReferencias(ruta, seccionRuta);
            // Introducimos todos los hitos
            createHitos(ruta, seccionRuta);


            // Lo añadimos a la seccion global de las rutaS
            $("input:first").after(seccionRuta);
        }


        var file = files[0]; // Solo permite seleccionar un archivo

        // Solo permitimos archivos XML y comprobamos usando "MIME types"
        if (file.type.match("application/xml") || file.type.match("text/xml")) {

            if (this.isAnXmlLoaded) { // Para sobreescribir en vez de crear otra seccion
                $("input:first").next().remove();
            }

            var reader = new FileReader();
            reader.onload = (event) => {

                var xml = new DOMParser().parseFromString(reader.result, "application/xml"); // Parseamos el XML para poder pasarlo a HTML

                // Iteramos sobre cada ruta y creamos una seccion nueva
                var rutas = $("ruta", xml);
                for (var ruta of rutas) {
                    createNewRuta(ruta);
                }

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

    nextSlide(){

        var slides = $("article img");
        var maxSlide = slides.length - 1; // maximum number of slides
        
        var current = this.curSlide;

        // check if current slide is the last and reset current slide
        if (current === maxSlide) {
            this.curSlide = 0;
        } else {
            this.curSlide++;
        }

        // Move slide by -100%
        $("article img").each((slide, indx) => {
      	    var trans = 100 * (indx - current);
            $(slide).css('transform', 'translateX(' + trans + '%)')
        });
    }

    prevSlide(){
        
        var slides = $("article img");
        var maxSlide = slides.length - 1; // maximum number of slides

        var current = this.curSlide

        // check if current slide is the first and reset current slide to last
        if (current === 0) {
            this.curSlide = maxSlide;
        } else {
            this.curSlide--;
        }
  
        // Move slide by 100%
        slides.each((slide, indx) => {
            var trans = 100 * (indx - current);
          $(slide).css('transform', 'translateX(' + trans + '%)')
        });
    }

    

}