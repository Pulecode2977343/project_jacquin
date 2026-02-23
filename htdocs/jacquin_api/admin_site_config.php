<?php
// POST admin — actualiza configuración del sitio (requiere Bearer token)
require_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido."]);
    exit;
}

require_once 'middleware/admin_auth.php';
requireAdminAuth();

require_once 'config/db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->enrollment_open) || !isset($data->enrollment_year)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Campos requeridos: enrollment_open, enrollment_year."]);
    exit;
}

$isOpen = $data->enrollment_open ? '1' : '0';
$year   = (int)$data->enrollment_year;

if ($year < 2020 || $year > 2099) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Año inválido."]);
    exit;
}

try {
    $stmt = $conn->prepare(
        "INSERT INTO site_config (config_key, config_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)"
    );

    $stmt->execute(['enrollment_open', $isOpen]);
    $stmt->execute(['enrollment_year', (string)$year]);

    echo json_encode([
        "success"         => true,
        "message"         => "Configuración actualizada.",
        "enrollment_open" => (bool)(int)$isOpen,
        "enrollment_year" => $year
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al guardar configuración."]);
}
