"use strict";

class Memoria {

    constructor() {

        this.elements = {
            "carta0": {
                "element": "HTML5",
                "source": "https://upload.wikimedia.org/wikipedia/commons/3/38/HTML5_Badge.svg"
            },
            "carta1": {
                "element": "HTML5",
                "source": "https://upload.wikimedia.org/wikipedia/commons/3/38/HTML5_Badge.svg"
            },
            "carta2": {
                "element": "CSS3",
                "source": "https://upload.wikimedia.org/wikipedia/commons/6/62/CSS3_logo.svg"
            },
            "carta3": {
                "element": "CSS3",
                "source": "https://upload.wikimedia.org/wikipedia/commons/6/62/CSS3_logo.svg"
            },
            "carta4": {
                "element": "JS",
                "source": "https://upload.wikimedia.org/wikipedia/commons/b/ba/Javascript_badge.svg"
            },
            "carta5": {
                "element": "JS",
                "source": "https://upload.wikimedia.org/wikipedia/commons/b/ba/Javascript_badge.svg"
            },
            "carta6": {
                "element": "PHP",
                "source": "https://upload.wikimedia.org/wikipedia/commons/2/27/PHP-logo.svg"
            },
            "carta7": {
                "element": "PHP",
                "source": "https://upload.wikimedia.org/wikipedia/commons/2/27/PHP-logo.svg"
            },
            "carta8": {
                "element": "SVG",
                "source": "https://upload.wikimedia.org/wikipedia/commons/4/4f/SVG_Logo.svg"
            },
            "carta9": {
                "element": "SVG",
                "source": "https://upload.wikimedia.org/wikipedia/commons/4/4f/SVG_Logo.svg"
            },
            "carta10": {
                "element": "W3C",
                "source": "https://upload.wikimedia.org/wikipedia/commons/5/5e/W3C_icon.svg"
            },
            "carta11": {
                "element": "W3C",
                "source": "https://upload.wikimedia.org/wikipedia/commons/5/5e/W3C_icon.svg"
            }
        }

        this.hasFlippedCard = false;
        this.lockBoard = false;
        this.firstCard = null;
        this.secondCard = null;

        this.shuffleElements();
        this.createElements();
        this.addEventListeners();

    }

    shuffleElements() {

        // Numero total de elementos dentro del JSON
        var i = this.getNumberCards() - 1; // Desde i = 11
        var randomIndex;

        while (i > 0) {

            // Escogemos un index random
            randomIndex = Math.floor(Math.random() * i);
            i--;

            // Cambiamos el elemento actual por el index elegido
            var temp = this.elements["carta" + i];
            this.elements["carta" + i] = this.elements["carta" + randomIndex];
            this.elements["carta" + randomIndex] = temp;

        }
    }

    getNumberCards() {
        return Object.keys(this.elements).length;
    }

    createElements() {

        // Numero total de elementos dentro del JSON
        var len = this.getNumberCards();
        var i = 0;
        var gameSection = document.querySelector("main>section");

        for (i; i < len; i++) {

            var elementString = this.elements["carta" + i]["element"];
            var imgString = this.elements["carta" + i]["source"];
            var articleToInsert = '<article data-element="';
            articleToInsert += elementString + '">';
            articleToInsert += "<h3>Tarjeta de memoria</h3>";
            articleToInsert += '<img alt="Imagen de la carta ' + elementString + '" src="';
            articleToInsert += imgString + '">';
            articleToInsert += "</article>";

            gameSection.innerHTML += articleToInsert;
        }
    }

    addEventListeners() {

        var cards = document.querySelectorAll("main>section article");

        for (var i = 0; i < cards.length; i++) {
            cards[i].onclick = this.flipCard.bind(cards[i], this);
        }
    }

    flipCard(game) {

        // Si tarjeta ya estaba revelada, no se hace nada.
        if (this.getAttribute('data-state') === 'revealed')
            return;

        // Si tarjeta es pulsada cuando el juego está bloqueado, no se hace nada.
        if (game.lockBoard)
            return;

        // Si tarjeta pulsada es la misma, no se hace nada.
        if (this === game.firstCard)
            return;

        // Volteamos tarjeta...
        this.setAttribute('data-state', 'flip');

        // Si el juego no tiene una tarjeta volteada...
        if (!game.hasFlippedCard) {
            game.hasFlippedCard = true;
            game.firstCard = this;
        } else { // Si el juego tiene una tarjeta volteada...
            game.secondCard = this;
            game.checkForMatch();
        }
    }

    checkForMatch() {
        this.firstCard.getAttribute("data-element") === this.secondCard.getAttribute("data-element") ?
            this.disableCards() : this.unflipCards();
    }

    disableCards() {
        this.firstCard.setAttribute('data-state', 'revealed');
        this.secondCard.setAttribute('data-state', 'revealed');
        this.resetBoard();
    }

    unflipCards() {
        this.lockBoard = true;

        setTimeout(() => {
            this.firstCard.removeAttribute('data-state');
            this.secondCard.removeAttribute('data-state');
            this.resetBoard();
        }, 800);
    }

    resetBoard() {
        this.firstCard = null;
        this.secondCard = null;
        this.hasFlippedCard = false;
        this.lockBoard = false;
    }
}

var game = new Memoria();