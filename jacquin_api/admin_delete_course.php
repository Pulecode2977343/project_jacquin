<?php
include_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config/connection.php';
require_once 'helpers/auth_helper.php';

// Protegemos el endpoint: Solo administradores
validateAdmin();

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'Falta ID de curso']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Get all schedules for this course
    $stmtS = $pdo->prepare("SELECT id_schedule FROM schedules WHERE id_course = ?");
    $stmtS->execute([$data['id']]);
    $schedules = $stmtS->fetchAll(PDO::FETCH_COLUMN);

    if (!empty($schedules)) {
        $inQuery = implode(',', array_fill(0, count($schedules), '?'));
        
        // 2. Delete enrollment_schedules
        $pdo->prepare("DELETE FROM enrollment_schedules WHERE schedule_id IN ($inQuery)")->execute($schedules);
        
        // 3. Delete schedule_teachers
        $pdo->prepare("DELETE FROM schedule_teachers WHERE id_schedule IN ($inQuery)")->execute($schedules);
    }

    // 4. Delete enrollments (Active or Pending for this course)
    $pdo->prepare("DELETE FROM enrollments WHERE course_id = ?")->execute([$data['id']]);

    // 5. Delete schedules
    $pdo->prepare("DELETE FROM schedules WHERE id_course = ?")->execute([$data['id']]);

    // 6. Delete course
    $stmt = $pdo->prepare("DELETE FROM courses WHERE id_course = ?");
    if ($stmt->execute([$data['id']])) {
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Curso y todos sus datos asociados eliminados.']);
    } else {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Error al eliminar el curso.']);
    }

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error SQL: ' . $e->getMessage()]);
}
?>