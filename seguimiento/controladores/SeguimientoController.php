<?php
date_default_timezone_set('America/Lima');

class SeguimientoController {

    private $odb;
    public function __construct(PDO $odb) {
        if($_SESSION["userID"]>0){
            $this->odb = $odb;
        }
    }
    public function buscar(string $like = "", $usuario): array {
        $like = "%$like%";
        $consulta = 'SELECT 
                        `control_seguimiento`.`idSeguimiento`, 
                        `control_seguimiento`.`idAtencion`, 
                        `atencion`.`numAtencion`, 
                        `atencion`.`nomAtencion`, 
                        `estado`.`nombre` AS `estado`, 
                        `control_seguimiento`.`fechaInicio`, 
                        `control_seguimiento`.`fechaAsignada`, 
                        `control_seguimiento`.`fechaLiberacionEstimada`, 
                        `control_seguimiento`.`fechaRealLiberada`, 
                        `control_seguimiento`.`fechaFinCierreEstimado`, 
                        `control_seguimiento`.`fechaFinCierre`, 
                        `control_seguimiento`.`horaDesaEstimada`,
                        `control_seguimiento`.`horaDesaReal`,
                        `control_seguimiento`.`horaQAEstimada`,
                        `control_seguimiento`.`horaQAReal`,
                        `control_seguimiento`.`horaTotalEstimada`,
                        `control_seguimiento`. `horaTotalReal`,
                        `control_seguimiento`.`observaciones`,
                        `analista`.`first` AS `analista`,
                        CONCAT(`users`.`first`) AS `nomDesarrollador`,
                        `control_seguimiento`.`idAnalista`,
                        `control_seguimiento`.`desarrollador`,
                        IFNULL(
                        CASE
                            WHEN `control_seguimiento`.`fechaRealLiberada` IS NULL 
                                    OR `control_seguimiento`.`fechaRealLiberada` = "0000-00-00" THEN
                                    (SELECT COALESCE((SELECT `tercerParametro` FROM `parametros` WHERE `parametros`.`primerParametro`="alertaSeguimiento" AND IFNULL(DATEDIFF(`control_seguimiento`.`fechaLiberacionEstimada`, NOW()), 5) >= `parametros`.`segundoParametro` LIMIT 1), "#ff0000"))
                            WHEN `control_seguimiento`.`fechaFinCierre` IS NULL 
                                    OR `control_seguimiento`.`fechaFinCierre` = "0000-00-00"  THEN
                                    (SELECT COALESCE((SELECT `tercerParametro` FROM `parametros` WHERE `parametros`.`primerParametro`="alertaSeguimiento" AND IFNULL(DATEDIFF(`control_seguimiento`.`fechaFinCierreEstimado`, NOW()), 5) >= `parametros`.`segundoParametro` LIMIT 1), "#ff0000"))
                        END, "#008000" ) AS "alerta"
                    FROM `control_seguimiento`
                    INNER JOIN `atencion` ON `atencion`.`idAtencion` = `control_seguimiento`.`idAtencion`
                    LEFT JOIN `sistema` ON `atencion`.`idSistema` = `sistema`.`idSistema`
                    INNER JOIN `estado` ON `control_seguimiento`.`estado` = `estado`.`id`
                    LEFT JOIN `jerarquias` AS `primerNivel` ON `control_seguimiento`.`desarrollador` = `primerNivel`.`idJerarquia`
                    LEFT JOIN `jerarquias` AS `segundoNivel` ON `primerNivel`.`idSuperior` = `segundoNivel`.`idJerarquia`
                    LEFT JOIN `jerarquias` AS `tercerNivel` ON `segundoNivel`.`idSuperior` = `tercerNivel`.`idJerarquia`
                    LEFT JOIN `jerarquias` AS `cuartoNivel` ON `tercerNivel`.`idsuperior` = `cuartoNivel`.`idJerarquia`
                    LEFT JOIN `jerarquias` AS `quintoNivel` ON `cuartoNivel`.`idSuperior` = `quintoNivel`.`idJerarquia`
                    LEFT JOIN `jerarquias` AS `sextoNivel` ON `quintoNivel`.`idSuperior` = `sextoNivel`.`idJerarquia`
                    LEFT JOIN `users` ON `primerNivel`.`idUsuario` = `users`.`id`
                    LEFT JOIN `jerarquias` AS `analistaPrimerNivel` ON `control_seguimiento`.`idAnalista` = `analistaPrimerNivel`.`idJerarquia`
                    LEFT JOIN `jerarquias` AS `analistaSegundoNivel` ON `analistaPrimerNivel`.`idSuperior` = `analistaSegundoNivel`.`idJerarquia`
                    LEFT JOIN `jerarquias` AS `analistaTercerNivel` ON `analistaSegundoNivel`.`idSuperior` = `analistaTercerNivel`.`idJerarquia`
                    LEFT JOIN `jerarquias` AS `analistaCuartoNivel` ON `analistaTercerNivel`.`idsuperior` = `analistaCuartoNivel`.`idJerarquia`
                    LEFT JOIN `jerarquias` AS `analistaQuintoNivel` ON `analistaCuartoNivel`.`idSuperior` = `analistaQuintoNivel`.`idJerarquia`
                    LEFT JOIN `jerarquias` AS `analistaSextoNivel` ON `analistaQuintoNivel`.`idSuperior` = `analistaSextoNivel`.`idJerarquia`
                    LEFT JOIN `users` AS `analista` ON `analistaPrimerNivel`.`idUsuario` = `analista`.`id`
                    WHERE 
                        `control_seguimiento`.`idSeguimiento` LIKE ?
                        AND ? IN (
                                    `primerNivel`.`idUsuario`, 
                                    `segundoNivel`.`idUsuario`, 
                                    `tercerNivel`.`idUsuario`, 
                                    `cuartoNivel`.`idUsuario`, 
                                    `quintoNivel`.`idUsuario`, 
                                    `sextoNivel`.`idUsuario`,
                                    `analistaPrimerNivel`.`idUsuario`, 
                                    `analistaSegundoNivel`.`idUsuario`, 
                                    `analistaTercerNivel`.`idUsuario`, 
                                    `analistaCuartoNivel`.`idUsuario`, 
                                    `analistaQuintoNivel`.`idUsuario`, 
                                    `analistaSextoNivel`.`idUsuario`
                                    )
                        ';
        $resultado = $this->odb->prepare($consulta);
        $resultado->execute([$like, $usuario]);
        return (isset($resultado->errorInfo()[2])) ? ["estado"=>"error", "data"=>$resultado->errorInfo()] : ["estado"=>"finalizado", "data"=>$resultado->fetchAll(\PDO::FETCH_ASSOC)];
    }
    
