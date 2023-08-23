<?php
class LoggerController {
    public function file(string $mensaje=""): array {
        date_default_timezone_set('America/Lima');
        $myfile = fopen("log.txt", "a") or die("Unable to open file!");
        $txt = date("Y-m-d H:i:s").' ['.$_SESSION["usuario"]."]:  $mensaje\n";
        fwrite($myfile, $txt);
        fclose($myfile);
        return ["estado"=>"finalizado, pero no mostrado"];
    }

    public function db(PDO $odb, string $mensaje): array {
        /*
            CREATE TABLE `ea000143_sqtm`.`logs` ( `id` INT NOT NULL AUTO_INCREMENT , `area` TEXT NOT NULL , `idUsuario` INT NOT NULL , `mensaje` TEXT NOT NULL , `fechaCreacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`id`)) ENGINE = InnoDB; 
        */
        $backtrace = debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT, 2)[1]['file'] ?? "Error";
        
        $sql = 'INSERT INTO `logs`
                    (`area`,
                    `idUsuario`,
                    `mensaje`) VALUES
                    (?, ?, ?)';
        $query = $odb->prepare($sql);
        $query->execute(["Prueba", $_SESSION["userID"], $mensaje]);
        return (isset($query->errorInfo()[2])) ? $query->errorInfo() : ["estado"=>"finalizado"];
    }
   
}