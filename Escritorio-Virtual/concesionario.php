<?php

// Clase Concesionario. En este caso se puede comprar coches a vendedores
// y se puede consultar los coches que se poseen.
// La matricula del coche es un mero identificador! 
// (varios usuarios pueden tener el mismo coche con la misma matricula)
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
            return FALSE;

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

        return TRUE;
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

        // Inserta informacion esencial para el funcionamiento
        // Inserta solo un vendedor, un coche y un color
        $this->insertEssentialInfo();
    }

    private function insertEssentialInfo(){

        $insertDealer = "INSERT INTO dealer (did, dealer_name, location, contact_phone) ";
        $insertDealer .= 'VALUES ("1","CarroceriasPepe","Av.Costa","123456789")';
        $insertColor = "INSERT INTO color (code, description, metal) ";
        $insertColor .= 'VALUES ("AMAR00","Amarillo normal","0")';
        $insertCar = "INSERT INTO car (plate, model, year, price, make, color_code, dealer_id) ";
        $insertCar .= 'VALUES ("1111BAB","19 TSE Chamade","1995","750.49","Renault","AMAR00","1")';

        // Intentamos establecer una conexion
        $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
        if($db->connect_error)
            return;

        $db->query($insertDealer);
        $db->query($insertColor);
        $db->close();

        // Se separan ya que los coches tienen FK de dealers y deben ser tratados en distintas
        // transacciones
        $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
        if($db->connect_error)
            return;

        $db->query($insertCar);
        $db->close();
    }

    // Importa datos a las tablas de la DB
    // Archivo permitido: .csv 
    // El script buscará en: /php/(Nombre de csv: buys,car,color,dealer,user).csv
    // Hay que tener cuidado al importar datos de tablas ya que unas dependen de otras(FOREIGN KEYS)
    // Si esto pasa, simplemente no se añade la informacion
    public function importData(){

        if($this->checkDBCreated() === FALSE)
            return FALSE;

        $numberFiles = count($_FILES['files']['name']);

        for($i=0;$i<$numberFiles;$i++){

            $path_parts = pathinfo($_FILES['files']['name'][$i]);
            $fileType = $path_parts["extension"];
            $filename = $path_parts["filename"];

            // Verificando que es un archivo csv
            if($fileType === "csv"){ 
                
                if($filename === "user"){
                    $this->importUser($_FILES['files']['tmp_name'][$i]);
                }
                if($filename === "car"){
                    $this->importCar($_FILES['files']['tmp_name'][$i]);
                }
                if($filename === "color"){
                    $this->importColor($_FILES['files']['tmp_name'][$i]);
                }
                if($filename === "dealer"){
                    $this->importDealer($_FILES['files']['tmp_name'][$i]);
                }
                if($filename === "buys"){
                    $this->importBuys($_FILES['files']['tmp_name'][$i]);
                }
            }
        }

        return TRUE;
    }

    private function checkDBCreated(){
        
        $isCreated = TRUE;
        
        // Intentamos establecer una conexion para revisar existencia de DB
        $db = new mysqli($this->server, $this->user, $this->pass);
        if($db->connect_error)
            return;

        // Revisamos si la BD está creada
        $isDbPresent = "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '" . $this->dbname . "'";
        $res = $db->query($isDbPresent);
        if($res->num_rows === 0){ // Si no esta creada no hacemos nada
            $isCreated = FALSE;
        }
        $db->close();

        return $isCreated;
    }

    private function importUser($ficheroEnCarpeta){

        $queryInsert = "INSERT INTO user (id, name, surname, email, phone) VALUES (?,?,?,?,?)";

        // Intentamos abrir el fichero
        if(($gestor = fopen($ficheroEnCarpeta, "rb")) !== FALSE){
            
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

    private function importColor($ficheroEnCarpeta){

        $queryInsert = "INSERT INTO color (code, description, metal) VALUES (?,?,?)";

        // Intentamos abrir el fichero
        if(($gestor = fopen($ficheroEnCarpeta, "rb")) !== FALSE){
            
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

    private function importCar($ficheroEnCarpeta){

        $queryInsert = "INSERT INTO car (plate, model, year, price, make, color_code, dealer_id) VALUES (?,?,?,?,?,?,?)";

        // Intentamos abrir el fichero
        if(($gestor = fopen($ficheroEnCarpeta, "rb")) !== FALSE){
            
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
                        if($e->getCode() == 1062 || $e->getCode() == 1452){ // 1062 = PK code, 1452 = FK code
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

    private function importDealer($ficheroEnCarpeta){

        $queryInsert = "INSERT INTO dealer (did, dealer_name, location, contact_phone) VALUES (?,?,?,?)";

        // Intentamos abrir el fichero
        if(($gestor = fopen($ficheroEnCarpeta, "rb")) !== FALSE){
            
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

    private function importBuys($ficheroEnCarpeta){

        $queryInsert = "INSERT INTO buys (user_id, car_plate, orderDate, quantity) VALUES (?,?,?,?)";

        // Intentamos abrir el fichero
        if(($gestor = fopen($ficheroEnCarpeta, "rb")) !== FALSE){
            
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
                        if($e->getCode() == 1062 || $e->getCode() == 1452){ // 1062 = PK code, 1452 = FK code
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

        if($this->checkDBCreated() === FALSE)
            return FALSE;

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

        return TRUE;
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

    public function consultaVendedores(){

        if($this->checkDBCreated() === FALSE)
            return null;

        // Intentamos establecer una conexion
        $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
        if($db->connect_error)
            return;

        $queryDealers = "SELECT did,dealer_name FROM dealer";
        $res = $db->query($queryDealers);
        if($res){
            
            $listDealers = "<ul>";

            while($row = $res->fetch_array()){
                $listDealers .= "<li>ID:" . $row["did"] . " - " . $row["dealer_name"];
            }

            $listDealers .= "</ul>";

            return $listDealers;
        }


    }

    public function cochesEnVentaParaVendedor($dealerId){

        if($this->checkDBCreated() === FALSE)
            return null;

        // Intentamos establecer una conexion
        $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
        if($db->connect_error)
            return;

        $queryDealers = "SELECT * FROM car WHERE dealer_id = ?";

        $preparedStm = $db->prepare($queryDealers);
        $preparedStm->bind_param("i", $dealerId);
        $preparedStm->execute();
                
        $res = $preparedStm->get_result();
        if($res){
            
            $sectionsCar = "";

            while($row = $res->fetch_array()){

                $sectionsCar .= "<section>";
                $sectionsCar .= "<h5>" . $row["make"] . " " . $row["model"] . "</h5>";
                $sectionsCar .= "<p>Matrícula:" . $row["plate"] .  "</p>";
                $sectionsCar .= "<p>Año fabricación:" . $row["year"] .  "</p>";
                $sectionsCar .= "<p>Precio:" . $row["price"] .  "</p>";

                $colorRes = $db->query("SELECT description FROM color WHERE code = '" . $row["color_code"] . "'");

                $sectionsCar .= "<p>Color:" . $colorRes->fetch_array()[0] .  "</p>";
                $sectionsCar .= "</section>";
            }

            return $sectionsCar;
        }

    }

    public function compraCoche($matricula, $id, $name, $surname, $email, $phone, $cantidad){
        if($this->checkDBCreated() === FALSE)
            return null;

        // Chqueamos si el coche existe
        if($this->checkCar($matricula) === FALSE)
            return FALSE;

        // Chequeamos que el id existe, si no, lo creamos
        if($this->checkUserId($id) === FALSE){
            if(empty($name) || empty($surname) || empty($email) || empty($phone))
                return FALSE; // Si el usuario es nuevo y no proporciona datos, no proseguimos

            $this->createNewUser($id, $name, $surname, $email, $phone);
        }

        // Chequeamos primero si hay ya coches comprados con la misma matricula,
        // si lo hay, aumentamos la cantidad de compra
        if($this->checkCarBuys($id, $matricula) === TRUE){
            $this->modifyQuantityForCar($id, $matricula, $cantidad);
        }else{
            $this->buyNewCars($id, $matricula, $cantidad);
        }

        return TRUE;
    }

    private function buyNewCars($id, $matricula, $cantidad){
        if($this->checkDBCreated() === FALSE)
            return null;

        // Intentamos establecer una conexion
        $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
        if($db->connect_error)
            return;

        $moreCars = "INSERT INTO buys (user_id,car_plate,orderDate,quantity) VALUES (?,?,?,?)";
        $preparedSmt = $db->prepare($moreCars);
        $currentDate = date("Y-m-d");
        $preparedSmt->bind_param("sssi", $id, $matricula, $currentDate, $cantidad);

        $preparedSmt->execute();
        $db->close();
    }

    private function modifyQuantityForCar($id, $matricula, $cantidad){

        if($this->checkDBCreated() === FALSE)
            return null;

        // Intentamos establecer una conexion
        $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
        if($db->connect_error)
            return;

        $moreCars = "UPDATE buys SET quantity = quantity + ?, orderDate = ? WHERE user_id = ? AND car_plate = ?";
        $preparedSmt = $db->prepare($moreCars);
        $currentDate = date("Y-m-d");
        $preparedSmt->bind_param("isss", $cantidad, $currentDate, $id, $matricula);

        $preparedSmt->execute();
        $db->close();
    }

    private function createNewUser($id, $name, $surname, $email, $phone){

        if($this->checkDBCreated() === FALSE)
            return null;

        // Intentamos establecer una conexion
        $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
        if($db->connect_error)
            return;

        $insertNewUser = "INSERT INTO user(id,name,surname,email,phone) VALUES(?,?,?,?,?)";
        $preparedSmt = $db->prepare($insertNewUser);
        $preparedSmt->bind_param("ssssi", $id, $name, $surname, $email, $phone);
        $preparedSmt->execute(); // No hay problema de PK porque se supone que ha sido validado con anterioridad

        $db->close();
    }

    private function checkUserId($id){
        if($this->checkDBCreated() === FALSE)
            return null;

        // Intentamos establecer una conexion
        $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
        if($db->connect_error)
            return;

        $checkIdQuery = "SELECT * FROM user WHERE id = ?";
        $preparedSmt = $db->prepare($checkIdQuery);
        $preparedSmt->bind_param("s", $id);
        $preparedSmt->execute();
        $res = $preparedSmt->get_result();
        $isPresent = $res->num_rows;

        $db->close();

        return $isPresent === 0 ? FALSE : TRUE;
    }

    private function checkCar($matricula){
        if($this->checkDBCreated() === FALSE)
            return null;

        // Intentamos establecer una conexion
        $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
        if($db->connect_error)
            return;

        $checkIdQuery = "SELECT * FROM car WHERE plate = ?";
        $preparedSmt = $db->prepare($checkIdQuery);
        $preparedSmt->bind_param("s", $matricula);
        $preparedSmt->execute();
        $res = $preparedSmt->get_result();
        $isPresent = $res->num_rows;

        $db->close();

        return $isPresent === 0 ? FALSE : TRUE;
    }

    private function checkCarBuys($id,$matricula){
        if($this->checkDBCreated() === FALSE)
            return null;

        // Intentamos establecer una conexion
        $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
        if($db->connect_error)
            return;

        $checkIdQuery = "SELECT car_plate FROM buys WHERE user_id = ? AND car_plate = ?";
        $preparedPresent = $db->prepare($checkIdQuery);
        $preparedPresent->bind_param("ss", $id, $matricula);
        $preparedPresent->execute();
        $res = $preparedPresent->get_result();
        $isPresent = $res->num_rows;

        $db->close();

        return $isPresent === 0 ? FALSE : TRUE;
    }

    public function consultaCoches($id){
        if($this->checkDBCreated() === FALSE)
            return null;

        if($this->checkUserId($id) === FALSE) // Usuario no existe
            return -1;
    
        // Intentamos establecer una conexion
        $db = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
        if($db->connect_error)
            return;

        $queryCochesForId = "SELECT * FROM buys WHERE user_id = ?";
        $preparedSmt = $db->prepare($queryCochesForId);
        $preparedSmt->bind_param("s", $id);
        $preparedSmt->execute();

        $res = $preparedSmt->get_result();
        if($res){
            
            $sectionsCar = "";

            while($row = $res->fetch_array()){

                $sectionsCar .= "<section>";
                $sectionsCar .= "<h5>" . $row["car_plate"] . " - Comprado el: " . $row["orderDate"] . "</h5>";
                
                // Informacion del coche
                $infoCar = $db->query("SELECT model,year,make,color_code,dealer_id FROM car WHERE plate = '" . $row["car_plate"] . "'");
                $rowCar = $infoCar->fetch_array();

                $sectionsCar .= "<p>Modelo:" . $rowCar["make"] . " " . $rowCar["model"] .  "</p>";
                $sectionsCar .= "<p>Año: " . $rowCar["year"] ."</p>";

                $infoDealer = $db->query("SELECT dealer_name FROM dealer WHERE did = '" . $rowCar["dealer_id"] . "'");
                $rowDealer = $infoDealer->fetch_array();
                $sectionsCar .= "<p>Vendido por: " . $rowCar["dealer_id"] . " - " . $rowDealer["dealer_name"] ."</p>";

                $infoColor = $db->query("SELECT description FROM color WHERE code = '" . $rowCar["color_code"] . "'");
                $rowColor = $infoColor->fetch_array();
                $sectionsCar .= "<p>Color: " . $rowCar["color_code"] . " - " . $rowColor["description"] ."</p>";


                $sectionsCar .= "<p>Posees:" . $row["quantity"] .  " coche(s)</p>";
                $sectionsCar .= "</section>";
            }

            return $sectionsCar;
        }
    
    }   

}

$concesionario = new Concesionario();

$baseDatosExito = NULL;
$importarExito = NULL;
$exportarExito = NULL;

$vendedoresPosibles = $concesionario->consultaVendedores();
$cochesVenta = NULL;
$cocheComprado = NULL;
$cochesConsulta = NULL;

// Comprobamos si el usuario ha enviado datos
if(count($_POST) > 0){
    
    // Creamos una nueva DB...
    if(isset($_POST["nombreDb"])){
        $baseDatosExito = $concesionario->createNewDB($_POST["nombreDb"]);
        $vendedoresPosibles = $concesionario->consultaVendedores(); // Refrescamos
    }

    // Se exportan los datos de la BD.
    if(isset($_POST["fileExportar"])){
        $exportarExito = $concesionario->exportData($_POST["fileExportar"]);
    }

    // Se piden los vehiculos asociados al vendedor
    if(isset($_POST["dealerID"])){
        $cochesVenta = $concesionario->cochesEnVentaParaVendedor($_POST["dealerID"]);
    }

    // Se quieren comprar coches
    if(isset($_POST["matriculaIdCompra"])){
        $cocheComprado = $concesionario->compraCoche($_POST["matriculaIdCompra"],
        $_POST["usuarioIdCompra"],$_POST["usuarioNombreCompra"],$_POST["usuarioApellidoCompra"],
        $_POST["usuarioEmailCompra"],$_POST["usuarioTelefonoCompra"],$_POST["cantidadCompra"]);
    }

    // Se quiere ver los coches en posesion
    if(isset($_POST["usuarioIdConsulta"])){
        $cochesConsulta = $concesionario->consultaCoches($_POST["usuarioIdConsulta"]);
    }

}

// Se importan datos a la DB
if($_FILES){
    $importarExito = $concesionario->importData();
    $vendedoresPosibles = $concesionario->consultaVendedores(); // Refrescamos
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

            <?php
                if($baseDatosExito === TRUE)
                    echo "<p>Base de datos inicializada con éxito.</p>";
                elseif($baseDatosExito === FALSE)
                    echo "<p>Ha habido un error al crear la Base de Datos!</p>";
            ?>

            
            <form action="#" method="post" enctype='multipart/form-data'>
                <p>Importa tus datos: <input name="files[]" type="file" accept=".csv" required multiple></p>
                <input type="submit" value="Importar!!">
            </form>

            <?php
                if($importarExito === TRUE)
                    echo "<p>Datos importados con éxito.</p>";
                elseif($importarExito === FALSE)
                    echo "<p>Ha habido un error al importar los datos! Revisa que la DB este creada!</p>";
            ?>

            <form action="#" method="post" name="exportar">
                <p>Exporta tus datos: <input type="text" name="fileExportar" placeholder="Nombre de archivo" required></p>
                <input type="submit" value="Exportar!!">
            </form>

            <?php
                if($exportarExito === TRUE)
                    echo "<p>Datos exportados con éxito a ./php/nombre.csv </p>";
                elseif($exportarExito === FALSE)
                    echo "<p>Ha habido un error al exportar! Revisa que la DB este creada!</p>";
            ?>
        </section>

        <!-- Seccion que muestra la lista de coches en venta de cada vendedor -->
        <section>
            <h4>Coches en venta</h4>
            <section>
                <h5>Vendedores posibles</h5>
                <?php
                    if($vendedoresPosibles != null)
                        echo $vendedoresPosibles;
                    else
                        echo "No hay vendedores activos o no se ha activado la base de datos!";
                ?>
            </section>
            <form action="#" method="post" name="vendor">
                <p>Introduce el ID del vendedor: <input type="text" name="dealerID" required></p>
                <input type="submit" value="Muéstrame!!">
            </form>
            <?php
                    if($cochesVenta != null){
                        echo $cochesVenta;
                        // Formulario de compra
                        $formVenta = '<form action="#" method="post" name="compra">';
                        $formVenta .= '<p>Introduce la matrícula del coche de tus sueños!:';
                        $formVenta .= '<input type="text" name="matriculaIdCompra" required></p>';
                        $formVenta .= '<p>Introduce tu dni:';
                        $formVenta .= '<input type="text" name="usuarioIdCompra" required></p>';
                        $formVenta .= '<p>Introduce tu nombre:';
                        $formVenta .= '<input type="text" name="usuarioNombreCompra"></p>';
                        $formVenta .= '<p>Introduce tu apellido:';
                        $formVenta .= '<input type="text" name="usuarioApellidoCompra"></p>';
                        $formVenta .= '<p>Introduce tu email:';
                        $formVenta .= '<input type="text" name="usuarioEmailCompra"></p>';
                        $formVenta .= '<p>Introduce tu teléfono:';
                        $formVenta .= '<input type="number" name="usuarioTelefonoCompra"></p>';
                        $formVenta .= '<p>Cuántos vas a comprar?:';
                        $formVenta .= '<input type="number" name="cantidadCompra" min="1" required></p>';
                        $formVenta .= '<input type="submit" value="Comprar!!">';
                        $formVenta .= "</form>";
                        
                        echo $formVenta;
                    }

                    if($cocheComprado === TRUE)
                        echo "<p>Coche comprado con éxito!</p>";
                    elseif($cocheComprado === FALSE)
                        echo "<p>Ha habido errores en la compra. Verifica tus datos!</p>";
                ?>
        </section>

        <!-- Seccion que muestra la lista de coches que posee el usuario-->
        <section>
            <h4>Coches en posesión</h4>
            <form action="#" method="post" name="posesion">
                <p>Introduce tu ID: <input type="text" name="usuarioIdConsulta" required></p>
                <input type="submit" value="Consultar!!">
            </form>
            <?php
                    if($cochesConsulta !== -1 && $cochesConsulta !== NULL)
                        echo $cochesConsulta;
                    elseif($cochesConsulta === -1)
                        echo "<p>Ha habido errores en la consulta. Verifica tu ID!</p>";
            ?>
        </section>

    </main>
    
    

</body>

</html>