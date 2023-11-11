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
                    this.board[i][j] = 0 : this.board[i][j] = parseInt(this.boardString.charAt(charToPush), 10);
                charToPush++;
            }
        }
    }

    createStructure() {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {

                if (this.board[i][j] === 0) {
                    document.write('<p data-i="' + i + '" data-j="' + j + '"></p>');
                } else {
                    document.write('<p data-state="blocked">' + this.board[i][j] + '</p>')
                }



            }
        }
    }

    addOnClickHandler() {
        var ps = document.querySelectorAll("main>section p");
        var i = 0;

        for (i; i < ps.length; i++) {
            if (!ps[i].getAttribute("data-state")) {
                ps[i].onclick = this.clickCell.bind(ps[i], this);
            }

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

    keyDownHandler(ev) {

        if (!isFinite(ev.key))
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

        // Si dejamos esto no seriamos capaces de modificar nuestras opciones anteriores
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
        if (this.board.some(r => r[columnSelected] === number)) {
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

        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
                if (this.board[i][j] === 0 || !this.isAValidNumber(this.board[i][j], i, j))
                    return false;
            }
        }

        return true;
    }

    paintSudoku() {
        this.createStructure();
        this.addOnClickHandler();
    }


}