"use strict";

class Sudoku {

    constructor() {
        this.boardString = "3.4.69.5....27...49.2..4....2..85.198.9...2.551.39..6....8..5.32...46....4.75.9.6";
        this.rows = 9;
        this.columns = 9;

        this.isACellClicked = false;
        this.cellClicked = null;

        this.board = new Array(this.rows);
        for (var i = 0; i < this.board.length; i++)
            this.board[i] = new Array(this.columns);

        this.start();
    }

    start() {

        var charToPush = 0;

        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
                this.boardString.charAt(charToPush) === "." ?
                    this.board[i][j] = 0 : this.board[i][j] = parseInt(this.boardString.charAt(charToPush));
                charToPush++;
            }
        }
    }

    createStructure() {

        var gameSection = document.querySelector("main>section");

        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {

                // Simplemente creando la estructura de parrafos. 
                //
                // Si la celda es un 0 -> Se añade data-i,data-j.
                // Si la celda es != 0 -> Se añade ademas el data-state=blocked
                if (this.board[i][j] === 0) {
                    gameSection.innerHTML += '<p data-i="' + i + '" data-j="' + j + '"></p>';
                } else {
                    gameSection.innerHTML += '<p data-i="' + i + '" data-j="' + j + '" data-state="blocked"></p>';
                }
            }
        }
    }

    paintSudoku() {
        this.createStructure();

        // Poniendo el valor que corresponde a cada parrafo
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {

                if (this.board[i][j] === 0)
                    continue

                var pInGame = 'main>section p[data-i="' + i + '"][data-j="' + j + '"]';
                var p = document.querySelector(pInGame);
                p.innerHTML = this.board[i][j];
            }
        }

        // Añadiendo el evento onClick a los elementos correspondientes
        this.addOnClickHandler();

    }

    addOnClickHandler() {
        // Añadiendo el evento onclick a los p que no tienen el atributo data-state
        var ps = document.querySelectorAll("main>section p:not([data-state])");
        var i = 0;

        for (i; i < ps.length; i++) {
            ps[i].onclick = this.clickCell.bind(ps[i], this);
        }
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

    keyUpHandler(ev) {

        // Verificamos que es un numero
        if (ev.keyCode < 49 || ev.keyCode > 57)
            return;

        if (this.isACellClicked) {
            this.introduceNumber(parseInt(ev.key));
        } else
            alert("Tienes que seleccionar una celda!!");
    }

    introduceNumber(number) {

        var rowSelected = this.cellClicked.getAttribute("data-i");
        var columnSelected = this.cellClicked.getAttribute("data-j");

        if (!this.isAValidNumber(number, rowSelected, columnSelected))
            return;

        // Modificacion: No quitamos los eventos onclick de los parrafos para
        // que el usuario pueda modificar opciones anteriores.
        // this.cellClicked.onclick = null;
        this.cellClicked.setAttribute('data-state', 'correct');
        this.cellClicked.textContent = number;
        this.board[rowSelected][columnSelected] = number;

        if (this.compruebaSudokuFinalizado()) {
            alert("Sudoku finalizado!!");
        }
    }

    isAValidNumber(number, rowSelected, columnSelected) {
        // Revisamos la fila
        if (this.board[rowSelected].includes(number)) {
            return false;
        }

        // Revisamos la columna
        for (var i = 0; i < this.rows; i++) {
            if (this.board[i][columnSelected] === number)
                return false;
        }

        // Revisamos la subcelda
        var subgridRow = Math.floor(rowSelected / 3) * 3;
        var subgridCol = Math.floor(columnSelected / 3) * 3;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (this.board[subgridRow + i][subgridCol + j] === number) {
                    return false;
                }
            }
        }

        return true;
    }

    compruebaSudokuFinalizado() {

        for (var i = 0; i < this.rows; i++)
            if (this.board[i].includes(0))
                return false;

        return true;
    }




}