<?php
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

// Programs are stored in a JSON file
$programsFile = __DIR__ . '/../data/programs.json';

// Ensure data directory exists
$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// If file doesn't exist, return empty object
if (!file_exists($programsFile)) {
    echo json_encode([]);
    exit;
}

$data = file_get_contents($programsFile);
$programs = json_decode($data, true);

if ($programs === null) {
    echo json_encode([]);
} else {
    echo json_encode($programs);
}
?>