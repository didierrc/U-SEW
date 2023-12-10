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
            "Bahrain": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Flag_of_Bahrain_%28bordered%29.svg/800px-Flag_of_Bahrain_%28bordered%29.svg.png",
            "Saudi Arabia": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/2000px-Flag_of_Saudi_Arabia.svg.png",
            "Australia": "https://cdn.britannica.com/78/6078-004-77AF7322/Flag-Australia.jpg",
            "Azerbaijan": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Flag_of_Azerbaijan.svg/2560px-Flag_of_Azerbaijan.svg.png",
            "USA": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg",
            "Monaco": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Flag_of_Monaco_%28bordered%29.svg/2560px-Flag_of_Monaco_%28bordered%29.svg.png",
            "Spain": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/2560px-Flag_of_Spain.svg.png",
            "Canada": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Canada_%28Pantone%29.svg/255px-Flag_of_Canada_%28Pantone%29.svg.png",
            "Austria": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_Austria.svg/255px-Flag_of_Austria.svg.png",
            "UK": "https://cdn.britannica.com/25/4825-004-F1975B92/Flag-United-Kingdom.jpg",
            "Hungary": "https://cdn.britannica.com/55/1455-004-5897143C/Flag-Hungary.jpg",
            "Belgium": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Flag_of_Belgium.svg/1182px-Flag_of_Belgium.svg.png",
            "Netherlands": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Flag_of_the_Netherlands.svg/255px-Flag_of_the_Netherlands.svg.png",
            "Italy": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Flag_of_Italy.svg/2560px-Flag_of_Italy.svg.png",
            "Singapore": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Flag_of_Singapore_%28bordered%29.svg/2560px-Flag_of_Singapore_%28bordered%29.svg.png",
            "Japan": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Flag_of_Japan_%28with_border%29.png/640px-Flag_of_Japan_%28with_border%29.png",
            "Qatar": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Flag_of_Qatar_%28bordered%29.svg/1280px-Flag_of_Qatar_%28bordered%29.svg.png",
            "Mexico": "https://cdn.britannica.com/73/2573-050-C825CE68/Flag-Mexico.jpg?w=400&h=235&c=crop",
            "Brazil": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/1280px-Flag_of_Brazil.svg.png",
            "United States": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg",
            "UAE": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Flag_of_the_United_Arab_Emirates.svg/255px-Flag_of_the_United_Arab_Emirates.svg.png"
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
            var wikiUrl = flags[countryRace];
            var imageAlt = "Image of the flag of " + countryRace;
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
        var f1URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/F1.svg/2560px-F1.svg.png";
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