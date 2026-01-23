<?php
require_once __DIR__ . '/config/cors.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

try {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (!is_array($data)) {
        throw new Exception("Invalid JSON data");
    }

    // Basic validation could go here

    $file = __DIR__ . '/data/programs.json';

    // Ensure directory exists
    if (!is_dir(dirname($file))) {
        mkdir(dirname($file), 0777, true);
    }

    if (file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Programs saved successfully']);
    } else {
        throw new Exception("Failed to write to file");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>