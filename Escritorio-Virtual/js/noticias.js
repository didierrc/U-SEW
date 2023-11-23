"use strict";

class Noticias{

    // Comprueba que el navegador del usuario soporta API file
    constructor(){
        if(window.File && window.FileReader && window.FileList && window.Blob){
            $("main").append("<p>Este navegador soporta el API file!!</p>");
        }else{
            $("main").append("<p>Este navegador no soporta el API file!!</p>");
            $("main").append("<p>Los contenidos del documento no pueden enseñarse correctamente.</p>");
        }
    }

    // Lee las noticias.txt
    readInputFile(files){
        
        var file = files[0]; // Solo permite seleccionar un archivo
        var textType = /text.*/; // Solo permitimos archivos txt

        if(file.type.match(textType)){

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
    insertNoticiasFromFile(noticiasTxt){

        var creadorParrafo = (texto) => "<p>" + texto + "</p>";

        var noticias = noticiasTxt.split("\n");
        
        var i = 0;
        for(i; i < noticias.length; i++){

            var noticia = noticias[i];
            var noticiaInfo = noticia.split("_");
            var titulo = noticiaInfo[0];
            var subtitulo = noticiaInfo[1];
            var contenido = noticiaInfo[2];
            var autor = noticiaInfo[3];

            $("main").append("<article></article>"); // Añadiendo la noticia
            $("main>article:last").append("<h3>" + titulo +"</h3>");
            $("main>article:last").append("<h4>" + subtitulo +"</h4>");
            $("main>article:last").append(creadorParrafo(contenido));
            $("main>article:last").append(creadorParrafo(autor));
        }

    }

}