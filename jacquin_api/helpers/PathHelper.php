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
        // Opción 1: Basado en estructura física relativa al backend (Recomendado)
        // El backend está en /jacquin_api/ y el frontend en /web_page/ (o /jacquin_web/)
        $relativeWeb = __DIR__ . '/../../web_page/pages/';
        
        if (is_dir($relativeWeb)) {
            return realpath($relativeWeb) . DIRECTORY_SEPARATOR;
        }

        // Opción 2: Fallback para XAMPP local si el symlink o ruta relativa falla
        $xamppPath = 'C:/xampp/htdocs/jacquin_web/pages/';
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' && is_dir($xamppPath)) {
            return $xamppPath;
        }

        // Opción 3: Ruta por defecto para el hosting (basado en la estructura de una carpeta hermana)
        return realpath(__DIR__ . '/../pages/') . DIRECTORY_SEPARATOR;
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
