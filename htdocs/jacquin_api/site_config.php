<?php
// GET público — retorna configuración del sitio (sin autenticación)
require_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");

require_once 'config/db.php';

try {
    $stmt = $conn->query(
        "SELECT config_key, config_value FROM site_config
         WHERE config_key IN ('enrollment_open', 'enrollment_year')"
    );
    $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    echo json_encode([
        "success"          => true,
        "enrollment_open"  => isset($rows['enrollment_open']) ? (bool)(int)$rows['enrollment_open'] : true,
        "enrollment_year"  => isset($rows['enrollment_year']) ? (int)$rows['enrollment_year'] : (int)date('Y')
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al obtener configuración."]);
}
