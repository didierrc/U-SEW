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

        var liPoblacion = "<li> Población: " + this.poblacion + "</li>";
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

        // Llamada AJAX
        $.ajax({
            dataType: "json",
            url: openWeatherAPI,
            method: 'GET',
            success: (datos) => {
                console.log("SUCCESS");
                var forecast5Days = new Array();

                var targetDate = null;
                var targetHour = null;

                var nday = 0;
                for (var f of datos["list"]) {

                    var dateForecast = new Date(f["dt_txt"]);

                    // Pillando el dia y hora del primer forecast como target para los siguientes forecast
                    // Es decir: Los 5 forecast serán a la misma hora que el primer forecast devuelto por la
                    // API (el inmediatamente mayor o igual a la hora del sistema)
                    if (targetDate == null && targetHour == null) {
                        targetDate = dateForecast;
                        targetHour = dateForecast.getHours();
                    }

                    // Si estamos en el mismo dia y la hora es igual o mayor
                    if (dateForecast.getDate() === targetDate.getDate()
                        && dateForecast.getMonth() === targetDate.getMonth()
                        && dateForecast.getFullYear() === targetDate.getFullYear()
                        && dateForecast.getHours() >= targetHour) {

                        // Para obtener la misma hora en todos los forecast
                        if (nday === 0)
                            targetHour = dateForecast.getHours();

                        // Añadimos a nuestro forecast array y actulizamos para obtener el siguiente dia
                        forecast5Days.push(f);
                        nday++;
                        targetDate.setDate(targetDate.getDate() + 1);
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
            var title = "<h4>" + weekday + " " + hour + "</h4>";

            $("main article:last-child>section:last-child").append(title);
        }

        var insertaImagenForecast = (forecast) => {
            var imageUrl = "https://openweathermap.org/img/wn/"
                + forecast["weather"][0]["icon"] + "@2x.png";
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
            var t = "<h5>Max: " + forecast["main"]["temp_max"] + "º</h5>";
            var imageUrl = "multimedia/maxTemp_icon.png";
            var imageAlt = "Icono de temperatura maxima";
            insertaSeccionInfo(imageUrl, imageAlt, t);

            // Añadiendo seccion de temperatura minima
            t = "<h5>Min: " + forecast["main"]["temp_min"] + "º</h5>";
            imageUrl = "multimedia/minTemp_icon.png";
            imageAlt = "Icono de temperatura minima";
            insertaSeccionInfo(imageUrl, imageAlt, t);

            // Añadiendo seccion de lluvia: Puede que no haya la propiedad lluvia en el JSON
            // API Docs: If you do not see some of the parameters in your API response it means that these weather 
            // phenomena are just not happened for the time of measurement for the city or location chosen. 
            // Only really measured or calculated data is displayed in API response.

            var rainAmount;
            try {
                rainAmount = parseFloat(forecast["rain"]["3h"]);
            } catch (error) {
                rainAmount = "";
            }
            t = "<h5>Cantidad de Lluvia: " + (rainAmount === "" ? "0" : rainAmount) + "mm";
            t += "</h5>"
            imageUrl = "multimedia/rain_icon.png";
            imageAlt = "Icono de  probabilidad de lluvia";
            insertaSeccionInfo(imageUrl, imageAlt, t);

            // Añadiendo seccion de humedad
            t = "<h5>Humedad: " + forecast["main"]["humidity"] + "%</h5>";
            imageUrl = "multimedia/humidity_icon.png";
            imageAlt = "Icono de humedad en ambiente";
            insertaSeccionInfo(imageUrl, imageAlt, t);

            // Añadiendo seccion de viento
            t = "<h5>Viento: " + forecast["wind"]["speed"] + "km/h</h5>";
            imageUrl = "multimedia/wind_icon.png";
            imageAlt = "Icono de viento";
            insertaSeccionInfo(imageUrl, imageAlt, t);
        }
    }
}

var monaco = new Pais("Mónaco", "Mónaco", "36 686");
monaco.fillSecondaryAttributes("Monarquía Constitucional", "43.737414330497565,7.421303172016904", "Católica");