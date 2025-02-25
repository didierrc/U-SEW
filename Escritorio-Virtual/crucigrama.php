<?php

/* Definicion de la clase Record */
class Record{

    private $server;
    private $user;
    private $pass;
    private $dbname;

    public function __construct(){
        $this->server = "localhost";
        $this->user = "DBUSER2023";
        $this->pass = "DBPSWD2023";
        $this->dbname = "records";
    }

    public function registerNewRecord($userName, $userSurname, $level, $time){

        // Establecemos la conexion con la base de datos
        $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
        
        // Comprobamos conexion
        if($db->connect_error){
            echo "Error al conectarse a la base de datos";
        } else{
            
            // Preparamos la sentencia para evitar Injecciones de Código
            $preparedStatement = $db->prepare("INSERT INTO registro (nombre, apellidos, nivel, tiempo) VALUES (?,?,?,?)");

            // Añadimos los parametros
            $preparedStatement->bind_param("sssi",
                $userName, $userSurname, $level, $time);
            
            // Ejecutamos la sentencia
            $preparedStatement->execute();

            // Cerramos la sentencia
            $preparedStatement->close();

        }

        // Cerramos la conexion
        $db->close();

        // Mostramos los 10 mejores records luego de "intentar" añadir el ultimo record
        return $this->showBestRecords($level);
    }

    private function showBestRecords($level){

        // Establecemos la conexion con la base de datos
        $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
        
        // Seccion a devolver
        $sectionToReturn = "<section data-type='record'>";

        // Comprobamos conexion
        if($db->connect_error){
            $sectionToReturn .= "<h4>Error al conectarse a la base de datos. No se pueden mostrar los records!</h4>";
        } else{
            
            // Preparamos la sentencia para evitar Injecciones de Código
            $preparedStatement = $db->prepare("SELECT * FROM registro WHERE nivel=? ORDER BY tiempo");

            // Añadimos los parametros
            $preparedStatement->bind_param("s", $level);
            
            // Ejecutamos la sentencia
            $preparedStatement->execute();

            // Obtenemos el resultado
            $resultSet = $preparedStatement->get_result();

            // Titulo de los records
            $sectionToReturn .= "<h4>Los 10 mejores tiempos para el nivel: " . $level . "</h4>";
            
            if($resultSet->fetch_assoc() != NULL){ // Como decir resultSet.next()
    
                $sectionToReturn .= "<ol>";
                $nTiempos = 0;

                $resultSet->data_seek(0); // Nos posicionamos en el inicio del array asociativo
                while($row = $resultSet->fetch_assoc()){
                    
                    if($nTiempos === 10){
                        break;
                    }
                    
                    $sectionToReturn .= "<li>Nombre: " . $row["nombre"];
                    $sectionToReturn .= " Apellidos: " . $row["apellidos"];
                    $sectionToReturn .= " Tiempo: " . $this->timeToString($row["tiempo"]);
                    $sectionToReturn .= "</li>";
                    $nTiempos += 1;
                }

                $sectionToReturn .= "</ol>";

            } else{
                // No ha conseguido obtener ningun record
                $sectionToReturn .= "<p>Aún no hay datos para mostrar</p>";
            }

            $preparedStatement->close();
        }

        // Cerramos la etiqueta section
        $sectionToReturn .= "</section>";

        // Cerramos la conexion
        $db->close();

        return $sectionToReturn;

    }

    private function timeToString($time){

        $elapsedTime = $time;

        $segsDiv = 1000;
        $minDiv = $segsDiv * 60;
        $hourDiv = $minDiv * 60;

        $hoursElapsed = floor($elapsedTime / $hourDiv);
        $elapsedTime -= ($hoursElapsed * $hourDiv);

        $minutesElapsed = floor($elapsedTime / $minDiv);
        $elapsedTime -= ($minutesElapsed * $minDiv);

        $secondsElapsed = floor($elapsedTime / $segsDiv);

        return ($hoursElapsed / 10 >= 1.0 ? $hoursElapsed : "0" . $hoursElapsed)
            . ":"
            . ($minutesElapsed / 10 >= 1.0 ? $minutesElapsed : "0" . $minutesElapsed)
            . ":"
            . ($secondsElapsed / 10 >= 1.0 ? $secondsElapsed : "0" . $secondsElapsed);
    }

}

