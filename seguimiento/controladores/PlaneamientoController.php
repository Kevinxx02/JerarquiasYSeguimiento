<?php
class PlaneamientoController {
    private $odb;
    public function __construct(\PDO $odb) {
        if($_SESSION["userID"]>0){
            $this->odb = $odb;
        }
    }

    public function buscar(int $idSeguimiento): array {
        $query = 'SELECT 
                        `planeamiento`.`idPlaneamiento`, 
                        `planeamiento`.`idSeguimiento`, 
                        `planeamiento`.`titulo`, 
                        `planeamiento`.`gap`, 
                        `planeamiento`.`cantidadDias`, 
                        `planeamiento`.`color`,
                        (
                            SELECT `tmp_dias_laborales`.`fecha` 
                            FROM `tmp_dias_laborales`
                            WHERE `tmp_dias_laborales`.`id` = (
                                SELECT 
                                    (id + `planeamiento`.`gap`) 
                                FROM `tmp_dias_laborales` 
                                WHERE `tmp_dias_laborales`.`fecha` = `control_seguimiento`.`fechaInicio`
                            )
                        ) AS `fechaInicio`,
                        (
                            SELECT `tmp_dias_laborales`.`fecha` 
                            FROM `tmp_dias_laborales`
                            WHERE `tmp_dias_laborales`.`id` = (
                                SELECT 
                                    (id + `planeamiento`.`gap` + `planeamiento`.`cantidadDias`) 
                                FROM `tmp_dias_laborales` 
                                WHERE `tmp_dias_laborales`.`fecha` = `control_seguimiento`.`fechaInicio`
                            )
                        ) AS `fechaFinal`,
                        `control_seguimiento`.`fechaLiberacionEstimada` AS `liberacionInicio`,
                        (
                            SELECT `tmp_dias_laborales`.`fecha` 
                            FROM `tmp_dias_laborales`
                            WHERE `tmp_dias_laborales`.`id` = (
                                SELECT 
                                    (id + `control_seguimiento`.`planeamientoAnchoLiberacion`) 
                                FROM `tmp_dias_laborales` 
                                WHERE `tmp_dias_laborales`.`fecha` = `control_seguimiento`.`fechaLiberacionEstimada`
                            )
                        ) AS `liberacionFinal`,
                        `control_seguimiento`.`planeamientoAnchoLiberacion`
                        FROM `planeamiento`
                        INNER JOIN `control_seguimiento` ON `planeamiento`.`idSeguimiento` = `control_seguimiento`.`idSeguimiento`
                        WHERE `planeamiento`.`idSeguimiento` = ?';
        $query = $this->odb->prepare($query);
        $query->execute([$idSeguimiento]);
        return (isset($query->errorInfo()[2])) ? ["estado"=>"error", "data"=>$query->errorInfo()] : ["estado"=>"finalizado", "data"=>$query->fetchAll(\PDO::FETCH_ASSOC)];
    }
    
    public function insertar(int $idSeguimiento): array {
        $query = 'SELECT 
                        `planeamiento`.`idPlaneamiento`, 
                        `planeamiento`.`idSeguimiento`, 
                        `planeamiento`.`titulo`, 
                        `planeamiento`.`fechaInicio`, 
                        `planeamiento`.`cantidadDias`, 
                        `planeamiento`.`color`
                        FROM `planeamiento`
                        WHERE `idSeguimiento` = ?';
        $query = $this->odb->prepare($query);
        $query->execute([$idSeguimiento]);

        $query = 'INSERT INTO `planeamiento` (`idSeguimiento`, `titulo`, `gap`, `cantidadDias`, `color`, `fechaModificacion`, `modificadoPor`) 
        SELECT 
            ?,
            `parametros`.`segundoParametro`, 
            `parametros`.`tercerParametro`, 
            `parametros`.`cuartoParametro`, 
            `parametros`.`quintoParametro`, 
            ?,
            ?
        FROM `parametros`
        WHERE `parametros`.`primerParametro` = "planeamientoCampos"';
        $query = $this->odb->prepare($query);
        $query->execute([$idSeguimiento, date("Y-m-d H:i:s"), $_SESSION["userID"]]);
        return (isset($query->errorInfo()[2])) ? $query->errorInfo() : ["estado"=>"finalizado"];
    }
    
    public function modificar(array $data): array {
        $query = 'UPDATE `planeamiento` SET 
                    `gap` = ?, 
                    `color` = ?, 
                    `cantidadDias` = ?
                WHERE `idPlaneamiento` = ?';
        $query = $this->odb->prepare($query);
        foreach ($data as $key => $value) {
            if(substr($key, 0, 12)=="cantidadDias"){
                $id = substr($key, 13);
                $query->execute([$_POST["gap_".$id],$_POST["color_".$id], $_POST["cantidadDias_".$id], $id]);
            }
        }
        return (isset($query->errorInfo()[2])) ? $query->errorInfo() : ["estado"=>"finalizado"];
    }

    public function generarDiasLaborales($fecha_inicial, $fecha_final){
        require_once("./../../functions/common.php");
        generarDiasLaborales($this->odb, $fecha_inicial, $fecha_final);
    }
    
}