<?php
class ImpresionController {

    public static function arrayToJSON(array $arr): void {
        echo json_encode($arr, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}