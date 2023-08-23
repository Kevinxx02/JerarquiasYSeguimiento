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
            $jerarquiasController = new JerarquiasController($odb);
            return $jerarquiasController->buscar();
        },
    ],
    'Insertar' => [
        'method' => 'POST',
        'path' => '/insertar',
        'handler' => function ($odb) {
            $jerarquiasController = new JerarquiasController($odb);
            return $jerarquiasController->insertar(intval($_POST["idSuperior"] ?? 0), intval($_POST["idUsuario"]));
        },
    ],
    'Modificar' => [
        'method' => 'POST',
        'path' => '/modificar',
        'handler' => function ($odb) {
            $jerarquiasController = new JerarquiasController($odb);
            return $jerarquiasController->modificar($_POST);
        },
    ],
    'Buscar Permisos' => [
        'method' => 'POST',
        'path' => '/buscarPermisos',
        'handler' => function ($odb) {
            $permisosController = new PermisosController($odb);
            $rolesController = new RolesController($odb);
            return $permisosController->buscar("jerarquias", $rolesController->stringToInt($_SESSION["rolcito"]));
        },
    ],
    'Buscar usuarios' => [
        'method' => 'POST',
        'path' => '/buscarUsuarios',
        'handler' => function ($odb) {
            $usuariosController = new UsuariosController($odb);
            return $usuariosController->buscar();
        },
    ],
    
    'Log file' => [
        'method' => 'POST',
        'path' => '/loggerFile',
        'handler' => function ($odb) {
            $loggerController = new LoggerController();
            return $loggerController->file($_POST["aux"]);
        },
    ],
    
    'Log DB' => [
        'method' => 'POST',
        'path' => '/loggerDb',
        'handler' => function ($odb) {
            $loggerController = new LoggerController();
            return $loggerController->db($odb, $_POST["aux"]);
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

