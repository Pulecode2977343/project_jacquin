<?php
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Read the raw POST data
$input = file_get_contents('php://input');
$programsData = json_decode($input, true);

if ($programsData === null && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    exit;
}

// Define file path
$dataDir = __DIR__ . '/../data';
$programsFile = $dataDir . '/programs.json';

// Ensure data directory exists
if (!is_dir($dataDir)) {
    if (!mkdir($dataDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'No se pudo crear el directorio de datos']);
        exit;
    }
}

// Write the data to file
$jsonData = json_encode($programsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

if (file_put_contents($programsFile, $jsonData) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al escribir el archivo']);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Programas guardados exitosamente']);
?>