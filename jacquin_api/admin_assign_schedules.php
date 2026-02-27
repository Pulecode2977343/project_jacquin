<?php
/**
 * Admin: Assign Multiple Schedules to an Enrollment
 * 
 * POST /jacquin_api/admin_assign_schedules.php
 * Body: { "enrollment_id": 15, "schedule_ids": [3, 7, 12] }
 */

include_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config/connection.php';
require_once 'helpers/auth_helper.php';

// Protegemos el endpoint: Solo administradores
validateAdmin();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->enrollment_id) || !isset($data->schedule_ids) || !is_array($data->schedule_ids)) {
    echo json_encode(["success" => false, "message" => "enrollment_id y schedule_ids (array) son requeridos."]);
    exit;
}

$enrollmentId = intval($data->enrollment_id);
$scheduleIds = array_map('intval', $data->schedule_ids);

try {
    $pdo->beginTransaction();

    // 1. Verify enrollment exists
    $checkEnrollment = $pdo->prepare("SELECT id_enrollment FROM enrollments WHERE id_enrollment = ?");
    $checkEnrollment->execute([$enrollmentId]);
    if (!$checkEnrollment->fetch()) {
        throw new Exception("Inscripción no encontrada.");
    }

    // 2. Clear existing schedules for this enrollment
    $clearStmt = $pdo->prepare("DELETE FROM enrollment_schedules WHERE enrollment_id = ?");
    $clearStmt->execute([$enrollmentId]);

    // 3. Insert new schedules
    $insertStmt = $pdo->prepare("INSERT INTO enrollment_schedules (enrollment_id, schedule_id) VALUES (?, ?)");
    $inserted = 0;

    foreach ($scheduleIds as $scheduleId) {
        if ($scheduleId > 0) {
            // Verify schedule exists
            $checkSched = $pdo->prepare("SELECT id_schedule FROM schedules WHERE id_schedule = ?");
            $checkSched->execute([$scheduleId]);
            if ($checkSched->fetch()) {
                $insertStmt->execute([$enrollmentId, $scheduleId]);
                $inserted++;
            }
        }
    }

    // 4. Force Update Status to 'Activo' (Standard status for participants)
    if ($inserted > 0) {
        $updateStatus = $pdo->prepare("UPDATE enrollments SET status = 'Activo' WHERE id_enrollment = ?");
        $updateStatus->execute([$enrollmentId]);
    }

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "$inserted horario(s) asignado(s) correctamente.",
        "assigned_count" => $inserted
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>