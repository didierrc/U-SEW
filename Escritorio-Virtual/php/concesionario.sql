-- Creacion de Base de Datos
CREATE DATABASE IF NOT EXISTS concesionario COLLATE utf8mb4_general_ci; 

-- Creacion de Tablas
CREATE TABLE IF NOT EXISTS `concesionario`.`user` (`id` VARCHAR(9) NOT NULL , `name` VARCHAR(100) NOT NULL , `surname` VARCHAR(100) NOT NULL , `email` VARCHAR(100) NOT NULL , `phone` INT(9) NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS `concesionario`.`color` (`code` VARCHAR(10) NOT NULL , `description` VARCHAR(100) NOT NULL , `metal` BOOLEAN NOT NULL, PRIMARY KEY (`code`)) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS `concesionario`.`dealer` (`did` INT NOT NULL AUTO_INCREMENT , `dealer_name` VARCHAR(100) NOT NULL , `location` VARCHAR(100) NOT NULL , `contact_phone` INT(9) NOT NULL , PRIMARY KEY (`did`)) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS `concesionario`.`car` (`plate` VARCHAR(7) NOT NULL , `model` VARCHAR(100) NOT NULL , `year` INT(4) NOT NULL , `price` FLOAT NOT NULL , `make` VARCHAR(100) NOT NULL , `color_code` VARCHAR(10) NOT NULL, `dealer_id` INT NOT NULL, PRIMARY KEY (`plate`), FOREIGN KEY (`color_code`) REFERENCES `concesionario`.`color`(`code`), FOREIGN KEY (`dealer_id`) REFERENCES `concesionario`.`dealer`(`did`)) ENGINE = InnoDB;
CREATE TABLE IF NOT EXISTS `concesionario`.`buys` (`user_id` VARCHAR(9) NOT NULL, `car_plate` VARCHAR(7) NOT NULL, `orderDate` DATE NOT NULL, `quantity` INT(3) NOT NULL, PRIMARY KEY(`user_id`, `car_plate`), FOREIGN KEY (`user_id`) REFERENCES `concesionario`.`user`(`id`), FOREIGN KEY (`car_plate`) REFERENCES `concesionario`.`car`(`plate`)) ENGINE = InnoDB;