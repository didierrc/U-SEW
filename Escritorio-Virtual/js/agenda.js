// API url: http://ergast.com/api/f1/2023/...
// 1 llamada cada 10 min!!!

"use strict";

class Agenda {

    constructor() {
        // Por defecto la API devuelve la info en XML
        this.urlF1 = "https://ergast.com/api/f1/2023";
        this.last_api_call = null;
        this.last_api_result = null;
        this.calendarTitleAdded = false;
        this.alreadyCalled = false;
    }

    consultaSchedule() {

        var flags = {
            "Bahrain": "bahrain.png",
            "Saudi Arabia": "saudi.png",
            "Australia": "australia.webp",
            "Azerbaijan": "azerbaijan.png",
            "USA": "usa.png",
            "Monaco": "monaco.png",
            "Spain": "spain.webp",
            "Canada": "canada.png",
            "Austria": "austria.webp",
            "UK": "uk.webp",
            "Hungary": "hungary.webp",
            "Belgium": "belgium.png",
            "Netherlands": "netherlands.png",
            "Italy": "italy.png",
            "Singapore": "singapore.png",
            "Japan": "japan.png",
            "Qatar": "qatar.png",
            "Mexico": "mexico.webp",
            "Brazil": "brazil.png",
            "United States": "usa.png",
            "UAE": "uae.png"
        }

        var creaCarreraHTML = (race, i) => {

            // Creando la seccion para la carrera
            $("main").append("<section></section>");

            // Creando la seccion del numero de carrera
            //$("main>section:last-child").append("<section></section>");
            var raceNumber = "<h4>R" + i + "</h4>"
            $("main>section:last-child").append(raceNumber);

            // Añadiendo la imagen extraida de wikipedia
            var countryRace = $('Country', race).text();
            var wikiUrl = "multimedia/imagenes/" + flags[countryRace];
            var imageAlt = "Bandera de " + countryRace;
            $("main>section:last-child").append("<img>");
            $("main>section:last-child>img").attr("src", wikiUrl);
            $("main>section:last-child>img").attr("alt", imageAlt);

            // Añadiendo la seccion de informacion principal
            $("main>section:last-child").append("<section></section>");
            $("main>section:last-child>section:last-child").append("<h5>Información Principal</h5>")

            // Fecha y hora de carrera
            var dateRace = $("Race>Date", race).text().split("-")[2] + "-" + $("Race>Date", race).text().split("-")[1];
            var timeRace = $('Time', race).text().split(":")[0] + ":" + $('Time', race).text().split(":")[1];
            var whenRace = "<p>Horario: " + dateRace + " a las " + timeRace + "</p>";
            $("main>section:last-child>section:last-child").append(whenRace);

            // Nombre de carrera
            var raceName = "<p>Nombre: " + $("RaceName", race).text() + "</p>";
            $("main>section:last-child>section:last-child").append(raceName);

            // Añadiendo la seccion de informacion sobre localizacion
            $("main>section:last-child").append("<section></section>");
            $("main>section:last-child>section:last-child").append("<h5>Se celebra en...</h5>")

            // Nombre de circuito
            var circuitName = "<p>Circuito: " + $("CircuitName", race).text() + "</p>";
            $("main>section:last-child>section:last-child").append(circuitName);

            // Localizacion del circuito
            var circuitLocality = $("Locality", race).text();
            var countryLocality = $("Country", race).text();
            var localisationCircuit = "<p>Localización: " + countryLocality + " - " + circuitLocality + "</p>"
            $("main>section:last-child>section:last-child").append(localisationCircuit);

            // Coordenadas de circuito
            var coordinates = "<p>Coordenadas: " + $("Location", race).attr("lat") + "," + $("Location", race).attr("long") + "</p>";
            $("main>section:last-child>section:last-child").append(coordinates);
        }


        var creaHTML = (datos) => {

            // Creando la seccion que engloba a todas las carreras
            //$("main").append("<section></section>");

            // Creando una seccion por cada carrera 
            var allRaces = $('Race', datos);
            var i = 1;
            for (var race of allRaces) {
                creaCarreraHTML(race, i);
                i += 1;
            }
        };

        // Si no se ha agregado el titulo de la seccion se agrega
        if (!this.calendarTitleAdded) {
            this.addCalendarTitle();
            this.calendarTitleAdded = true;
        }


        // Si no han transcurrido 10 min, los datos a usar son los almacenados anteriormente
        if (new Date() - this.last_api_call < 600000)
            creaHTML(this.last_api_result);
        else { // Si han transcurrido mas de 10 min, hacemos la llamada al API
            $.ajax({
                dataType: "xml",
                url: this.urlF1,
                method: 'GET',
                success: (datos) => {

                    // Actualizando la fecha de la ultima llamada
                    this.last_api_call = new Date();

                    // Actualizando el resultado
                    this.last_api_result = datos;

                    // Los datos a usar son la propia llamada a la API
                    creaHTML(datos);
                },
                error: (e) => {
                    console.log("Un error occurrio al consultar la API de Ergast F1");
                    console.log(JSON.stringify(e));
                }
            });
        }
    }

    addCalendarTitle() {

        // Creando la seccion del titulo
        $("main").append("<section></section>");

        // Creando la imagen de la F1
        var f1URL = "multimedia/imagenes/f1.png";
        var f1Alt = "Logo de la F1";
        $("main>section").append("<img>");
        $("main>section>img").attr("src", f1URL);
        $("main>section>img").attr("alt", f1Alt);

        // Creando el titulo
        $("main>section").append("<h3>Calendario de la Temporada 2023</h3>");

        // Haciendo que el boton no se vuelva a llamar para no generar mas contenido
        $("button").attr("disabled", "disabled");
    }
}

var m = new Agenda();