    public function insertar(int $idAtencion, int $usuario): array {
        $currDate = date("Y-m-d");
        
        $sql = 'INSERT INTO `control_seguimiento` 
                    (`idAtencion`, 
                    `fechaAsignada`,
                    `fechainicio`,
                    `fechaLiberacionEstimada`, 
                    `fechaRealLiberada`, 
                    `fechaFinCierre`,
                    `horaDesaEstimada`,
                    `horaDesaReal`,
                    `horaQAEstimada`,
                    `horaQAReal`,
                    `horaTotalEstimada`,
                    `horaTotalReal`,
                    `idAnalista`,
                    `desarrollador`,
                    `modificadoPor`)
                SELECT
                    `idAtencion`, 
                    `fechaAsignada`, 
                    (SELECT `tmp_dias_laborales`.`fecha` FROM `tmp_dias_laborales` WHERE `tmp_dias_laborales`.`fecha`>=? LIMIT 1),
                    `fechaLiberacionEstimada`, 
                    `fechaRealLiberada`, 
                    `fechaFinCierre`,
                    0,
                    (SELECT IFNULL((SELECT SUM(duracion) FROM timereport 
                        INNER JOIN atencion ON atencion.numAtencion=timereport.numAtencion AND timereport.idTipAtencion=1
                        WHERE atencion.idAtencion=main.idAtencion
                        GROUP BY timereport.idTipAtencion), 0)),
                    0,
                    (SELECT IFNULL((SELECT SUM(duracion) FROM timereport 
                        INNER JOIN atencion ON atencion.numAtencion=timereport.numAtencion AND timereport.idTipAtencion=6
                        WHERE atencion.idAtencion=main.idAtencion
                        GROUP BY timereport.idTipAtencion), 0)),
                    0,
                    (SELECT IFNULL((SELECT SUM(duracion) FROM timereport 
                        INNER JOIN atencion ON atencion.numAtencion=timereport.numAtencion AND timereport.idTipAtencion IN (1,6)
                        WHERE atencion.idAtencion=main.idAtencion), 0)),
                    `idAnalista`,
                    (SELECT idJerarquia FROM jerarquias WHERE idUsuario = ? LIMIT 1),
                    ?
                FROM atencion AS main
                WHERE idAtencion = ?';
        $query = $this->odb->prepare($sql);
        $query->execute([$currDate, $usuario, $usuario, $idAtencion]);
        return (isset($query->errorInfo()[2])) ? $query->errorInfo() : ["estado"=>"finalizado", "data" => $this->odb->lastInsertId()];
    }
    public function sincronizarHoras($data): array{
        $numAtencion = $_POST["Número_Atención"];
        $idSeguimiento = $_POST["ID_Seguimiento"];
        $arr = array($numAtencion, $numAtencion, $numAtencion, date("Y-m-d"), $_POST["usuario"], $idSeguimiento);

        $query = 'UPDATE `control_seguimiento` SET 
                    `horaDesaReal` = (
                                        SELECT IFNULL(
                                            (
                                                SELECT SUM(duracion) FROM timereport 
                                                WHERE timereport.idTipAtencion=1
                                                    AND numAtencion=?)
                                            , 0)
                                        ),
                    `horaQAReal`   = (
                                        SELECT IFNULL(
                                            (
                                                SELECT SUM(duracion) FROM timereport 
                                                WHERE timereport.idTipAtencion=6
                                                    AND numAtencion=?)
                                            , 0)
                                        ),
                    `horaTotalReal` = (
                                        SELECT IFNULL(
                                            (
                                                SELECT SUM(duracion) FROM timereport 
                                                WHERE timereport.idTipAtencion IN (1,6)
                                                    AND numAtencion=?)
                                            , 0)
                                        ),
                    `fechaModificacion` = ?, 
                    `modificadoPor` = ? 
                WHERE `idSeguimiento` = ?';
                
        $query = $this->odb->prepare($query);
        $query->execute($arr);
        return (isset($query->errorInfo()[2])) ? ["estado"=>"error", "data"=>$query->errorInfo()] : ["estado"=>"finalizado", "data"=>$query->fetchAll(\PDO::FETCH_ASSOC)];

    }

