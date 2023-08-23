<?php
/*
    Modificacion de filtro. 
    Solucion de problema cuando se terminaba la sesion. 
*/
session_start();
require_once("../../../config.inc.php");
require_once("./../../../config_db.inc.php");
require_once('./../../../third_party/conexion/conexion.php');
require_once("./../../general/controladores/autoload.php");

foreach ($_POST as $key => $value) {
    $_POST[$key] = ($value=="") ? null : $value;
}

$_POST["rol"] = $_SESSION["rolcito"];
$_POST["usuario"] = $_SESSION["userID"];

$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '/';

$routes = [
    'Buscar' => [
        'method' => 'POST',
        'path' => '/buscar',
        'handler' => function ($odb) {
            $seguimientoController = new SeguimientoController($odb);
            return $seguimientoController->buscar($_POST["like"] ?? "", $_POST["usuario"]);
        },
    ],
    'Buscar atenciones' => [
        'method' => 'POST',
        'path' => '/buscarAtenciones',
        'handler' => function ($odb) {
            $seguimientoController = new SeguimientoController($odb);
            return $seguimientoController->buscarAtenciones();
        },
    ],
    'Buscar jerarquia' => [
        'method' => 'POST',
        'path' => '/buscarJerarquia',
        'handler' => function ($odb) {
            $jerarquiasController = new JerarquiasController($odb);
            $jerarquiasController = new JerarquiasController($odb);
            $data = $jerarquiasController->buscar();
            $usuarioAsignado = count(array_filter($data["data"], function($element){
                return $element["idUsuario"]==$_POST["usuario"];
            }));
            return ($usuarioAsignado) ? $jerarquiasController->buscar($_POST["idJerarquia"] ?? 0) : array("estado" => "finalizado", "data" => array());
        },
    ],
    'Buscar comentarios' => [
        'method' => 'POST',
        'path' => '/buscarComentarios',
        'handler' => function ($odb) {
            $comentarioController = new ComentarioController($odb);
            return $comentarioController->buscar(1, $_POST['aux'], $_POST["usuario"]);
        },
    ],
    'Buscar permisos' => [
        'method' => 'POST',
        'path' => '/buscarPermisos',
        'handler' => function ($odb) {
            $planeamientoController = new PlaneamientoController($odb);
            $permisosController = new PermisosController($odb);
            $rolesController = new RolesController($odb);

            $planeamientoController->generarDiasLaborales(date("Y-m-d", strtotime("-3 month")), date("Y-m-d", strtotime("+6 month")));

            $permisos = $permisosController->buscar("seguimiento", $rolesController->stringToInt($_SESSION["rolcito"]));
            $array1 = $permisosController->buscar("comentarios", $rolesController->stringToInt($_SESSION["rolcito"]));
            $array2 = $permisosController->buscar("horasSeguimiento", $rolesController->stringToInt($_SESSION["rolcito"]));
            foreach ($array1["data"] as $key => $value) {
                $permisos["data"][] = $value."Comentarios";
            }
            foreach ($array2["data"] as $key => $value) {
                $permisos["data"][] = $value."HorasSeguimiento";
            }
            return $permisos;
        },
    ],
    'Buscar estados' => [
        'method' => 'POST',
        'path' => '/buscarEstados',
        'handler' => function ($odb) {
            $seguimientoController = new SeguimientoController($odb);
            return $seguimientoController->buscarEstados();
        },
    ],
    'Insertar seguimiento' => [
        'method' => 'POST',
        'path' => '/insertar',
        'handler' => function ($odb) {
            $seguimientoController = new SeguimientoController($odb);
            return $seguimientoController->insertar($_POST['idAtencion'], $_POST["usuario"]);
        },
    ],
    'Modificar seguimiento' => [
        'method' => 'POST',
        'path' => '/modificar',
        'handler' => function ($odb) {
            $seguimientoController = new SeguimientoController($odb);
            $planeamientoController = new PlaneamientoController($odb);
            $planeamientoController->modificar($_POST);
            return $seguimientoController->modificar($_POST);
        },
    ],
    'Eliminar seguimiento' => [
        'method' => 'POST',
        'path' => '/eliminar',
        'handler' => function ($odb) {
            $seguimientoController = new SeguimientoController($odb);
            return $seguimientoController->eliminar($_POST["aux"]);
        },
    ],
    'Insertar comentario' => [
        'method' => 'POST',
        'path' => '/comentarioInsertar',
        'handler' => function ($odb) {
            $comentarioController = new ComentarioController($odb);
            return $comentarioController->insertar(1, $_POST['ID_Seguimiento'], $_POST['texto'], $_POST["usuario"], $_POST['destino']);
        },
    ],
    'Eliminar comentario' => [
        'method' => 'POST',
        'path' => '/comentarioEliminar',
        'handler' => function ($odb) {
            $comentarioController = new ComentarioController($odb);
            return $comentarioController->eliminar($_POST['aux']);
        },
    ],
    'Buscar Permisos Comentario' => [
        'method' => 'POST',
        'path' => '/buscarPermisosComentarios',
        'handler' => function ($odb) {
            $permisosController = new PermisosController($odb);
            $rolesController = new RolesController($odb);
            return $permisosController->buscar("comentarios", $rolesController->stringToInt($_SESSION["rolcito"]));
        },
    ],
    'Dibujar Grafico' => [
        'method' => 'POST',
        'path' => '/dibujarGrafico',
        'handler' => function ($odb) {
            $planeamientoController = new PlaneamientoController($odb);
            return $planeamientoController->buscar($_POST["ID_Seguimiento"]);
        },
    ],
    
    'Sincronizar Horas' => [
        'method' => 'POST',
        'path' => '/sincronizarHoras',
        'handler' => function ($odb) {
            $seguimientoController = new SeguimientoController($odb);
            return $seguimientoController->sincronizarHoras($_POST);
        },
    ],
    'Buscar Planeamiento' => [
        'method' => 'POST',
        'path' => '/planeamientoBuscar',
        'handler' => function ($odb) {
            $planeamientoController = new PlaneamientoController($odb);
            return $planeamientoController->buscar($_POST["aux"]);
        },
    ],
    'Planeamiento Insertar' => [
        'method' => 'POST',
        'path' => '/planeamientoInsertar',
        'handler' => function ($odb) {
            $planeamientoController = new PlaneamientoController($odb);
            return $planeamientoController->insertar($_POST["aux"]);
        },
    ],

    
];

function dispatch($routes, $method, $path, $odb) {
    foreach ($routes as $route => $config) {
        if ($config['method'] === $method && $config['path'] === $path) {
            return $config['handler']($odb);
        }
    }
    http_response_code(404);
}


ImpresionController::arrayToJSON(dispatch($routes, $method, $path, $odb));

