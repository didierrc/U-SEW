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
}

var monaco = new Pais("Mónaco", "Mónaco", "36 686");
monaco.fillSecondaryAttributes("Monarquía Constitucional", "43.73097,7.424815", "Católica");