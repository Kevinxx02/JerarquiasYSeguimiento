<?php
class PermisosController {
    private $odb;
    
    public function __construct(PDO $odb) {
        $this->odb = $odb;
    }
    public function buscar(string $grupo, int $identificador): array {
        $data = 'SELECT 
                    nombre 
                FROM `permisos` 
                WHERE grupo=? 
                    AND identificador=?
                    AND valor=1';
        $data = $this->odb->prepare($data);
        $data->execute([$grupo, $identificador]);
        return (isset($data->errorInfo()[2])) ? ["estado"=>"error", "data"=> $data->errorInfo()] : ["estado"=>"finalizado", "data" => $data->fetchAll(PDO::FETCH_COLUMN, 0)];
    }
}