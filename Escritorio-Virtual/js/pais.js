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
        var openWeatherAPI = "https://api.openweathermap.org/data/2.5/forecast?lat="
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

        var insertaSeccionInfo = (imageUrl, imageAlt, t) => {
            $("main article:last-child>section:last-child").append("<section></section>");

            $("main article:last-child section:last-child>section:last-child").append("<img>");
            $("main article:last-child section:last-child>section:last-child>img").attr("src", imageUrl);
            $("main article:last-child section:last-child>section:last-child>img").attr("alt", imageAlt);
            $("main article:last-child section:last-child>section:last-child").append(t);
        }

        var insertaTituloForecast = (forecast) => {
            var forecastDate = new Date(forecast["dt_txt"]);
            var weekday = forecastDate.toLocaleDateString("es-ES", { weekday: "long" });
            weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1); // Solo para capitalizar la primera letra
            var hour = forecastDate.getHours() + ":" + forecastDate.getMinutes() + "0";
            var title = "<p>" + weekday + " " + hour + "</p>";

            $("main article:last-child>section:last-child").append(title);
        }

        var insertaImagenForecast = (forecast) => {
            var imageUrl = "http://openweathermap.org/img/w/"
                + forecast["weather"][0]["icon"] + ".png";
            var imageAlt = "Representación de: " + forecast["weather"][0]["description"];

            $("main article:last-child>section:last-child").append("<img>");
            $("main article:last-child>section:last-child>img").attr("src", imageUrl);
            $("main article:last-child>section:last-child>img").attr("alt", imageAlt);
        }


        for (var i = 0; i < forecasts.length; i++) {
            var forecast = forecasts[i];

            // Añadiendo la seccion del forecast
            $("main article:last-child").append("<section></section>");

            // Añadiendo el titulo
            insertaTituloForecast(forecast);

            // Añadiendo la imagen
            insertaImagenForecast(forecast);

            // Añadiendo seccion de temperatura maxima
            var t = "<p>Max: " + forecast["main"]["temp_max"] + "º</p>";
            var imageUrl = "multimedia/maxTemp_icon.png";
            var imageAlt = "Icono de temperatura maxima";
            insertaSeccionInfo(imageUrl, imageAlt, t);

            // Añadiendo seccion de temperatura minima
            t = "<p>Min: " + forecast["main"]["temp_min"] + "º</p>";
            imageUrl = "multimedia/minTemp_icon.png";
            imageAlt = "Icono de temperatura minima";
            insertaSeccionInfo(imageUrl, imageAlt, t);

            // Añadiendo seccion de lluvia
            // Puede que no haya la propiedad lluvia en el JSON
            var rainAmount;
            try {
                rainAmount = parseFloat(forecast["rain"]["3h"]);
            } catch (error) {
                rainAmount = "";
            }
            t = "<p>Cantidad de Lluvia: " + (rainAmount === "" ? "0" : rainAmount) + "mm";
            imageUrl = "multimedia/rain_icon.png";
            imageAlt = "Icono de  probabilidad de lluvia";
            insertaSeccionInfo(imageUrl, imageAlt, t);

            // Añadiendo seccion de humedad
            t = "<p>Humedad:" + forecast["main"]["humidity"] + "%</p>";
            imageUrl = "multimedia/humidity_icon.png";
            imageAlt = "Icono de humedad en ambiente";
            insertaSeccionInfo(imageUrl, imageAlt, t);

            // Añadiendo seccion de viento
            t = "<p>Viento:" + forecast["wind"]["speed"] + "km/h</p>";
            imageUrl = "multimedia/wind_icon.png";
            imageAlt = "Icono de viento";
            insertaSeccionInfo(imageUrl, imageAlt, t);
        }
    }
}

var monaco = new Pais("Monaco", "Monaco", "36 686");
monaco.fillSecondaryAttributes("Monarquia Constitucional", "43.734238659378725,7.421688705466854", "Catolica");