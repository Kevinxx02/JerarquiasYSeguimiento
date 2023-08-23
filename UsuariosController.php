<?php
class UsuariosController {
    private $odb;
    public function __construct(PDO $odb) {
        $this->odb = $odb;
        if($_SESSION["userID"]>0){
            $this->odb = $odb;
        }
    }

    public function buscar(): array {
        $data = 'SELECT * 
                FROM users 
                WHERE `users`.`active` = 1';
        $data = $this->odb->prepare($data);
        $data->execute();
        return (isset($data->errorInfo()[2])) ? $data->errorInfo() : ["estado"=>"finalizado", "data" => $data->fetchAll(PDO::FETCH_ASSOC)];
    }

}