<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';

try {
    // Get Mission
    $stmt_mission = $pdo->query("SELECT title, description FROM web_mission LIMIT 1");
    $mission = $stmt_mission->fetch(PDO::FETCH_ASSOC);

    // Get Values
    $stmt_values = $pdo->query("SELECT title, description, icon, image_url FROM web_values WHERE is_active = 1 ORDER BY display_order ASC");
    $values = $stmt_values->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => [
            "mission" => $mission,
            "values" => $values
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>