<?php
spl_autoload_register(function ($className) {
    $filePaths = [
        'controladores/'.$className . '.php',
        '../../general/controladores/' . $className . '.php', 
    ];
    foreach ($filePaths as $file) {
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});