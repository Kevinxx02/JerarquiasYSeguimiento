<?php
class ComentarioController {
    private $odb;
    
    public function __construct(PDO $odb) {
        $this->odb = $odb;
    }
    
    
    public function buscar(int $tipo, int $idPadre, int $usuario): array {
        $sql = 'SELECT 
                    `comentarios`.`idComentario`, 
                    `comentarios`.`texto`,
                    CONCAT(`users`.`first`, " " ,`users`.`last`) AS creador, 
                    `users`.`image` AS foto,
                    `comentarios`.`fechaCreacion`
                FROM `comentarios` 
                INNER JOIN `users` ON `comentarios`.`origen` = `users`.`id`
                INNER JOIN `users` AS `usuarioActual` ON `usuarioActual`.`id` = ?
                LEFT JOIN `permisos` ON `permisos`.`grupo` = "comentarios" 
                    AND `permisos`.`nombre` = "ver" 
                    AND `permisos`.`identificador` = `usuarioActual`.`role_id`
                WHERE `comentarios`.`tipo` = ?
                    AND `comentarios`.`idPadre` = ?
                    AND (`comentarios`.`destino` IN (0, ?) 
                        OR `comentarios`.`origen` = ?
                        OR `permisos`.`valor` = 1)';
        $query = $this->odb->prepare($sql);
        $query->execute([$usuario, $tipo, $idPadre, $usuario, $usuario]);
        return (isset($query->errorInfo()[2])) ? ["estado"=>"error", "data"=>$query->errorInfo()] : ["estado"=>"finalizado", "data"=>$query->fetchAll(\PDO::FETCH_ASSOC)];
    }
    
    public function insertar(int $tipo, int $idPadre, string $texto, int $origen, int $destino): array {
        $sql = 'INSERT INTO `comentarios` 
                (tipo, idPadre, texto, origen, destino)
                VALUES (?, ?, ?, ?, ?)';
        $query = $this->odb->prepare($sql);
        $query->execute([$tipo, $idPadre, $texto, $origen, $destino]);
        return (isset($query->errorInfo()[2])) ? $query->errorInfo() : ["estado"=>"finalizado"];
    }
    
    public function eliminar(int $idComentario): array {
        $sql = 'DELETE FROM `comentarios` 
                WHERE idComentario = ?';
        $query = $this->odb->prepare($sql);
        $query->execute([$idComentario]);
        return (isset($query->errorInfo()[2])) ? $query->errorInfo() : ["estado"=>"finalizado"];
    }
}