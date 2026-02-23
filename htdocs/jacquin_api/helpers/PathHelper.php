<?php
/**
 * PathHelper.php - Gestión dinámica de rutas para JACQUIN API (Optimizado para Hosting)
 */

class PathHelper {
    /**
     * Retorna la ruta absoluta del sistema de archivos para las subidas.
     */
    public static function getUploadBaseDir() {
        // En la estructura del hosting infinityfree (htdocs):
        // API en: /htdocs/jacquin_api/
        // Frontend en: /htdocs/
        // La raíz de las subidas es /htdocs/uploads/
        
        $htdocsRoot = realpath(__DIR__ . '/../../') . DIRECTORY_SEPARATOR;
        
        // Verificamos si existe la carpeta uploads en ese nivel
        if (is_dir($htdocsRoot)) {
            return $htdocsRoot;
        }

        // Fallback para desarrollo local (XAMPP)
        $relativeWeb = __DIR__ . '/../../web_page/pages/';
        if (is_dir($relativeWeb)) {
            return realpath($relativeWeb) . DIRECTORY_SEPARATOR;
        }

        return realpath(__DIR__ . '/../') . DIRECTORY_SEPARATOR;
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
