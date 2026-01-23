<?php
// admin_handle_schedule_request.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
require_once __DIR__ . '/config/connection.php';

try {
    $input = json_decode(file_get_contents("php://input"), true);
    $requestId = $input['request_id'] ?? null;
    $action = $input['action'] ?? null; // 'approve' or 'reject'
    $adminResponse = $input['response_text'] ?? '';

    if (!$requestId || !$action) {
        throw new Exception("Missing request_id or action");
    }

    $stmt = $pdo->prepare("SELECT * FROM schedule_requests WHERE id = ?");
    $stmt->execute([$requestId]);
    $request = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$request)
        throw new Exception("Request not found");

    if ($action === 'reject') {
        $update = $pdo->prepare("UPDATE schedule_requests SET status = 'rejected', admin_response = ? WHERE id = ?");
        $update->execute([$adminResponse, $requestId]);
        echo json_encode(["success" => true, "message" => "Solicitud rechazada"]);
        exit;
    }

    if ($action === 'approve') {
        // 1. Get Enrollment
        $enrStmt = $pdo->prepare("SELECT id_enrollment FROM enrollments WHERE student_id = ? AND course_id = ? AND status = 'active'");
        $enrStmt->execute([$request['student_id'], $request['course_id']]);
        $enrollment = $enrStmt->fetch(PDO::FETCH_ASSOC);

        if (!$enrollment) {
            throw new Exception("El estudiante no tiene una inscripción activa en este curso.");
        }

        // 2. Find Schedule (Exact match Day + Start Time + Course)
        // Note: Assuming duration is 1 hour or standard? We only have start time.
        // Let's assume 1 hour class for simplicity or just verify start time.
        // We'll check if a schedule exists for this course at this time.

        $schStmt = $pdo->prepare("SELECT id_schedule FROM schedules WHERE id_course = ? AND day = ? AND time_start = ?");
        $schStmt->execute([$request['course_id'], $request['requested_day'], $request['requested_time']]);
        $schedule = $schStmt->fetch(PDO::FETCH_ASSOC);

        $scheduleId = null;

        if ($schedule) {
            $scheduleId = $schedule['id_schedule'];
        } else {
            // Create New Schedule Slot
            // We need a default 'time_end'. Let's add 1 hour to requested_time
            $endTime = date('H:i:s', strtotime($request['requested_time']) + 3600);

            // Get teacher from course
            $cStmt = $pdo->prepare("SELECT teacher_id FROM courses WHERE id_course = ?");
            $cStmt->execute([$request['course_id']]);
            $course = $cStmt->fetch(PDO::FETCH_ASSOC);
            $teacherId = $course['teacher_id'] ?? null;

            $insSch = $pdo->prepare("INSERT INTO schedules (id_course, day, time_start, time_end, quota, teacher_id) VALUES (?, ?, ?, ?, 1, ?)");
            $insSch->execute([$request['course_id'], $request['requested_day'], $request['requested_time'], $endTime, $teacherId]);
            $scheduleId = $pdo->lastInsertId();
        }

        // 3. Assign to Enrollment (if not already assigned)
        $checkAssign = $pdo->prepare("SELECT id FROM enrollment_schedules WHERE enrollment_id = ? AND schedule_id = ?");
        $checkAssign->execute([$enrollment['id_enrollment'], $scheduleId]);

        if (!$checkAssign->fetch()) {
            $insAssign = $pdo->prepare("INSERT INTO enrollment_schedules (enrollment_id, schedule_id) VALUES (?, ?)");
            $insAssign->execute([$enrollment['id_enrollment'], $scheduleId]);
        }

        // 4. Update Request
        $update = $pdo->prepare("UPDATE schedule_requests SET status = 'approved', admin_response = ? WHERE id = ?");
        $update->execute([$adminResponse, $requestId]);

        echo json_encode(["success" => true, "message" => "Solicitud aprobada y horario asignado"]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>