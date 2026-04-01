<?php
/**
 * admin_enroll_student.php
 * Inscribe un estudiante directamente (Admin/Secretario).
 * REQUERIMIENTO: Sin límite de cupos y con auditoría.
 */
require_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';
require_once 'helpers/auth_helper.php';
require_once 'helpers/conflict_helper.php';
require_once 'helpers/audit_helper.php';

validateAdminOrSecretary($pdo);

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['student_id'], $data['course_id'])) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos (student_id y course_id son requeridos).']);
    exit;
}

$scheduleIds = [];
if (isset($data['schedule_ids']) && is_array($data['schedule_ids'])) {
    $scheduleIds = array_map('intval', $data['schedule_ids']);
} elseif (isset($data['schedule_id'])) {
    $scheduleIds = [intval($data['schedule_id'])];
}

$scheduleIds = array_filter($scheduleIds, function ($id) {
    return $id > 0;
});

if (empty($scheduleIds)) {
    echo json_encode(['success' => false, 'message' => 'Debe indicar al menos un horario válido.']);
    exit;
}

$results = [];
$successCount = 0;
$failCount = 0;

try {
    foreach ($scheduleIds as $schedId) {
        $schedResult = ['id' => $schedId, 'success' => false, 'message' => ''];

        // 1. Check for EXACT duplicate
        $checkDup = $pdo->prepare("SELECT id_enrollment FROM enrollments WHERE student_id = ? AND course_id = ? AND schedule_id = ? AND status NOT IN ('Cancelado','Rechazado','Retirado')");
        $checkDup->execute([$data['student_id'], $data['course_id'], $schedId]);

        if ($checkDup->fetch()) {
            $schedResult['message'] = 'El estudiante ya está inscrito en este horario.';
            $results[] = $schedResult;
            $failCount++;
            continue;
        }

        // 2. Check for TIME CONFLICTS
        $conflict = checkScheduleConflict($pdo, (int) $data['student_id'], (int) $schedId);
        if ($conflict['conflict']) {
            $schedResult['message'] = $conflict['message'];
            $results[] = $schedResult;
            $failCount++;
            continue;
        }

        // 3. ENROLL (Sin límite de cupos)
        $stmt = $pdo->prepare("INSERT INTO enrollments (student_id, course_id, schedule_id, status) VALUES (?, ?, ?, 'Activo')");
        if ($stmt->execute([$data['student_id'], $data['course_id'], $schedId])) {
            $newEnrollmentId = $pdo->lastInsertId();

            // SYNC junction table
            $pdo->prepare("INSERT IGNORE INTO enrollment_schedules (enrollment_id, schedule_id) VALUES (?, ?)")
                ->execute([$newEnrollmentId, $schedId]);

            $schedResult['success'] = true;
            $schedResult['message'] = 'Inscrito exitosamente';
            $successCount++;
            
            // Auditoría
            logAudit($pdo, 'create', 'enrollment', $newEnrollmentId, [
                'student_id' => $data['student_id'],
                'course_id' => $data['course_id'],
                'schedule_id' => $schedId
            ]);
        } else {
            $schedResult['message'] = 'Error al insertar la inscripción.';
            $failCount++;
        }
        $results[] = $schedResult;
    }

    // Cleanup: remove Pre-inscrito entries
    if ($successCount > 0) {
        $cleanup = $pdo->prepare("DELETE FROM enrollments WHERE student_id = ? AND course_id = ? AND status = 'Pre-inscrito'");
        $cleanup->execute([$data['student_id'], $data['course_id']]);

        // Enviar Email
        try {
            require_once 'services/EmailService.php';
            $stmtStudent = $pdo->prepare("SELECT email, full_name FROM usuario WHERE id_usuario = ?");
            $stmtStudent->execute([$data['student_id']]);
            $student = $stmtStudent->fetch(PDO::FETCH_ASSOC);

            $stmtCourse = $pdo->prepare("SELECT course_name FROM courses WHERE id_course = ?");
            $stmtCourse->execute([$data['course_id']]);
            $course = $stmtCourse->fetch(PDO::FETCH_ASSOC);

            $placeholders = implode(',', array_fill(0, count($scheduleIds), '?'));
            $stmtSched = $pdo->prepare("SELECT day, time_start, time_end FROM schedules WHERE id_schedule IN ({$placeholders})");
            $stmtSched->execute($scheduleIds);
            $scheduleDetails = $stmtSched->fetchAll(PDO::FETCH_ASSOC);

            if ($student && $course && !empty($scheduleDetails)) {
                $emailService = new EmailService();
                $emailService->sendEnrollmentConfirmation($student['email'], $student['full_name'], $course['course_name'], $scheduleDetails);
            }
        } catch (Exception $emailErr) {
            error_log("Email error: " . $emailErr->getMessage());
        }
    }

    if ($successCount > 0) {
        echo json_encode(['success' => true, 'message' => "Inscrito en {$successCount} horario(s).", 'details' => $results]);
    } else {
        $failMsgs = array_map(fn($r) => $r['message'], array_filter($results, fn($r) => !$r['success']));
        echo json_encode(['success' => false, 'message' => implode(' | ', array_unique($failMsgs)), 'details' => $results]);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en base de datos: ' . $e->getMessage()]);
}
