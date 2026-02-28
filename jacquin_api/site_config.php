<?php
// GET público — retorna configuración del sitio (sin autenticación)
require_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");

require_once 'config/connection.php';

try {
    $stmt = $pdo->query(
        "SELECT config_key, config_value FROM site_config
         WHERE config_key IN ('enrollment_open', 'enrollment_year', 'hero_tagline', 'hero_cta_text', 'hero_slides')"
    );
    $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    $heroSlides = [];
    if (!empty($rows['hero_slides'])) {
        $decoded = json_decode($rows['hero_slides'], true);
        if (is_array($decoded)) $heroSlides = $decoded;
    }

    echo json_encode([
        "success"          => true,
        "enrollment_open"  => isset($rows['enrollment_open']) ? (bool)(int)$rows['enrollment_open'] : true,
        "enrollment_year"  => isset($rows['enrollment_year']) ? (int)$rows['enrollment_year'] : (int)date('Y'),
        "hero_tagline"     => isset($rows['hero_tagline']) ? $rows['hero_tagline'] : "Donde la pasión se convierte en arte",
        "hero_cta_text"    => isset($rows['hero_cta_text']) ? $rows['hero_cta_text'] : "Descubre Nuestros Programas",
        "hero_slides"      => $heroSlides
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error al obtener configuración."]);
}
