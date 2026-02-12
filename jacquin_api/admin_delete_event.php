<?php
// API Endpoint: Delete Event
// Admin only - Soft delete event and remove files

session_start();
require_once 'config/cors.php';
require_once 'config/connection.php';
require_once 'helpers/PathHelper.php';

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

    // Get file paths before deleting using PDO
    $stmt = $pdo->prepare("SELECT image_url, media_url, media_type FROM events WHERE id_event = ?");
    $stmt->execute([$event_id]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$event) {
        throw new Exception("Evento no encontrado.");
    }

    // Soft delete using PDO
    $stmt = $pdo->prepare("UPDATE events SET is_active = 0 WHERE id_event = ?");
    if (!$stmt->execute([$event_id])) {
        throw new Exception("Error al eliminar evento.");
    }

    // Base path using PathHelper
    $base_path = PathHelper::getUploadBaseDir();

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