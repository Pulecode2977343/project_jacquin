<?php
// API Endpoint: Get Events
// Public endpoint - Returns all active events

require_once __DIR__ . '/config/connection.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    if (!isset($pdo)) {
        throw new Exception("Error interno: No se pudo establecer la conexión a la base de datos.");
    }

    $stmt = $pdo->prepare("
        SELECT 
            id_event,
            title,
            description,
            event_date,
            event_time,
            event_type,
            location,
            cost,
            image_url,
            media_type,
            media_url,
            is_featured,
            created_at
        FROM events
        WHERE is_active = 1
        ORDER BY is_featured DESC, event_date DESC, created_at DESC
    ");

    $stmt->execute();
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $events
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al cargar eventos: " . $e->getMessage()
    ]);
}
?>