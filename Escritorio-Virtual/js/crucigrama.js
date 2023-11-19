// Como se comprueba: click casilla, ponerlo array
// 1. Buscar en mi fila el "=". [w-3] first [w-2] op [w-1] second. Dejas de buscar si -1 o out
// 2. Join para unir todo.
// 3. Eval del join (Si first != 0 op != 0 and second != 0)
// 4. Comprobar [w+1] con eval
// Comprobaciones de IZQ a DCHA y de ARRIBA a ABAJO

// ------------------------- Crucigramas -------------------------
// Facil: "4,*,.,=,12,#,#,#,5,#,#,*,#,/,#,#,#,*,4,-,.,=,.,#,15,#,.,*,#,=,#,=,#,/,#,=,.,#,3,#,4,*,.,=,20,=,#,#,#,#,#,=,#,#,8,#,9,-,.,=,3,#,.,#,#,-,#,+,#,#,#,*,6,/,.,=,.,#,#,#,.,#,#,=,#,=,#,#,#,=,#,#,6,#,8,*,.,=,16"
// Medio: "12,*,.,=,36,#,#,#,15,#,#,*,#,/,#,#,#,*,.,-,.,=,.,#,55,#,.,*,#,=,#,=,#,/,#,=,.,#,15,#,9,*,.,=,45,=,#,#,#,#,#,=,#,#,72,#,20,-,.,=,11,#,.,#,#,-,#,+,#,#,#,*,56,/,.,=,.,#,#,#,.,#,#,=,#,=,#,#,#,=,#,#,12,#,16,*,.,=,32"
// Dificil: "4,.,.,=,36,#,#,#,25,#,#,*,#,.,#,#,#,.,.,-,.,=,.,#,15,#,.,*,#,=,#,=,#,.,#,=,.,#,18,#,6,*,.,=,30,=,#,#,#,#,#,=,#,#,56,#,9,-,.,=,3,#,.,#,#,*,#,+,#,#,#,*,20,.,.,=,18,#,#,#,.,#,#,=,#,=,#,#,#,=,#,#,18,#,24,.,.,=,72"

"use strict";
class Crucigrama {

    constructor() {
        this.board = "4,*,.,=,12,#,#,#,5,#,#,*,#,/,#,#,#,*,4,-,.,=,.,#,15,#,.,*,#,=,#,=,#,/,#,=,.,#,3,#,4,*,.,=,20,=,#,#,#,#,#,=,#,#,8,#,9,-,.,=,3,#,.,#,#,-,#,+,#,#,#,*,6,/,.,=,.,#,#,#,.,#,#,=,#,=,#,#,#,=,#,#,6,#,8,*,.,=,16";

        // Inicializando el array bidimensional
        this.cols = 9;
        this.rows = 11;
        this.crucigrama = new Array();
        for (var i = 0; i < this.rows; i++)
            this.crucigrama.push(new Array(this.columns));

        this.init_time = null;
        this.end_time = null;

        this.start();
    }

    start() {

        var rawBoard = this.board.split(",");

        var charToPush = 0;
        var char;

        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {

                char = rawBoard[charToPush];

                if (char === ".")
                    this.crucigrama[i][j] = 0;
                else if (char === "#")
                    this.crucigrama[i][j] = -1;
                else
                    this.crucigrama[i][j] = char;

                charToPush++;
            }
        }
    }

    paintMathword() {

        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {

                var valorCelda = this.crucigrama[i][j];

                if (valorCelda === 0) {
                    $("main").append("<p></p>");
                } else if (valorCelda === -1) {
                    $("main").append("<p></p>");
                    $("main>p:last-child").attr("data-state", "empty");
                } else {
                    $("main").append("<p>" + valorCelda + "</p>");
                    $("main>p:last-child").attr("data-state", "blocked");
                }
            }
        }
        // Empieza el juego
        this.init_time = new Date();
    }

    check_win_condition() {

        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                if (this.crucigrama[i][j] === 0)
                    return false;
            }
        }

        return true;
    }

    calculate_date_difference() {

        var elapsedTime = this.end_time - this.init_time;

        var segsDiv = 1000;
        var minDiv = segsDiv * 60;
        var hourDiv = minDiv * 60;

        var hoursElapsed = Math.floor(elapsedTime / hourDiv);
        elapsedTime -= (hoursElapsed * hourDiv);

        var minutesElapsed = Math.floor(elapsedTime / minDiv);
        elapsedTime -= (minutesElapsed * minDiv);

        var secondsElapsed = Math.floor(elapsedTime / segsDiv);

        return hoursElapsed + ":" + minutesElapsed + ":" + secondsElapsed;
    }
}

var juego = new Crucigrama();