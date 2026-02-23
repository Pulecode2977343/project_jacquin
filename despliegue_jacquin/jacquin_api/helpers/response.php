<?php
/**
 * helpers/response.php
 * Respuesta JSON estandarizada.
 * Limpia el buffer para evitar que warnings/echo previos rompan el JSON.
 */
declare(strict_types=1);

if (!function_exists('json_response')) {
    function json_response(array $payload, int $status = 200): void
    {
        // Limpiar cualquier output previo (warnings, espacios en blanco...)
        if (ob_get_length()) {
            @ob_clean();
        }

        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

        // JSON_UNESCAPED_UNICODE para mostrar tildes y ñ correctamente
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
