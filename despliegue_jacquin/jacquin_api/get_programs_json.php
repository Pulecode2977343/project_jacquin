<?php
require_once __DIR__ . '/config/cors.php';

header('Content-Type: application/json');

$file = __DIR__ . '/data/programs.json';

if (file_exists($file)) {
    echo file_get_contents($file);
} else {
    echo json_encode([]);
}
?>