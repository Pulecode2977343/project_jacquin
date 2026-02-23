<?php
/**
 * Agregar un horario adicional a un enrollment existente
 */
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['enrollment_id']) || !isset($data['schedule_id'])) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

$enrollmentId = intval($data['enrollment_id']);
$scheduleId = intval($data['schedule_id']);

try {
    // Verificar que el enrollment existe
    $checkEnroll = $pdo->prepare("SELECT * FROM enrollments WHERE id_enrollment = ?");
    $checkEnroll->execute([$enrollmentId]);
    if (!$checkEnroll->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Inscripción no encontrada']);
        exit;
    }

    // Verificar si ya tiene ese horario
    $checkDup = $pdo->prepare("SELECT * FROM enrollment_schedules WHERE enrollment_id = ? AND schedule_id = ?");
    $checkDup->execute([$enrollmentId, $scheduleId]);
    if ($checkDup->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Este horario ya está asignado']);
        exit;
    }

    // Verificar capacidad del horario (máximo 15)
    $checkCapacity = $pdo->prepare("SELECT COUNT(*) as total FROM enrollment_schedules WHERE schedule_id = ?");
    $checkCapacity->execute([$scheduleId]);
    $count = $checkCapacity->fetch(PDO::FETCH_ASSOC)['total'];

    if ($count >= 15) {
        echo json_encode(['success' => false, 'message' => 'Este horario está lleno (máximo 15 estudiantes)']);
        exit;
    }

    // Agregar horario al enrollment
    $stmt = $pdo->prepare("INSERT INTO enrollment_schedules (enrollment_id, schedule_id) VALUES (?, ?)");
    $stmt->execute([$enrollmentId, $scheduleId]);

    echo json_encode(['success' => true, 'message' => 'Horario agregado correctamente']);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>