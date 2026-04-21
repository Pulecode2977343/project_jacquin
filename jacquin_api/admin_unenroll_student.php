<?php
/**
 * admin_unenroll_student.php
 * Retira la matrícula de un estudiante (cambia status a 'Retirado').
 */
require_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';
require_once 'helpers/auth_helper.php';
require_once 'helpers/audit_helper.php';

validateAdminOrSecretary($pdo);

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id_enrollment'])) {
    echo json_encode(['success' => false, 'message' => 'ID de matrícula no proporcionado.']);
    exit;
}

try {
    $pdo->beginTransaction();

    $enrollId = (int) $data['id_enrollment'];

    // 1. Eliminar registros en enrollment_schedules
    $pdo->prepare("DELETE FROM enrollment_schedules WHERE enrollment_id = ?")->execute([$enrollId]);

    // 2. Cambiar estado de la matrícula a 'Retirado'
    $stmt = $pdo->prepare("UPDATE enrollments SET status = 'Retirado' WHERE id_enrollment = ?");
    $stmt->execute([$enrollId]);

    if ($stmt->rowCount() > 0) {
        logAudit($pdo, 'update', 'enrollment', $enrollId, [
            'action' => 'unenroll',
            'new_status' => 'Retirado'
        ]);
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Matrícula retirada exitosamente.']);
    } else {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Matrícula no encontrada o ya retirada.']);
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>