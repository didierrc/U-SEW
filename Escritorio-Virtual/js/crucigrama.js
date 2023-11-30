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
        this.nivel = "Fácil";

        // Inicializando el array bidimensional
        this.cols = 9;
        this.rows = 11;
        this.crucigrama = new Array();
        for (var i = 0; i < this.rows; i++)
            this.crucigrama.push(new Array(this.columns));

        this.init_time = null;
        this.end_time = null;

        this.isACellClicked = false;
        this.cellClicked = null;

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
                    $("main>p:last").attr("data-i", i);
                    $("main>p:last").attr("data-j", j);
                } else if (valorCelda === -1) {
                    $("main").append("<p></p>");
                    $("main>p:last").attr("data-state", "empty");
                } else {
                    $("main").append("<p>" + valorCelda + "</p>");
                    $("main>p:last").attr("data-state", "blocked");
                }



            }
        }

        // Añadiendo el evento click a todos los p que no tienen el atributo data-state en
        // el momento de la inicializacion
        this.addClickEventHandler();

        // Empieza el juego
        this.init_time = new Date();
    }


    addClickEventHandler() {

        var pClickables = $("main>p:not([data-state])");

        var i = 0;
        for (i; i < pClickables.length; i++)
            pClickables[i].onclick = this.clickCell.bind(pClickables[i], this);

    }

    clickCell(game) {

        if (game.isACellClicked) {
            if (game.cellClicked != this) {
                game.cellClicked.removeAttribute('data-state');
            }
        }

        this.setAttribute('data-state', "clicked");
        game.isACellClicked = true;
        game.cellClicked = this;


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

    introduceElement(element) {
        var expression_row = true;
        var expression_col = true;

        var iOfCell = $(this.cellClicked).attr("data-i");
        var jOfCell = $(this.cellClicked).attr("data-j");
        this.crucigrama[iOfCell][jOfCell] = element;

        // Comprobando la horizontal

        var first_number = 0;
        var second_number = 0;
        var expression = 0;
        var result = 0;

        // Partimos de la casilla inmediatamente a la derecha
        jOfCell++;
        if (jOfCell < this.cols) { // Comprobamos que esta dentro de los limites

            if (this.crucigrama[iOfCell][jOfCell] != -1) { // Comprobamos que no sea un -1
                do { // Comprobamos que la casilla es un "="

                    if (this.crucigrama[iOfCell][jOfCell] === "=") { // Si lo es, seteamos los valores
                        first_number = this.crucigrama[iOfCell][jOfCell - 3];
                        second_number = this.crucigrama[iOfCell][jOfCell - 1];
                        expression = this.crucigrama[iOfCell][jOfCell - 2];
                        result = this.crucigrama[iOfCell][jOfCell + 1];
                        break; // salimos del bucle
                    }

                    jOfCell++; // Si no es el elemento que buscamos, aumentamos la j

                    if (jOfCell >= this.cols)
                        break; // salimos si j is out of bounds 

                } while (this.crucigrama[iOfCell][jOfCell] != -1) // comprobamos que no sea -1
            }

        }

        // Si los valores son distinto de cero
        if (first_number != 0 && second_number != 0 && expression != 0 && result != 0) {

            // SE DEBE MIRAR SI LA POSICION DE UN EXPR PUEDE LLEVAR UN NUMERO?

            // Los unimos con join
            var myExprArray = [first_number, expression, second_number];
            // Intentamos evaluar la expr (si se introduce una expr en el sitio de un numero,
            // se captura el error y exp_col = false)
            var evalResult;
            try {
                evalResult = eval(myExprArray.join(''));

                // Comprobamos si el resultado es correto
                if (evalResult != result)
                    expression_row = false;

            } catch (error) {
                expression_row = false;
            }

        }

        // Comprobando la vertical

        var iOfCell = $(this.cellClicked).attr("data-i");
        var jOfCell = $(this.cellClicked).attr("data-j");

        var first_number = 0;
        var second_number = 0;
        var expression = 0;
        var result = 0;

        // Partimos de la casilla inmediatamente inferior
        iOfCell++;
        if (iOfCell < this.rows) { // Comprobamos que esta dentro de los limites
            if (this.crucigrama[iOfCell][jOfCell] != -1) {
                do { // Comprobamos que la casilla es un "="

                    if (this.crucigrama[iOfCell][jOfCell] === "=") { // Si lo es, seteamos los valores
                        first_number = this.crucigrama[iOfCell - 3][jOfCell];
                        second_number = this.crucigrama[iOfCell - 1][jOfCell];
                        expression = this.crucigrama[iOfCell - 2][jOfCell];
                        result = this.crucigrama[iOfCell + 1][jOfCell];
                        break; // salimos del bucle
                    }

                    iOfCell++; // Si no es el elemento que buscamos, aumentamos la i

                    if (iOfCell >= this.rows)
                        break; // salimos si i is out of bounds 

                } while (this.crucigrama[iOfCell][jOfCell] != -1) // comprobamos que no sea -1

            }
        }

        // Si los valores son distinto de cero
        if (first_number != 0 && second_number != 0 && expression != 0 && result != 0) {

            // Los unimos con join
            var myExprArray = [first_number, expression, second_number];
            // Intentamos evaluar la expr (si se introduce una expr en el sitio de un numero,
            // se captura el error y exp_col = false)
            var evalResult;
            try {
                evalResult = eval(myExprArray.join(''));

                // Comprobamos si el resultado es correto
                if (evalResult != result)
                    expression_col = false;

            } catch (error) {
                expression_col = false;
            }



        }

        // Mostramos el elemento en pantalla o no

        var iOfCell = $(this.cellClicked).attr("data-i");
        var jOfCell = $(this.cellClicked).attr("data-j");

        if (expression_row && expression_col) {

            $(this.cellClicked).text(element); // Mostramos el valor introducido
            $(this.cellClicked).attr("data-state", "correct"); // Estado en correcto
            // QUITAMOS EL EVENTO ONCLICK?
        } else {
            this.crucigrama[iOfCell][jOfCell] = 0;
            $(this.cellClicked).removeAttr("data-state"); // deja de estar seleccionada
            alert("Elemento introducido no correcto");
        }

        // Se deselecciona la celda
        this.isACellClicked = false;
        this.cellClicked = null;

        // Comprobamos el final del crucigrama
        if (this.check_win_condition()) {
            this.end_time = new Date();
            alert("El juego ha terminado!!. Duración: " + this.calculate_date_difference());
            this.createRecordForm();
        }


    }

    createRecordForm(){

        // Introducimos el titulo del formulario
        $("body").append("<h4>Introduce tus datos para guardar el tiempo</h4>");

        // Introudcimos el formulario en sí
        $("body").append('<form action="#" method="post" name="record"></form>');

        // Introducimos todos los campos del formulario
        var nombreField = '<p>Nombre: <input type="text" name="nombre" placeholder="Introduce aquí tu nombre" required></p>';
        var apellidosField = '<p>Apellidos: <input type="text" name="apellidos" placeholder="Introduce aquí tus apellidos" required></p>';
        var nivelField = '<p>Nivel: <input type="text" name="nivel" value="' + this.nivel + '" readonly></p>';
        var tiempoField = '<p>Tiempo: <input type="text" name="tiempo" value="' + this.calculate_date_difference() +'" readonly></p>';
        var submitField = '<input type="submit" value="Guardar el tiempo!!">';

        $("form").append(nombreField);
        $("form").append(apellidosField);
        $("form").append(nivelField);
        $("form").append(tiempoField);
        $("form").append(submitField);
    }

}

var juego = new Crucigrama();