// Key: ddbe51fd442c70e2750078a38b9f3ae0
// Secret: 41ce02adccff2ee6
// flickr.photos.search

"use strict";
class Fondo {

    constructor(nombrePais, nombreCapital, coordenadasCapital) {
        this.nombrePais = nombrePais;
        this.nombreCapital = nombreCapital;
        this.latitud = coordenadasCapital.split(",")[0];
        this.longitud = coordenadasCapital.split(",")[1];

        // Este atributo es solo para colocar la foto deseada en la página web
        // Ya que cada vez que se llama al API devuelve una imagen distinta
        // Otra foto de interes: https://live.staticflickr.com/65535/53349302913_1a1c147e49_b.jpg
        this.desiredURL = "https://live.staticflickr.com/65535/53349518320_f15245ecba_b.jpg"
    }

    consultaFlickr() {

        var flickerAPI = "https://www.flickr.com/services/rest/?method=flickr.photos.search";

        $.getJSON(flickerAPI, {
            "api_key": "ddbe51fd442c70e2750078a38b9f3ae0",
            "lat": this.latitud,
            "lon": this.longitud,
            "format": "json",
            "nojsoncallback": "1"
        }).done((data) => {

            // Vemos si existen las fotos
            if (data && data["photos"]) {
                console.log("API Response SUCCESS");

                // Seleccionamos la primera foto
                var photoMonaco = data["photos"]["photo"][0];
                var url = "https://live.staticflickr.com/" + photoMonaco["server"] + "/" + photoMonaco["id"]
                    + "_" + photoMonaco["secret"] + "_b.jpg";

                // Si se quiere obtener directamente la imagen del API simplemente
                // comentar este if
                if (this.desiredURL != url)
                    url = this.desiredURL;

                // Asociamos la imagen obtenida a nuestro documento html
                $("body").css("background", "no-repeat url(" + url + ")  center center fixed")
                    .css('background-size', 'cover');
            } else
                console.error("Invalid response"); // Si no existen las fotos, muestra error en consola
        });


    }


}

// Creacion de la clase fondo
var fondo = new Fondo("Mónaco", "Mónaco", "43.73097,7.424815");