    public function buscarAtenciones(): array {
        $query = 'SELECT 
                        `idAtencion`, 
                        `nomAtencion`, 
                        `numAtencion` 
                    FROM `atencion` 
                    INNER JOIN users_empresa ON users_empresa.idEmpresa = atencion.idEmpresa
                    AND users_empresa.idUser=? 
                    AND users_empresa.estado=1
                    WHERE `idAtencion` NOT IN (SELECT `idAtencion` FROM `control_seguimiento`)';
        $data = $this->odb->prepare($query);
        $data->execute([$_SESSION["userID"] ?? 0]);
        return (isset($data->errorInfo()[2])) ? ["estado"=>"error", "data"=>$data->errorInfo()] : ["estado"=>"finalizado", "data"=>$data->fetchAll(\PDO::FETCH_ASSOC)];
    }
    

    public function modificar(array $data): array {
        $arr = (isset($data['Observaciones'])) 
        ? array(
                $data['Observaciones'],
                date("Y-m-d"),
                $data["usuario"],
                $data['ID_Seguimiento']
            ) 
        : array (
                $data['Fecha_Asignada'],
                $data['Fecha_Inicio'],
                $data['Fecha_Liberacion_Estimada'],
                $data['Fecha_Liberacion_Real'],
                $data['Fecha_Produccion_Estimada'],
                $data['Fecha_Produccion_Real'],
                $data['Horas_Desa_Estimadas'] ?? 0,
                $data['Horas_Desa_Reales'] ?? 0,
                $data['Horas_QA_Estimadas'] ?? 0,
                $data['Horas_QA_Reales'] ?? 0,
                $data['Horas_Total_Estimadas'] ?? 0,
                $data['Horas_Total_Reales'] ?? 0,
                $data['Analista'],
                $data['Analista_QG'],
                $data['Ancho_Liberacion'],
                $data['Estado'],
                date("Y-m-d"),
                $data["usuario"],
                $data['ID_Seguimiento']
            );

        $sql = (isset($data['Observaciones'])) 
                ? 'UPDATE `control_seguimiento` SET 
                    `observaciones` = ?, 
                    `fechaModificacion` = ?, 
                    `modificadoPor` = ? 
                WHERE `idSeguimiento` = ?'

                : 'UPDATE `control_seguimiento` SET 
                    `fechaAsignada` = ?, 
                    `fechaInicio` = (SELECT `tmp_dias_laborales`.`fecha` FROM `tmp_dias_laborales` WHERE `tmp_dias_laborales`.`fecha`>=? LIMIT 1), 
                    `fechaLiberacionEstimada` = ?, 
                    `fechaRealLiberada` = ?, 
                    `fechaFinCierreEstimado` = ?, 
                    `fechaFinCierre` = ?, 
                    `horaDesaEstimada` = ?,
                    `horaDesaReal` = ?,
                    `horaQAEstimada` = ?,
                    `horaQAReal` = ?,
                    `horaTotalEstimada` = ?,
                    `horaTotalReal` = ?,
                    `idAnalista` = ?,
                    `desarrollador` = ?,
                    `planeamientoAnchoLiberacion` = ?,
                    `estado` = ?, 
                    `fechaModificacion` = ?, 
                    `modificadoPor` = ? 
                WHERE `idSeguimiento` = ?';
        $query = $this->odb->prepare($sql);
        $query->execute($arr);
        return (isset($query->errorInfo()[2])) ? $query->errorInfo() : ["estado"=>"finalizado", "Afectados" => $query->rowCount()];
    }
    
    public function buscarEstados(): array {
        $resultado = 'SELECT 
                        `id`,
                        `nombre`
                    FROM `estado` 
                    WHERE `dominio` = "SEGUIMIENTO"';
        $resultado = $this->odb->prepare($resultado);
        $resultado->execute();
        return (isset($resultado->errorInfo()[2])) ? ["estado"=>"error", "data"=>$resultado->errorInfo()] : ["estado"=>"finalizado", "data"=>$resultado->fetchAll(\PDO::FETCH_ASSOC)];
    }
    
    public function eliminar(int $id): array {
        $sql = 'DELETE FROM `control_seguimiento` 
                WHERE `idSeguimiento`=?';
        $query = $this->odb->prepare($sql);
        $query->execute([$id]);
        return (isset($query->errorInfo()[2])) ? $query->errorInfo() : ["estado"=>"finalizado"];
    }
}