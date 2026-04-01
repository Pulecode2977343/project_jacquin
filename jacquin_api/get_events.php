<?php
// API Endpoint: Get Events
// Public endpoint - Returns all active events

require_once __DIR__ . '/config/connection.php';

// Migration check (Point 15)
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS event_photos (
        id_photo INT AUTO_INCREMENT PRIMARY KEY,
        id_event INT NOT NULL,
        photo_url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(id_event)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
} catch (Exception $e) {}

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