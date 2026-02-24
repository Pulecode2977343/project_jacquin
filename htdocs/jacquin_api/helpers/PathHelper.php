<?php
/**
 * PathHelper.php - Gestión dinámica de rutas para JACQUIN API
 */

class PathHelper {
    /**
     * Retorna la ruta absoluta del sistema de archivos para las subidas.
     * Detecta si está en XAMPP o en producción (Linux).
     */
    public static function getUploadBaseDir() {
        // Recomendado: Guardar dentro de la propia carpeta public del API
        // Esto permite que el frontend acceda vía [API_URL]/public/uploads/...
        $apiPublic = __DIR__ . '/../public/';
        if (!is_dir($apiPublic)) {
            mkdir($apiPublic, 0755, true);
        }
        return realpath($apiPublic) . DIRECTORY_SEPARATOR;
    }

    /**
     * Asegura que un directorio existe
     */
    public static function ensureDir($path) {
        if (!is_dir($path)) {
            mkdir($path, 0755, true);
        }
        return $path;
    }
}
