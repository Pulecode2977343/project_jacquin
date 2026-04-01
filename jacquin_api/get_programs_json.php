<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

// Migration check (Point 15)
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS program_photos (
        id_photo INT AUTO_INCREMENT PRIMARY KEY,
        id_program VARCHAR(100) NOT NULL,
        photo_url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(id_program)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
} catch (Exception $e) {}

header('Content-Type: application/json');

$file = __DIR__ . '/data/programs.json';

if (!file_exists($file)) {
    echo json_encode([]);
    exit;
}

// [FIX 5] Cache headers: el navegador no descarga 800KB en cada visita
$mtime  = filemtime($file);
$etag   = '"' . md5_file($file) . '"';

header('Cache-Control: public, max-age=300');                         // 5 min caché
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $mtime) . ' GMT');
header('ETag: ' . $etag);

// Si el cliente ya tiene la versión actual, responder 304 sin cuerpo
if (
    (isset($_SERVER['HTTP_IF_NONE_MATCH']) && $_SERVER['HTTP_IF_NONE_MATCH'] === $etag) ||
    (isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) && strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']) >= $mtime)
) {
    http_response_code(304);
    exit;
}

echo file_get_contents($file);
?>
