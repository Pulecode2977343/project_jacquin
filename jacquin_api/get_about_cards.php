<?php
/**
 * Get About Cards - Public endpoint
 * GET /jacquin_api/get_about_cards.php
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/config/connection.php';

try {
    if (!isset($pdo)) {
        throw new Exception("Error de conexión a la base de datos.");
    }
    $stmt = $pdo->query("
        SELECT 
            id_card,
            title,
            subtitle,
            icon,
            description,
            image_url,
            images,
            display_order
        FROM about_cards 
        WHERE is_active = 1 
        ORDER BY display_order ASC
    ");

    $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Parse JSON images field if present
    foreach ($cards as &$card) {
        if ($card['images']) {
            $card['images'] = json_decode($card['images'], true);
        } else {
            $card['images'] = [];
        }
    }

    echo json_encode([
        "success" => true,
        "data" => $cards
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>