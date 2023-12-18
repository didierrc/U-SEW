"use strict";

class Noticias {

    // Comprueba que el navegador del usuario soporta API file
    constructor() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            $("main>p").before("<p>Este navegador soporta el API file!!</p>");
        } else {
            $("main").append("<p>Este navegador no soporta el API file!!</p>");
            $("main").append("<p>Los contenidos del documento no pueden enseñarse correctamente.</p>");
        }

        this.isSeccionNewNoticiasAdded = false;
    }

    // Lee las noticias.txt
    readInputFile(files) {

        var file = files[0]; // Solo permite seleccionar un archivo
        var textType = "text/plain"; // Solo permitimos archivos txt

        if (file.type.match(textType)) {

            var reader = new FileReader();
            // Una vez el archivo ha terminado de cargarse se llama a la funcion
            reader.onload = () => {
                this.insertNoticiasFromFile(reader.result);
            }
            reader.readAsText(file);
        } else
            alert("Solo se permite subir archivos de texto para mostrar las noticias ( NombreArchivo.txt )");
    }

    // Introduce las noticias almacenadas en noticias.txt
    insertNoticiasFromFile(noticiasTxt) {

        var noticias = noticiasTxt.split("\n");

        var i = 0;
        for (i; i < noticias.length; i++) {

            var noticia = noticias[i];
            var noticiaInfo = noticia.split("_");
            var titulo = noticiaInfo[0];
            var subtitulo = noticiaInfo[1];
            var contenido = noticiaInfo[2];
            var autor = noticiaInfo[3];

            var creadorParrafo = (texto) => "<p>" + texto + "</p>";

            var noticiaArticle = $("<article></article>"); // Añadiendo la noticia
            noticiaArticle.append("<h3>" + titulo + "</h3>");
            noticiaArticle.append("<h4>" + subtitulo + "</h4>");
            noticiaArticle.append(creadorParrafo(contenido));
            noticiaArticle.append(creadorParrafo(autor));

            // Si existe ya un articulo, lo añadimos despues de el
            if ($("main>article:last")[0])
                $("main>article:last").after(noticiaArticle)
            else // Si es la primera noticia, se inserta despues del input
                $("main").append(noticiaArticle)
        }

        // Añadimos la seccion para que el usuario pueda añadir más noticias
        if (!this.isSeccionNewNoticiasAdded) {
            this.showAddNewNoticiaSection();
            this.isSeccionNewNoticiasAdded = true;
        }

    }

    showAddNewNoticiaSection() {

        var creadorPTexto = (id, labelFor, input) => '<p><label for="' + id + '">' + labelFor + "</label>" + input + "</p>";
        var creadorInputTexto = (id, placeholder) => "<input id='" + id + "' type='text' placeholder='" + placeholder + "' required>";
        var creadorTextArea = (id, titulo, nameTxtArea) => "<p><label for='" + id + "'>" + titulo + "</p> <textarea id='" + id + "' name='" + nameTxtArea + "' required></textarea>";
        var creadorBoton = (value) => "<button type='button'>" + value + "</button>"

        $("main").append("<section></section>");
        $("main>section:last").append("<h3>Añade tu nueva noticia</h3>");

        $("main>section:last").append(creadorPTexto("titulo", "Titulo: ", creadorInputTexto("titulo", "Escribe el titulo")));
        $("main>section:last").append(creadorPTexto("subtitulo", "Subtitulo: ", creadorInputTexto("subtitulo", "Escribe el subtitulo")));
        $("main>section:last").append(creadorTextArea("contenido", "Contenido de la noticia:", "contenidoNoticia"));
        $("main>section:last").append(creadorPTexto("autor", "Autor: ", creadorInputTexto("autor", "Escribe el autor")));
        $("main>section:last").append(creadorBoton("Añade nueva noticia!!"));

        $("button").on("click", this.insertNewNoticias);
    }

    insertNewNoticias() {

        var titulo = $("main>section:last>p:first input").val();
        if (titulo === "") {
            alert("La noticia debe tener un titulo");
            return;
        }

        var subtitulo = $("main>section:last>p:nth-of-type(2) input").val();
        if (subtitulo === "") {
            alert("La noticia debe tener un subtitulo");
            return;
        }

        var contenido = $("textarea").val();
        if (contenido === "") {
            alert("La noticia debe tener un contenido");
            return;
        }

        var autor = $("main>section:last>p:last input").val();
        if (autor === "") {
            alert("La noticia debe tener un autor");
            return;
        }

        var creadorParrafo = (texto) => "<p>" + texto + "</p>";

        var noticiaArticle = $("<article></article>"); // Añadiendo la noticia
        noticiaArticle.append("<h3>" + titulo + "</h3>");
        noticiaArticle.append("<h4>" + subtitulo + "</h4>");
        noticiaArticle.append(creadorParrafo(contenido));
        noticiaArticle.append(creadorParrafo(autor));

        $("main>article:last").after(noticiaArticle)

    }

}