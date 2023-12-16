<?php

class Concesionario{

    private $server;
    private $user;
    private $pass;
    private $dbname;

    public function __construct(){
        $this->server = "localhost";
        $this->user = "DBUSER2023";
        $this->pass = "DBPSWD2023";
        $this->dbname = "concesionario";
    }

    // Crea una nueva DB y crea las tablas para su funcionamiento 
    public function createNewDB($dbname){
        
        // Intentamos establecer una conexion, para crear la nueva db
        $db = new mysqli($this->server, $this->user, $this->pass);
        if($db->connect_error)
            return;

        // Inicializamos por completo
        $isDbPresent = "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '" . $this->dbname . "'";
        $res = $db->query($isDbPresent);
        if($res->num_rows === 1){
            $db->query("DROP DATABASE " . $this->dbname);
        }
        
        // Creando la nueva base de datos si procede
        $queryCreateDB = "CREATE DATABASE IF NOT EXISTS " . $this->dbname . " COLLATE utf8mb4_general_ci"; 

        // Si se ha creado con éxito se procede a insertar las tablas
        if($db->query($queryCreateDB) === TRUE){ 
            $this->createTables();
        }

        $db->close();
    }

    private function createTables(){

        // Intentamos establecer una conexion
        $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
        if($db->connect_error)
            return;

        // Crear nuevas tablas
        $userTable = "CREATE TABLE IF NOT EXISTS concesionario.user (
            id VARCHAR(9) NOT NULL, 
            name VARCHAR(100) NOT NULL, 
            surname VARCHAR(100) NOT NULL, 
            email VARCHAR(100) NOT NULL, 
            phone INT(9) NOT NULL, 
            PRIMARY KEY (id)
            ) ENGINE = InnoDB";
        $colorTable = "CREATE TABLE IF NOT EXISTS concesionario.color (
            code VARCHAR(10) NOT NULL, 
            description VARCHAR(100) NOT NULL, 
            metal BOOLEAN NOT NULL,
            PRIMARY KEY (code)
            ) ENGINE = InnoDB";
        $dealerTable = "CREATE TABLE IF NOT EXISTS concesionario.dealer (
            did INT NOT NULL AUTO_INCREMENT, 
            dealer_name VARCHAR(100) NOT NULL, 
            location VARCHAR(100) NOT NULL, 
            contact_phone INT(9) NOT NULL, 
            PRIMARY KEY (did)
            ) ENGINE = InnoDB";
        $carTable = "CREATE TABLE IF NOT EXISTS concesionario.car (
            plate VARCHAR(7) NOT NULL, 
            model VARCHAR(100) NOT NULL, 
            year INT(4) NOT NULL, 
            price FLOAT NOT NULL, 
            make VARCHAR(100) NOT NULL, 
            color_code VARCHAR(10) NOT NULL, 
            dealer_id INT NOT NULL, 
            PRIMARY KEY (plate), 
            FOREIGN KEY (color_code) REFERENCES concesionario.color(code), 
            FOREIGN KEY (dealer_id) REFERENCES concesionario.dealer(did)
            ) ENGINE = InnoDB";
        $buysTable = "CREATE TABLE IF NOT EXISTS concesionario.buys (
            user_id VARCHAR(9) NOT NULL, 
            car_plate VARCHAR(7) NOT NULL, 
            orderDate DATE NOT NULL, 
            quantity INT(3) NOT NULL, 
            PRIMARY KEY(user_id, car_plate), 
            FOREIGN KEY (user_id) REFERENCES concesionario.user(id), 
            FOREIGN KEY (car_plate) REFERENCES concesionario.car(plate)
            ) ENGINE = InnoDB";

        
        $db->query($userTable);
        $db->query($colorTable);
        $db->query($dealerTable);
        $db->query($carTable);
        $db->query($buysTable);


        $db->close();
    }

    // Importa datos a las tablas de la DB
    // Archivo permitido: .csv 
    // El script buscará en: /php/(Nombre de csv: buys,car,color,dealer,user).csv
    public function importData($importedFile){

        $path_parts = pathinfo($importedFile);
        $filename = $path_parts['filename'];
        $extension = $path_parts['extension'];

        if($extension === "csv"){ // Verificando que es un archivo csv
            if($filename === "user"){
                $this->importUser($importedFile);
            }
            if($filename === "car"){
                $this->importCar($importedFile);
            }
            if($filename === "color"){
                $this->importColor($importedFile);
            }
            if($filename === "dealer"){
                $this->importDealer($importedFile);
            }
            if($filename === "buys"){
                $this->importBuys($importedFile);
            }
        }
        

    }

    private function importUser($importedFile){

        $queryInsert = "INSERT INTO user (id, name, surname, email, phone) VALUES (?,?,?,?,?)";

        // Intentamos abrir el fichero
        $ficheroEnCarpeta = "./php/" . $importedFile; 
        if(($gestor = fopen($ficheroEnCarpeta, "r")) !== FALSE){
            
            // Intentamos establecer una conexion
            $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
            if($db->connect_error)
                return;

            while(($datos = fgetcsv($gestor, 1000, ",")) !== FALSE){ // Leemos linea a linea el csv

                $numeroColumnas = count($datos);
                if($numeroColumnas == 5){ // Si tiene el numero de columnas, lo insertamos
                    
                    // Insertamos los datos
                    
                    $preparedSmt = $db->prepare($queryInsert);
                    $preparedSmt->bind_param("ssssi", 
                        $datos[0], $datos[1], $datos[2], $datos[3], $datos[4]);
                    
                    try{
                        $preparedSmt->execute();
                    }catch(mysqli_sql_exception $e){
                        if($e->getCode() != 1062){ // 1062 = PK code
                            throw $e;
                        }
                        
                        // Si es una violacion de PK, no lo insertamos!
                        
                    }
                    
                    $preparedSmt->close();
                }

                
            }

            $db->close();
            fclose($gestor);
        }

    }

    private function importColor($importedFile){

        $queryInsert = "INSERT INTO color (code, description, metal) VALUES (?,?,?)";

        // Intentamos abrir el fichero
        $ficheroEnCarpeta = "./php/" . $importedFile; 
        if(($gestor = fopen($ficheroEnCarpeta, "r")) !== FALSE){
            
            // Intentamos establecer una conexion
            $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
            if($db->connect_error)
                return;

            while(($datos = fgetcsv($gestor, 1000, ",")) !== FALSE){ // Leemos linea a linea el csv

                $numeroColumnas = count($datos);
                if($numeroColumnas == 3){ // Si tiene el numero de columnas, lo insertamos
                    
                    // Insertamos los datos
                    
                    $preparedSmt = $db->prepare($queryInsert);
                    $preparedSmt->bind_param("ssi", 
                        $datos[0], $datos[1], $datos[2]);
                    
                    try{
                        $preparedSmt->execute();
                    }catch(mysqli_sql_exception $e){
                        if($e->getCode() != 1062){ // 1062 = PK code
                            throw $e;
                        }
                        
                        // Si es una violacion de PK, no lo insertamos!
                        
                    }
                    
                    $preparedSmt->close();
                }

                
            }

            $db->close();
            fclose($gestor);
        }

    }

    private function importCar($importedFile){

        $queryInsert = "INSERT INTO car (plate, model, year, price, make, color_code, dealer_id) VALUES (?,?,?,?,?,?,?)";

        // Intentamos abrir el fichero
        $ficheroEnCarpeta = "./php/" . $importedFile; 
        if(($gestor = fopen($ficheroEnCarpeta, "r")) !== FALSE){
            
            // Intentamos establecer una conexion
            $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
            if($db->connect_error)
                return;

            while(($datos = fgetcsv($gestor, 1000, ",")) !== FALSE){ // Leemos linea a linea el csv

                $numeroColumnas = count($datos);
                if($numeroColumnas == 7){ // Si tiene el numero de columnas, lo insertamos
                    
                    // Insertamos los datos
                    
                    $preparedSmt = $db->prepare($queryInsert);
                    $preparedSmt->bind_param("ssidssi", 
                        $datos[0], $datos[1], $datos[2], $datos[3], $datos[4], $datos[5], $datos[6]);
                    
                    try{
                        $preparedSmt->execute();
                    }catch(mysqli_sql_exception $e){

                        $rethrow = TRUE;

                        // Si es una violacion de PK o FK, no lo insertamos!
                        if($e->getCode() == 1062 || $e->getCode() != 1452){ // 1062 = PK code, 1452 = FK code
                            $rethrow = FALSE;
                        }

                        if($rethrow === TRUE)
                            throw $e;
            
                    }
                    
                    $preparedSmt->close();
                }

                
            }

            $db->close();
            fclose($gestor);
        }

    }

    private function importDealer($importedFile){

        $queryInsert = "INSERT INTO dealer (did, dealer_name, location, contact_phone) VALUES (?,?,?,?)";

        // Intentamos abrir el fichero
        $ficheroEnCarpeta = "./php/" . $importedFile; 
        if(($gestor = fopen($ficheroEnCarpeta, "r")) !== FALSE){
            
            // Intentamos establecer una conexion
            $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
            if($db->connect_error)
                return;

            while(($datos = fgetcsv($gestor, 1000, ",")) !== FALSE){ // Leemos linea a linea el csv

                $numeroColumnas = count($datos);
                if($numeroColumnas == 4){ // Si tiene el numero de columnas, lo insertamos
                    
                    // Insertamos los datos
                    
                    $preparedSmt = $db->prepare($queryInsert);
                    $preparedSmt->bind_param("issi", 
                        $datos[0], $datos[1], $datos[2], $datos[3]);
                    
                    try{
                        $preparedSmt->execute();
                    }catch(mysqli_sql_exception $e){
                        if($e->getCode() != 1062){ // 1062 = PK code
                            throw $e;
                        }
                        
                        // Si es una violacion de PK, no lo insertamos!
                        
                    }
                    
                    $preparedSmt->close();
                }

                
            }

            $db->close();
            fclose($gestor);
        }

    }

    private function importBuys($importedFile){

        $queryInsert = "INSERT INTO buys (user_id, car_plate, orderDate, quantity) VALUES (?,?,?,?)";

        // Intentamos abrir el fichero
        $ficheroEnCarpeta = "./php/" . $importedFile; 
        if(($gestor = fopen($ficheroEnCarpeta, "r")) !== FALSE){
            
            // Intentamos establecer una conexion
            $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
            if($db->connect_error)
                return;

            while(($datos = fgetcsv($gestor, 1000, ",")) !== FALSE){ // Leemos linea a linea el csv

                $numeroColumnas = count($datos);
                if($numeroColumnas == 4){ // Si tiene el numero de columnas, lo insertamos
                    
                    // Insertamos los datos
                    
                    $preparedSmt = $db->prepare($queryInsert);
                    $preparedSmt->bind_param("sssi", 
                        $datos[0], $datos[1], $datos[2], $datos[3]);
                    
                    try{
                        $preparedSmt->execute();
                    }catch(mysqli_sql_exception $e){

                        $rethrow = TRUE;

                        // Si es una violacion de PK o FK, no lo insertamos!
                        if($e->getCode() == 1062 || $e->getCode() != 1452){ // 1062 = PK code, 1452 = FK code
                            $rethrow = FALSE;
                        }

                        if($rethrow === TRUE)
                            throw $e;
            
                    }
                    
                    $preparedSmt->close();
                }

                
            }

            $db->close();
            fclose($gestor);
        }

    }

    public function exportData($exportFile){

        // Intentamos exportar todos los datos en la caprtea php
        $ficheroEnCarpeta = "./php/". $exportFile . ".csv"; 
        if(($gestor = fopen($ficheroEnCarpeta, "ab")) !== FALSE){

            // Intentamos establecer una conexion
            $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
            if($db->connect_error)
                return;

            // Exportamos la tabla user
            $res = $db->query("SELECT * FROM user");
            if($res)
                $this->appendDataUser($res, $gestor);

            // Exportamos la tabla buys
            $res = $db->query("SELECT * FROM buys");
            if($res)
                $this->appendDataBuys($res, $gestor);

            // Exportamos la tabla car
            $res = $db->query("SELECT * FROM car");
            if($res)
                $this->appendDataCar($res, $gestor);

            // Exportamos la tabla Color
            $res = $db->query("SELECT * FROM color");
            if($res)
                $this->appendDataColor($res, $gestor);

            // Exportamos la tabla user
            $res = $db->query("SELECT * FROM dealer");
            if($res)
                $this->appendDataDealer($res, $gestor);


            $db->close();
            fclose($gestor);
        }
    }

    private function writeHeader($res,$file,$columnCount){ 
        $header = '';
        $i = 0;
        while($i < $columnCount){
            $columnName = $res->fetch_field_direct($i);
            if($i + 1 === $columnCount)
                $header .= '"' . $columnName->name . "\"\n";
            else
                $header .= '"' . $columnName->name . '",';
            $i += 1;
        }
        
        fwrite($file, $header); 
    }

    private function appendDataUser($res, $file){

        $this->writeHeader($res,$file,5);      

        while($row = $res->fetch_array()){

            // Imprimiendo los datos
            $datos = '"' . $row["id"] . '","' . $row["name"] . '","';
            $datos .= $row["surname"] . '","' . $row["email"] . '","' . $row["phone"] . "\"\n";

            fwrite($file, $datos);
        }


    }

    private function appendDataBuys($res, $file){

        $this->writeHeader($res,$file,4);

        while($row = $res->fetch_array()){

            // Imprimiendo los datos
            $datos = '"' . $row["user_id"] . '","' . $row["car_plate"] . '","';
            $datos .= $row["orderDate"] . '","' . $row["quantity"] . "\"\n";

            fwrite($file, $datos);
        }


    }

    private function appendDataCar($res, $file){

        $this->writeHeader($res,$file,7);

        while($row = $res->fetch_array()){

            // Imprimiendo los datos
            $datos = '"' . $row["plate"] . '","' . $row["model"] . '","';
            $datos .= $row["year"] . '","' . $row["price"] . '","' . $row["make"] . '","';
            $datos .= $row["color_code"] . '","' . $row["dealer_id"] . "\"\n"; 

            fwrite($file, $datos);
        }


    }

    private function appendDataColor($res, $file){

        $this->writeHeader($res,$file,3);

        while($row = $res->fetch_array()){

            // Imprimiendo los datos
            $datos = '"' . $row["code"] . '","' . $row["description"] . '","';
            $datos .= $row["metal"] . "\"\n";

            fwrite($file, $datos);
        }


    }

    private function appendDataDealer($res, $file){

        $this->writeHeader($res,$file,4);

        while($row = $res->fetch_array()){

            // Imprimiendo los datos
            $datos = '"' . $row["did"] . '","' . $row["dealer_name"] . '","';
            $datos .= $row["location"] . '","' . $row["contact_phone"] . "\"\n";

            fwrite($file, $datos);
        }


    }


}

