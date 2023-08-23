<?php
class JerarquiasController {
    private $odb;
    public function __construct(PDO $odb) {
        if($_SESSION["userID"]>0){
            $this->odb = $odb;
        }
    }

    public function buscar($idJerarquia = 0): array {
        $data = 'SELECT
        DISTINCT `primerNivel`.`idJerarquia`,
        `users`.`first`,
        `users`.`last`,
        `users`.`id` AS `idUsuario`,
        `primerNivel`.`idSuperior`,
            CASE
                WHEN `primerNivel`.`idSuperior` = 0 THEN 1
                WHEN `segundoNivel`.`idSuperior` = 0 THEN 2
                WHEN `tercerNivel`.`idSuperior` = 0 THEN 3
                WHEN `cuartoNivel`.`idSuperior` = 0 THEN 4
                WHEN `quintoNivel`.`idSuperior` = 0 THEN 5
                WHEN `sextoNivel`.`idSuperior` = 0 THEN 6
                ELSE 0
            END AS `NivelJerarquia`,
            CASE
                WHEN `primerNivel`.`idSuperior` = 0 THEN `primerNivel`.`idJerarquia`
                WHEN `segundoNivel`.`idSuperior` = 0 THEN `segundoNivel`.`idJerarquia`
                WHEN `tercerNivel`.`idSuperior` = 0 THEN `tercerNivel`.`idJerarquia`
                WHEN `cuartoNivel`.`idSuperior` = 0 THEN `cuartoNivel`.`idJerarquia`
                WHEN `quintoNivel`.`idSuperior` = 0 THEN `quintoNivel`.`idJerarquia`
                WHEN `sextoNivel`.`idSuperior` = 0 THEN `sextoNivel`.`idJerarquia`
                ELSE 0
            END AS `idGrupo`
    FROM `users`
    INNER JOIN `jerarquias` AS `primerNivel` ON `users`.`id` = `primerNivel`.`idUsuario`
    LEFT JOIN `jerarquias` AS `segundoNivel` ON `primerNivel`.`idSuperior` = `segundoNivel`.`idJerarquia`
    LEFT JOIN `jerarquias` AS `tercerNivel` ON `segundoNivel`.`idSuperior` = `tercerNivel`.`idJerarquia`
    LEFT JOIN `jerarquias` AS `cuartoNivel` ON `tercerNivel`.`idSuperior` = `cuartoNivel`.`idJerarquia`
    LEFT JOIN `jerarquias` AS `quintoNivel` ON `cuartoNivel`.`idSuperior` = `quintoNivel`.`idJerarquia`
    LEFT JOIN `jerarquias` AS `sextoNivel` ON `quintoNivel`.`idSuperior` = `sextoNivel`.`idJerarquia`
    WHERE `users`.`active` = 1  
    ORDER BY `idGrupo`, `NivelJerarquia`';
        $data = $this->odb->prepare($data);
        $data->execute();
        return (isset($data->errorInfo()[2])) ? $data->errorInfo() : ["estado"=>"finalizado", "data" => $data->fetchAll(PDO::FETCH_ASSOC)];
    }

    public function insertar(int $idSuperior, int $idUsuario): array {
        $sql = 'INSERT INTO `jerarquias`
                    (`idSuperior`,
                    `idUsuario`,
                    `modificadoPor`) VALUES
                    (?, ?, ?)';
        $query = $this->odb->prepare($sql);
        $query->execute([$idSuperior, $idUsuario, $_SESSION["userID"]]);
        return (isset($query->errorInfo()[2])) ? $query->errorInfo() : ["estado"=>"finalizado"];
    }


    public function modificar($datos): array {
        foreach ($datos as $key => $value) {
            if(gettype($value)=="array"){
                $idSuperior = explode("_", $key)[1];
                foreach ($value as $idUsuario) {
                    if($idUsuario>0){
                        $this->insertar($idSuperior, $idUsuario);
                    }
                }
            }elseif(explode("_", $key)[0]=="eliminar"){
                $key = explode("_", $key)[1];
                $this->eliminar($key);
            }elseif(explode("_", $key)[0]=="actualizar"){
                $idJerarquia = explode("_", $key)[1];
                $idUsuario = $value;
                $sql = 'UPDATE `jerarquias`
                        SET idUsuario = ?,
                        fechaActualizacion = ?,
                        modificadoPor = ?
                        WHERE idJerarquia = ?';
                $query = $this->odb->prepare($sql);
                $arr = [$idUsuario, date("Y-m-d H:i:s"), $_SESSION["userID"], $idJerarquia];
                $query->execute($arr);
            }
        }
        return (isset($query) && gettype($query)=="object" && isset($query->errorInfo()[2])) ? $query->errorInfo() : ["estado"=>"finalizado"];
    }

    public function eliminar(int $idJerarquia): array {
        $sql = 'DELETE FROM `jerarquias`
                WHERE idJerarquia = ?';
        $query = $this->odb->prepare($sql);
        $query->execute([$idJerarquia]);
        return (isset($query->errorInfo()[2])) ? $query->errorInfo() : ["estado"=>"finalizado"];
    }
}