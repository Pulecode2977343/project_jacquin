<?php
// API Endpoint: Delete Event
// Admin only - Soft delete event and remove files

session_start();
require_once 'config/cors.php';
require_once 'config/connection.php';

// Verify admin session
if (!isset($_SESSION['user']) || $_SESSION['user']['id_rol'] != 1) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Acceso denegado."]);
    exit;
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    $event_id = intval($data['event_id'] ?? 0);

    if ($event_id <= 0) {
        throw new Exception("ID de evento inválido.");
    }

    // Get file paths before deleting
    $stmt = $conn->prepare("SELECT image_url, media_url, media_type FROM events WHERE id_event = ?");
    $stmt->bind_param("i", $event_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $event = $result->fetch_assoc();

    if (!$event) {
        throw new Exception("Evento no encontrado.");
    }

    // Soft delete
    $stmt = $conn->prepare("UPDATE events SET is_active = 0 WHERE id_event = ?");
    $stmt->bind_param("i", $event_id);

    if (!$stmt->execute()) {
        throw new Exception("Error al eliminar evento.");
    }

    // Delete physical files
    $base_path = "c:/xampp/htdocs/jacquin_web/pages/";

    if ($event['image_url'] && file_exists($base_path . $event['image_url'])) {
        @unlink($base_path . $event['image_url']);
    }

    if ($event['media_url'] && $event['media_type'] !== 'video_youtube' && file_exists($base_path . $event['media_url'])) {
        @unlink($base_path . $event['media_url']);
    }

    echo json_encode([
        "success" => true,
        "message" => "Evento eliminado exitosamente."
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>