$recordsToShow = "";

// Comprobamos que el usuario ha enviado los datos correspondientes
if(count($_POST) > 0){
    $recordUsuario = new Record(); // Creamos un nuevo record
    
    // Obtenemos los datos enviados
    $userName = $_POST["nombre"];
    $userSurname = $_POST["apellidos"];
    $level = $_POST["nivel"];
    $time = intval($_POST["tiempoDB"]); // Transformamos de String a int

    $recordsToShow = $recordUsuario->registerNewRecord($userName, $userSurname, $level, $time);
}

?>



<!DOCTYPE html>
<html lang="es">

<head>
    <!-- Datos que describe el documento -->
    <title>Escritorio Virtual - Juegos</title>

    <meta charset="UTF-8">
    <meta name="author" content="Didier Yamil Reyes Castro">
    <meta name="description" content="Documento con el juego Crucigrama Matemático.">
    <meta name="keywords" content="juegos,matemática,razonamiento,agilidad">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" type="text/css" href="estilo/estilo.css">
    <link rel="stylesheet" type="text/css" href="estilo/layout.css">
    <link rel="stylesheet" type="text/css" href="estilo/juegos.css">
    <link rel="stylesheet" type="text/css" href="estilo/crucigrama.css">

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"
        integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="js/crucigrama.js"></script>

    <link rel="icon" href="multimedia/imagenes/favicon-spidey.ico">
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

    <!-- Section que representa la barra de navegacion a los diferentes juegos. Fuera del main ya que lo
     comparten los distintos HTML que componen los juegos -->
    <section>
        <h2>Juegos:</h2>
        <nav>
            <a href="memoria.html" accesskey="E" tabindex="8">Memoria</a>
            <a href="sudoku.html" accesskey="D" tabindex="9">Sudoku</a>
            <a href="crucigrama.php" accesskey="C" tabindex="10">Crucigrama matemático</a>
            <a href="api.html" accesskey="P" tabindex="11">Aplicacion con APIs</a>
            <a href="php/concesionario.php" accesskey="O" tabindex="12">Concesionario</a>
        </nav>
    </section>

    <h3>Crucigrama matemático</h3>

    <!-- Seccion que explica el juego - Pruebas de usabilidad.
    -->
    <section>
        <h4>Instrucciones:</h4>
        <ol>
            <li>Selecciona la casilla para introducir un número u operación
                <ul>
                    <li> Los números van del 1 al 9. </li>
                    <li> Las operaciones: + (suma) - (resta) * (multiplicación) / (división)</li>
                </ul>
            </li>
            <li>Introduce el número u operación mediante el teclado. Puedes utilizar el Pad numérico o Combinaciones
                especiales para colocar las operaciones.</li>
            <li>Si quieres cambiar el número u operación. Selecciona la casilla y:
                <ul>
                    <li>Usa la tecla de retroceso.</li>
                    <li>Introduce directamente un número u operación.</li>
                </ul>
            </li>
        </ol>
    </section>

    <!-- Seccion que simplemente agrupa las diferentes dificultades del crucigrama
        (puesta para hacer las pruebas de usabilidad "más rápidas" )
    -->
    <section>
        <h4>Elige el nivel de dificultad:</h4>
        <button>Fácil</button>
        <button>Medio</button>
        <button>Difícil</button>
    </section>

    <script>

        // Seleccion del crucigrama a jugar
        var crucigrama;

        $("body>section:last-of-type>button:first").on("click", () => {
            crucigrama = new Crucigrama("4,*,.,=,12,#,#,#,5,#,#,*,#,/,#,#,#,*,4,-,.,=,.,#,15,#,.,*,#,=,#,=,#,/,#,=,.,#,3,#,4,*,.,=,20,=,#,#,#,#,#,=,#,#,8,#,9,-,.,=,3,#,.,#,#,-,#,+,#,#,#,*,6,/,.,=,.,#,#,#,.,#,#,=,#,=,#,#,#,=,#,#,6,#,8,*,.,=,16", "facil");
            crucigrama.paintMathword();
        });
        $("body>section:last-of-type>button:nth-of-type(2)").on("click", () => {
            crucigrama = new Crucigrama("12,*,.,=,36,#,#,#,15,#,#,*,#,/,#,#,#,*,.,-,.,=,.,#,55,#,.,*,#,=,#,=,#,/,#,=,.,#,15,#,9,*,.,=,45,=,#,#,#,#,#,=,#,#,72,#,20,-,.,=,11,#,.,#,#,-,#,+,#,#,#,*,56,/,.,=,.,#,#,#,.,#,#,=,#,=,#,#,#,=,#,#,12,#,16,*,.,=,32", "medio");
            crucigrama.paintMathword();
        });
        $("body>section:last-of-type>button:last").on("click", () => {
            crucigrama = new Crucigrama("4,.,.,=,36,#,#,#,25,#,#,*,#,.,#,#,#,.,.,-,.,=,.,#,15,#,.,*,#,=,#,=,#,.,#,=,.,#,18,#,6,*,.,=,30,=,#,#,#,#,#,=,#,#,56,#,9,-,.,=,3,#,.,#,#,*,#,+,#,#,#,*,20,.,.,=,18,#,#,#,.,#,#,=,#,=,#,#,#,=,#,#,18,#,24,.,.,=,72", "dificil");
            crucigrama.paintMathword();
        });

        // Añadiendo el evento keydown
        window.addEventListener("keydown", (event) => {

            var teclasPermitidas = /[1-9/*+\-]/

            if (crucigrama && !$("main[data-state='form_time']")[0]) {
                // Teclas aceptadas
                // Usabilidad - Tecla de retroceso
                if (teclasPermitidas.test(event.key) || event.keyCode == 8) {

                    if (!crucigrama.isACellClicked) {
                        alert("Una celda tiene que ser seleccionada!!");
                    } else {
                        crucigrama.introduceElement(event.key);
                    }

                }
            }
        });

    </script>

    <main>
    </main>

    <section data-type="botonera">
        <h4>Botonera:</h4> <!-- Pruebas de usabilidad.-->
        <button onclick="crucigrama ? crucigrama.introduceElement(1) : alert('Tienes que crear un juego!')">1</button>
        <button onclick="crucigrama ? crucigrama.introduceElement(2) : alert('Tienes que crear un juego!')">2</button>
        <button onclick="crucigrama ? crucigrama.introduceElement(3) : alert('Tienes que crear un juego!')">3</button>
        <button onclick="crucigrama ? crucigrama.introduceElement(4) : alert('Tienes que crear un juego!')">4</button>
        <button onclick="crucigrama ? crucigrama.introduceElement(5) : alert('Tienes que crear un juego!')">5</button>
        <button onclick="crucigrama ? crucigrama.introduceElement(6) : alert('Tienes que crear un juego!')">6</button>
        <button onclick="crucigrama ? crucigrama.introduceElement(7) : alert('Tienes que crear un juego!')">7</button>
        <button onclick="crucigrama ? crucigrama.introduceElement(8) : alert('Tienes que crear un juego!')">8</button>
        <button onclick="crucigrama ? crucigrama.introduceElement(9) : alert('Tienes que crear un juego!')">9</button>
        <button onclick="crucigrama ? crucigrama.introduceElement('*') : alert('Tienes que crear un juego!')">*</button>
        <button onclick="crucigrama ? crucigrama.introduceElement('+') : alert('Tienes que crear un juego!')">+</button>
        <button onclick="crucigrama ? crucigrama.introduceElement('-') : alert('Tienes que crear un juego!')">-</button>
        <button onclick="crucigrama ? crucigrama.introduceElement('/') : alert('Tienes que crear un juego!')">/</button>
    </section>

    <?php

        if($recordsToShow != ""){
            echo $recordsToShow;
        }

    ?>

    <!-- Usabilidad - Usuario quería feedback sonoro para saber las correctas o falsas. -->

    <audio controls>
        <source src="multimedia/audios/correct.mp3" type="audio/mpeg">
        <source src="multimedia/audios/correct.wav" type="audio/wav">
    </audio>

    <audio controls>
        <source src="multimedia/audios/wrong.mp3" type="audio/mpeg">
        <source src="multimedia/audios/wrong.wav" type="audio/wav">
    </audio>

</body>


</html>