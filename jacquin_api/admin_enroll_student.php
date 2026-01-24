<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';
require_once __DIR__ . '/helpers/conflict_helper.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['student_id']) || !isset($data['course_id']) || (!isset($data['schedule_id']) && !isset($data['schedule_ids']))) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos (ID, Curso, Horario)']);
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
    echo json_encode(['success' => false, 'message' => 'ID de horario inválido o no proporcionado', 'received_data' => $data]);
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

        // 1. Check for 'Pre-inscrito' slot to reuse (specific to this schedule?? 
        // Logic change: Pre-enrollment usually allows ANY schedule. If we find a pre-enrollment without schedule or with different, handling is complex.
        // Simplified: Check if there is a pre-enrollment for this course AND this student.
        // If found, update it for the FIRST successful schedule, then insert new rows for others?
        // Or just Insert new rows and ignore pre-enrollment cleanup?
        // Better: Try to match exact schedule first, or just Insert.

        // REVISED LOGIC FOR MULTI: Just insert/check duplicates.
        // 1. Check for EXACT duplicate (Same Course AND Same Schedule)
        $checkDup = $pdo->prepare("SELECT id_enrollment FROM enrollments WHERE student_id = ? AND course_id = ? AND schedule_id = ? AND status != 'Cancelado' AND status != 'Rechazado' AND status != 'Retirado'");
        $checkDup->execute([$data['student_id'], $data['course_id'], $schedId]);

        if ($checkDup->fetch()) {
            $schedResult['message'] = 'Ya inscrito en este horario';
            $results[] = $schedResult;
            $failCount++;
            continue;
        }

        // 1b. Check for TIME CONFLICTS (Overlapping schedules)
        $conflict = checkScheduleConflict($pdo, (int) $data['student_id'], (int) $schedId);
        if ($conflict['conflict']) {
            $schedResult['message'] = $conflict['message'];
            $results[] = $schedResult;
            $failCount++;
            continue;
        }

        // 2. CHECK CAPACITY (Aforo = 15)
        $stmtCount = $pdo->prepare("SELECT COUNT(*) as total FROM enrollments WHERE schedule_id = ? AND status = 'Activo'");
        $stmtCount->execute([$schedId]);
        $count = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];

        if ($count >= 15) {
            $schedResult['message'] = 'Cupo lleno';
            $results[] = $schedResult;
            $failCount++;
            continue;
        }

        // 3. ENROLL (New Record)
        // Check if there is a generic "Pre-inscrito" (null schedule) to consume?
        // For simplicity in multi-select, we will just INSERT new active records.
        // If there was a single "Pre-inscrito", it might remain. We can clean it up later or leave it.
        // Let's try to update a "Pre-inscrito" record IF it exists and has NO schedule_id, but only once.

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
            $schedResult['message'] = 'Error al insertar';
            $failCount++;
        }
        $results[] = $schedResult;
    }

    // Attempt to clean up any "Pre-inscrito" entries for this user/course if we successfully enrolled at least once
    if ($successCount > 0) {
        $cleanup = $pdo->prepare("DELETE FROM enrollments WHERE student_id = ? AND course_id = ? AND status = 'Pre-inscrito'");
        $cleanup->execute([$data['student_id'], $data['course_id']]);
    }

    if ($successCount > 0) {
        echo json_encode(['success' => true, 'message' => "Inscrito en $successCount horario(s)." . ($failCount > 0 ? " ($failCount fallidos)" : ""), 'details' => $results]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se pudo inscribir en ningún horario.', 'details' => $results]);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error SQL: ' . $e->getMessage()]);
}
?>