<?php
/**
 * Eliminar un horario específico de un enrollment
 */
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['enrollment_id']) || !isset($data['schedule_id'])) {
    echo json_encode(['success' => false, 'message' => 'Falta el ID de inscripción o el ID de horario']);
    exit;
}

$enrollmentId = intval($data['enrollment_id']);
$scheduleId = intval($data['schedule_id']);

try {
    // Verificar cuántos horarios tiene el enrollment
    $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM enrollment_schedules WHERE enrollment_id = ?");
    $countStmt->execute([$enrollmentId]);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    if ($total <= 1) {
        echo json_encode(['success' => false, 'message' => 'No puedes eliminar el único horario. Usa desinscribir en su lugar.']);
        exit;
    }

    // Eliminar el horario específico
    $stmt = $pdo->prepare("DELETE FROM enrollment_schedules WHERE enrollment_id = ? AND schedule_id = ?");
    $stmt->execute([$enrollmentId, $scheduleId]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Horario eliminado correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontró el horario especificado']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>