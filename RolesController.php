<?php
class RolesController {
    private $odb;
    
    public function __construct(PDO $odb) {
        $this->odb = $odb;
    }

    public function buscar(): int {
        $data = 'SELECT id FROM roles';
        $data = $odb->prepare($data);
        $data->execute([$str]);
        $data = $data->fetch(PDO::FETCH_ASSOC);
        return $data["id"];
    }

    public function stringToInt(string $str): int {
        $data = 'SELECT id FROM roles WHERE description = ?';
        $data = $this->odb->prepare($data);
        $data->execute([$str]);
        $data = $data->fetch(PDO::FETCH_ASSOC);
        return $data["id"];
    }
}