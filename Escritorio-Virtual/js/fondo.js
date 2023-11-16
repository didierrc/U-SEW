//  <script src="jquery">
//  <script src="js/pais.js">
//  $('selector').-----
//  $('<img />').attr(...).attr(...)
//  $.getJSON('URL',{}).done((data) => { // seleccion data; $('body')
// .css('back-img', 'foto').css('background-size', 'cover') })

// Como se comprueba: click casilla, ponerlo array
// 1. Buscar en mi fila el "=". [w-3] first [w-2] op [w-1] second. Dejas de buscar si -1 o out
// 2. Join para unir todo.
// 3. Eval del join (Si first != 0 op != 0 and second != 0)
// 4. Comprobar [w+1] con eval
// Comprobaciones de IZQ a DCHA y de ARRIBA a ABAJO

// Clave: ddbe51fd442c70e2750078a38b9f3ae0
// Secreto: 41ce02adccff2ee6
// flickr.photos.search


"use strict";
class Fondo{

    constructor(nombrePais, nombreCapital, coordenadasCapital){
        this.nombrePais = nombrePais;
        this.nombreCapital = nombreCapital;

        var coordenadas = coordenadasCapital.split(",");

        this.longitud = coordenadas[0]; 
        this.latitud = coordenadas[1];
    }

    consultaFlickr(){

        var flickerAPI = "https://www.flickr.com/services/rest/?method=flickr.photos.search";
        
        $.getJSON(flickerAPI, {
            api_key: "ddbe51fd442c70e2750078a38b9f3ae0",
            lat: this.latitud,
            lon: this.longitud
        }).done( (data) => {
            console.log("SUCCESS");
        });


    }


}

var fondo = new Fondo("Mónaco", "Mónaco", "43.73097,7.424815");
fondo.consultaFlickr();