$concesionario = new Concesionario();

// Comprobamos si el usuario ha enviado datos
if(count($_POST) > 0){
    
    // Creamos una nueva DB...
    if(isset($_POST["nombreDb"])){
        $concesionario->createNewDB($_POST["nombreDb"]);
    }

    // Se importan datos a la DB
    if(isset($_POST["fileImportar"])){
        $concesionario->importData($_POST["fileImportar"]);
    }

    // Se exportan los datos de la BD.
    if(isset($_POST["fileExportar"])){
        $concesionario->exportData($_POST["fileExportar"]);
    }



}



?>




<!DOCTYPE html>
<html lang="es">

<head>
    <!-- Datos que describe el documento -->
    <title>Escritorio Virtual - Juegos</title>

    <meta charset="UTF-8">
    <meta name="author" content="Didier Yamil Reyes Castro">
    <meta name="description" content="Documento que representa la Venta de Coches en un Concesionario.">
    <meta name="keywords" content="concesionario,coches,venta,lujo">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" type="text/css" href="estilo/estilo.css">
    <link rel="stylesheet" type="text/css" href="estilo/layout.css">
    <link rel="stylesheet" type="text/css" href="estilo/juegos.css">

    <link rel="icon" href="multimedia/favicon-spidey.ico">
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
            <a href="concesionario.php" accesskey="O" tabindex="12">Concesionario</a>
        </nav>
    </section>

    <main>
        <h3>Concesionario "GTAVI - Mónaco"</h3>

        <!-- Seccion con las acciones a realizar en el concesionario-->
        <section>
            <h4>Acciones principales</h4>
            
            <form action="#" method="post" name="crear">
                <p>Crea nueva base de datos: <input type="text" name="nombreDb" value="concesionario" readonly></p>
                <input type="submit" value="Crear!!">
            </form>
            
            <form action="#" method="post" name="importar">
                <p>Importa tus datos: <input name="fileImportar" type="file" accept=".csv" required></p>
                <input type="submit" value="Importar!!">
            </form>

            <form action="#" method="post" name="exportar">
                <p>Exporta tus datos: <input type="text" name="fileExportar" placeholder="Nombre de archivo" required></p>
                <input type="submit" value="Exportar!!">
            </form>
        </section>

        <!-- Seccion que muestra la lista de coches en venta de cada vendedor -->
        <section>
            <h4>Coches en venta</h4>
            <form action="#" method="post" name="posesion">
                <p>Introduce el ID del vendedor: <input type="text" name="dealerID" required></p>
                <input type="submit" value="Muéstrame!!">
            </form>
        </section>

        <!-- Seccion que muestra la lista de coches que posee el usuario-->
        <section>
            <h4>Coches en posesión</h4>
            <form action="#" method="post" name="posesion">
                <p>Introduce tu ID: <input type="text" name="userID" required></p>
                <input type="submit" value="Consultar!!">
            </form>
        </section>

        <!-- Seccion que permite cambiar el color de los coches en posesion -->
        <section>
            <h4>Cambia el color de tu coche!</h4>
            <form action="#" method="post" name="posesion">
                <p>Introduce la matrícula de tu coche: <input type="text" name="carID" required></p>
                <p>Introduce tu nuevo color: <input type="text" name="carColor" required></p>
                <p>Quieres un color metalizado?: <input type="checkbox" name="carMetal"></p>
                <input type="submit" value="Pinta!!">
            </form>
        </section>


    </main>
    
    



</body>

</html>