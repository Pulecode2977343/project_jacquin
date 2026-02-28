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

require_once 'helpers/auth_helper.php';
validateAdmin();

require_once 'config/connection.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->enrollment_open) && !isset($data->hero_tagline)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No se enviaron datos para actualizar."]);
    exit;
}

$isOpen = $data->enrollment_open ? '1' : '0';
$yearRaw = isset($data->enrollment_year) ? $data->enrollment_year : null;
$year = null;

if ($isOpen === '1') {
    if (empty($yearRaw)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "El año de vigencia es obligatorio cuando las matrículas están abiertas."]);
        exit;
    }
    $year = (int)$yearRaw;
    if ($year < 2020 || $year > 2099) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Año inválido (debe ser entre 2020 y 2099)."]);
        exit;
    }
} else {
    // Si está cerrado, el año es opcional. Si lo envían, lo guardamos; si no, queda vacío o nulo.
    $year = !empty($yearRaw) ? (int)$yearRaw : null;
}

try {
    $stmt = $pdo->prepare(
        "INSERT INTO site_config (config_key, config_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)"
    );

    // Guardar matrículas (si se enviaron)
    if (isset($data->enrollment_open)) {
        $stmt->execute(['enrollment_open', $isOpen]);
        $stmt->execute(['enrollment_year', (string)$year]);
    }

    // Guardar textos del Hero (si se enviaron)
    if (isset($data->hero_tagline)) {
        $stmt->execute(['hero_tagline', trim((string)$data->hero_tagline)]);
    }
    if (isset($data->hero_cta_text)) {
        $stmt->execute(['hero_cta_text', trim((string)$data->hero_cta_text)]);
    }

    echo json_encode([
        "success" => true,
        "message" => "Configuración actualizada correctamente."
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al guardar configuración."]);
}
