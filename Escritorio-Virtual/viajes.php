<?php

/* Definicion de la clase Carrusel */
class Carrusel{

    private $capital;
    private $pais;

    public function __construct($capital, $pais){
        $this->capital = $capital;
        $this->pais = $pais;
    }

    public function getCarrusel(){
        // Llamada al servicio de Flickr -> return 10 fotos
        $per_page = 10;

        // Procedemos a crear la URL
        $flickrURL = "https://www.flickr.com/services/rest/?method=flickr.photos.search";
        $flickrURL .= "&api_key=ddbe51fd442c70e2750078a38b9f3ae0"; // api key
        $flickrURL .= "&tags=" . $this->capital; // la capital
        $flickrURL .= "&per_page=" . $per_page; // 10 fotos por página
        $flickrURL .= "&format=json&nojsoncallback=1"; // formato json
    
        $response = file_get_contents($flickrURL);
        $json = json_decode($response);

        if($json == null){
            return $json;
        }
            
        $fotos = []; // Array de fotos
        $jsonFotos = $json->photos->photo;

        for($i=0; $i < $per_page; $i++){
            
            $fotoHTML = "<img src='";
            $fotoHTML .= "https://live.staticflickr.com/" . $jsonFotos[$i]->server . "/";
            $fotoHTML .= $jsonFotos[$i]->id . "_" . $jsonFotos[$i]->secret . "_b.jpg";
            $fotoHTML .= "' alt='" . $jsonFotos[$i]->title . "'>";

            $fotos[$i] = $fotoHTML;
        }

        return $fotos;
    }


}

// API: https://www.exchangerate-api.com/docs/standard-requests
class Moneda{

    private $from;
    private $to;

    public function __construct($from, $to){
        $this->from = $from;
        $this->to = $to;
    }

    public function getExchange(){
        
        // Creamos la llamada al API
        $apiKey = "f31809a51348ca688f165d45";
        $apiURL = "https://v6.exchangerate-api.com/v6/". $apiKey . "//latest/" . $this->from;

        $response = file_get_contents($apiURL, true);
        $json = json_decode($response);

        if($json == null){
            return -1; // Devolvemos -1 si no se ha obtenido el API response
        }

        $rateFor = $this->to;
        return $json->conversion_rates->$rateFor; // Devolviendo la tasa de cambio
    }


}

$carrusel = new Carrusel("Monaco", "Monaco");
$fotos = $carrusel->getCarrusel();

$moneda = new Moneda("USD", "EUR"); // Cambio de 1$ a € ya que Monaco usa euros.
$cambio = $moneda->getExchange();

?>


<!DOCTYPE html>
<html lang="es">

<head>
    <!-- Datos que describe el documento -->
    <title>Escritorio Virtual - Viajes</title>

    <meta charset="UTF-8">
    <meta name="author" content="Didier Yamil Reyes Castro">
    <meta name="description" content="Documento con la ubicación actual del usuario y rutas por Mónaco.">
    <meta name="keywords" content="viajes,rutas,ubicacion,hitos">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" type="text/css" href="estilo/estilo.css">
    <link rel="stylesheet" type="text/css" href="estilo/layout.css">
    <link rel="stylesheet" type="text/css" href="estilo/viajes.css">
    <link rel="icon" href="multimedia/favicon-spidey.ico">

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"
        integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="js/viajes.js"></script>
</head>

<body>
    <!-- Seccion Header que agrupa la cabezera de la página web (Cosas que se repiten en todas las páginas Web) -->
    <header>
        <h1>Escritorio Virtual</h1>

        <!-- Seccion Nav que agrupa enlaces a otras páginas web -->
        <nav>
            <a href="index.html" accesskey="I" tabindex="1">Inicio</a>
            <a href="sobremi.html" accesskey="S" tabindex="2">Sobre mi</a>
            <a href="noticias.html" accesskey="N" tabindex="3">Noticias</a>
            <a href="agenda.html" accesskey="A" tabindex="4">Agenda</a>
            <a href="meteorologia.html" accesskey="M" tabindex="5">Meteorología</a>
            <a href="viajes.php" accesskey="V" tabindex="6">Viajes</a>
            <a href="juegos.html" accesskey="J" tabindex="7">Juegos</a>
        </nav>
    </header>

    <main>
        <h2>Viajes</h2>

        <?php 

            if($fotos != null){

                // Añadiendo el articulo que contiene al carrusel

                $fotosArticle = "<article><h3>1. Carrusel de fotos</h3>";
                
                for($i=0; $i < count($fotos); $i++){
                    $fotosArticle .= $fotos[$i];
                }

                // Botones de control
                $fotosArticle .= "<button data-action='next' onclick='v.nextSlide();'>></button>";
                $fotosArticle .= "<button data-action='prev' onclick='v.prevSlide();'><</button>";

                $fotosArticle .= "</article>";

                echo $fotosArticle;
            }

        
        ?>

        <?php

            if($cambio != -1){
                echo "<h3>2. 1$ es equivalente a " . $cambio . "€</h3>";
            }
        
        ?>

        <!--Usando la forma "legacy" de obtener las librerias de la API. Llama a la funcion initMap() declarada
            anteriormente. A partir de ella, la libreria de google ya está lista para su uso por otros metodos 
            (por ejemplo, los archivos KML) -->
            <script
            src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCQHMvNMIE31xvj292ywRrpOOss9JWVv9k"></script>

        <!--Usando libreria dinamicamente siguiendo la documentacion de Google JS API
        Leer el DISCLAIMER de showDynamicMap()
        <script>
            (g => { var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)) })
                ({ key: "AIzaSyCQHMvNMIE31xvj292ywRrpOOss9JWVv9k", v: "weekly" });
        </script>
        -->

        <script> var v = new Viajes(); </script>

        <!-- README! Dado a que se usan las librerias de Google Maps estas presentan errores de marcado HTML
            Si simplemente se carga la pagina, se mostraran 2 mapas que son los que introducen los errores como que
            algunas etiquetas <img> tienen un atributo alt="" vacío, uso de elementos <div>, uso de <div> como 
            hijos de <button>, etc. -->


        <section>
            <h3>3. Esta es tu localización actual (Mapa estático): </h3>
        </section>

        <section>
            <h3>4. Esta es tu localización actual (Mapa dinámico): </h3>
        </section>

        

        <section>
            <h3>5. Procesando un archivo XML con API file</h3>
            <input type="file" onchange="v.procesaXML(this.files);" accept=".xml">
        </section>

        <section>
            <h3>6. Procesando archivos KML con API file</h3>
            <input type="file" onchange="v.procesaKML(this.files);" accept=".kml" multiple>
        </section>

        <section>
            <h3>7. Procesando archivos SVG con API file</h3>
            <input type="file" onchange="v.procesaSVG(this.files);" accept=".svg" multiple>
        </section>
    </main>

</body>

</html>