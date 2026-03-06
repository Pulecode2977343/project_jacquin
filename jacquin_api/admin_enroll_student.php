<?php
/**
 * admin_enroll_student.php
 * Inscribe un estudiante directamente (Admin). Soporta uno o varios horarios.
 * Body: { "student_id": X, "course_id": Y, "schedule_id": Z }
 *    o: { "student_id": X, "course_id": Y, "schedule_ids": [Z1, Z2] }
 */
require_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';
require_once 'helpers/auth_helper.php';
require_once 'helpers/conflict_helper.php';

validateAdmin();

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['student_id'], $data['course_id'])) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos (student_id y course_id son requeridos).']);
    exit;
}

// Normalize to array of schedule IDs
$scheduleIds = [];
if (isset($data['schedule_ids']) && is_array($data['schedule_ids'])) {
    $scheduleIds = array_map('intval', $data['schedule_ids']);
} elseif (isset($data['schedule_id'])) {
    $scheduleIds = [intval($data['schedule_id'])];
}

// Validate that we have valid schedule IDs
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
    // 0. SELF-HEAL: Ensure schedule_id exists in enrollments
    $cols = $pdo->query("SHOW COLUMNS FROM enrollments LIKE 'schedule_id'")->fetchAll();
    if (count($cols) == 0) {
        $pdo->exec("ALTER TABLE enrollments ADD COLUMN schedule_id INT(11) NULL DEFAULT NULL");
    }

    foreach ($scheduleIds as $schedId) {
        $schedResult = ['id' => $schedId, 'success' => false, 'message' => ''];

        // 1. Check for EXACT duplicate (Same Course AND Same Schedule)
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

        // 3. CHECK CAPACITY
        $stmtCount = $pdo->prepare("SELECT COUNT(*) as total FROM enrollments WHERE schedule_id = ? AND status = 'Activo'");
        $stmtCount->execute([$schedId]);
        $count = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];

        if ($count >= 15) {
            $schedResult['message'] = 'Cupo lleno para este horario.';
            $results[] = $schedResult;
            $failCount++;
            continue;
        }

        // 4. ENROLL
        $stmt = $pdo->prepare("INSERT INTO enrollments (student_id, course_id, schedule_id, status) VALUES (?, ?, ?, 'Activo')");
        if ($stmt->execute([$data['student_id'], $data['course_id'], $schedId])) {
            $newEnrollmentId = $pdo->lastInsertId();

            // SYNC: Also insert into enrollment_schedules junction table
            $stmtSync = $pdo->prepare("INSERT IGNORE INTO enrollment_schedules (enrollment_id, schedule_id) VALUES (?, ?)");
            $stmtSync->execute([$newEnrollmentId, $schedId]);

            $schedResult['success'] = true;
            $schedResult['message'] = 'Inscrito exitosamente';
            $successCount++;
        } else {
            $schedResult['message'] = 'Error al insertar la inscripción.';
            $failCount++;
        }
        $results[] = $schedResult;
    }

    // Cleanup: remove Pre-inscrito entries if we enrolled successfully
    if ($successCount > 0) {
        $cleanup = $pdo->prepare("DELETE FROM enrollments WHERE student_id = ? AND course_id = ? AND status = 'Pre-inscrito'");
        $cleanup->execute([$data['student_id'], $data['course_id']]);

        // ── SINGLE EMAIL: gather successful schedule IDs and send ONE notification ──
        $enrolledScheduleIds = array_map(
            fn($r) => $r['id'],
            array_filter($results, fn($r) => $r['success'])
        );

        if (!empty($enrolledScheduleIds)) {
            try {
                require_once 'services/EmailService.php';

                // Fetch student info
                $stmtStudent = $pdo->prepare("SELECT email, full_name FROM usuario WHERE id_usuario = ?");
                $stmtStudent->execute([$data['student_id']]);
                $student = $stmtStudent->fetch(PDO::FETCH_ASSOC);

                // Fetch course name
                $stmtCourse = $pdo->prepare("SELECT course_name FROM courses WHERE id_course = ?");
                $stmtCourse->execute([$data['course_id']]);
                $course = $stmtCourse->fetch(PDO::FETCH_ASSOC);

                // Fetch schedule details for each enrolled schedule
                $placeholders = implode(',', array_fill(0, count($enrolledScheduleIds), '?'));
                $stmtSched = $pdo->prepare(
                    "SELECT day, time_start, time_end FROM schedules WHERE id_schedule IN ({$placeholders})
                     ORDER BY FIELD(day,'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'), time_start"
                );
                $stmtSched->execute($enrolledScheduleIds);
                $scheduleDetails = $stmtSched->fetchAll(PDO::FETCH_ASSOC);

                if ($student && $course && !empty($scheduleDetails)) {
                    $emailService = new EmailService();
                    $emailService->sendEnrollmentConfirmation(
                        $student['email'],
                        $student['full_name'],
                        $course['course_name'],
                        $scheduleDetails
                    );
                }
            } catch (Exception $emailErr) {
                // Email failure should NOT block the enrollment response
                error_log("Email error in admin_enroll_student: " . $emailErr->getMessage());
            }
        }
    }

    if ($successCount > 0) {
        $msg = "Inscrito en {$successCount} horario(s).";
        if ($failCount > 0) {
            $failMsgs = array_map(fn($r) => $r['message'], array_filter($results, fn($r) => !$r['success']));
            $msg .= " ({$failCount} no procesado(s): " . implode('; ', array_unique($failMsgs)) . ")";
        }
        echo json_encode(['success' => true, 'message' => $msg, 'details' => $results]);
    } else {
        $failMsgs = array_map(fn($r) => $r['message'], array_filter($results, fn($r) => !$r['success']));
        $uniqueMsgs = array_unique($failMsgs);
        echo json_encode([
            'success' => false,
            'message' => count($uniqueMsgs) > 0 ? implode(' | ', $uniqueMsgs) : 'No se pudo inscribir en ningún horario.',
            'details' => $results
        ]);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en base de datos: ' . $e->getMessage()]);
}
?>
