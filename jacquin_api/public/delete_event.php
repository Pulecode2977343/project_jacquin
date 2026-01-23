<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/connection.php';

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!isset($data['id'])) {
        throw new Exception("ID de evento no proporcionado.");
    }

    $id = intval($data['id']);

    $sql = "DELETE FROM events WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true, 'message' => 'Evento eliminado correctamente']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>