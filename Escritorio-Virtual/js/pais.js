// Key: 5b4e304cb2042d8fdd3b883201af3d82
// Example of call: api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=5b4e304cb2042d8fdd3b883201af3d82
// API documentation: https://openweathermap.org/forecast5

"use strict";
class Pais {

    constructor(nombre, capital, poblacion) {
        this.nombre = nombre;
        this.capital = capital;
        this.poblacion = poblacion;
    }

    fillSecondaryAttributes(formaGobierno, coordenadasCapital, religion) {
        this.formaGobierno = formaGobierno;
        this.coordenadasCapital = coordenadasCapital;
        this.religion = religion;
    }

    getNombre() {
        return this.nombre;
    }

    getCapital() {
        return this.capital;
    }

    getPoblacion() {
        return this.poblacion;
    }

    getFormaGobierno() {
        return this.formaGobierno;
    }

    getReligion() {
        return this.religion;
    }

    getSecondaryInfoHTML() {

        var liPoblacion = "<li> Poblacion: " + this.poblacion + "</li>";
        var liFormaGobierno = "<li> Forma de gobierno: " + this.formaGobierno + "</li>";
        var liReligion = "<li> Religión mayoritaria: " + this.religion + "</li>";

        return "<ul>" + liPoblacion + liFormaGobierno + liReligion + "</ul>";
    }

    writeCoordenadasCapital() {
        document.write("<p>Coordenadas capital: " + this.coordenadasCapital + "</p>");
    }

    // Consulta la meteorologia para los proximos 5 dias (el primer dia es el actual)
    consultaMeteo() {

        var units = "&units=metric";
        var lang = "&lang=es";
        var latitud = this.coordenadasCapital.split(",")[0];
        var longitud = this.coordenadasCapital.split(",")[1];
        var openWeatherAPI = "http://api.openweathermap.org/data/2.5/forecast?lat="
            + latitud + "&lon=" + longitud + units + lang + "&appid=5b4e304cb2042d8fdd3b883201af3d82";

        var forecast5Days = new Array();

        // Llamada AJAX
        $.ajax({
            dataType: "json",
            url: openWeatherAPI,
            method: 'GET',
            success: (datos) => {
                console.log("SUCCESS");

                var currentDateTime = new Date();
                var currentHour = currentDateTime.getHours();

                var nday = 0;
                for (var f of datos["list"]) {

                    var dateForecast = new Date(f["dt_txt"]);

                    // Si estamos en el mismo dia y la hora es igual o mayor
                    if (dateForecast.getDate() === currentDateTime.getDate()
                        && dateForecast.getMonth() === currentDateTime.getMonth()
                        && dateForecast.getFullYear() === currentDateTime.getFullYear()
                        && dateForecast.getHours() >= currentHour) {

                        // Para obtener la misma hora en todos los forecast
                        if (nday === 0)
                            currentHour = dateForecast.getHours();

                        // Añadimos a nuestro forecast array y actulizamos para obtener el siguiente dia
                        forecast5Days.push(f);
                        nday++;
                        currentDateTime.setDate(currentDateTime.getDate() + 1);
                    }

                    // Si ya obtuvimos el numero de forecast necesario, salimos del bucle
                    if (nday === 5)
                        break;
                }

                console.log(forecast5Days);
                this.insertaMeteoEnHtml(forecast5Days);
            },
            error: (e) => {
                console.log("Un error occurrio al consultar la API de OpenWeather");
                console.log(JSON.stringify(e));
            }
        });

        return forecast5Days;
    }

    insertaMeteoEnHtml(forecasts) {

        for (var i = 0; i < forecasts.length; i++) {

            var forecast = forecasts[i];

            var tempMax = "<li> Temp. max: " + forecast["main"]["temp_max"] + "</li>";
            var tempMin = "<li> Temp. min:" + forecast["main"]["temp_min"] + "</li>";
            var humidityPercentage = "<li> Humidity Percentage: " + forecast["main"]["humidity"] + "</li>";
            var icon = "<li>" + "Icon:" + i + "</li>";

            // There may not rain
            var rainAmount;
            try {
                rainAmount = "<li>Rain: " + forecast["rain"]["3h"] + "</li>";
            } catch (error) {
                rainAmount = "";
            }



            var testList = "<ul>" + tempMax + tempMin + humidityPercentage + icon + rainAmount + "</ul>"

            $("main article:last-child")
                .append("<p>Forecast for Day: " + forecast["dt_txt"] + "</p>")
                .append("<ul>" + testList + "</ul>");




        }


    }

}

var monaco = new Pais("Monaco", "Monaco", "36 686");
monaco.fillSecondaryAttributes("Monarquia Constitucional", "43.734238659378725,7.421688705466854", "Catolica");