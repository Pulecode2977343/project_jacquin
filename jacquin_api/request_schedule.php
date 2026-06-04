<?php
// request_schedule.php
require_once 'config/cors.php';
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/config/connection.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Method not allowed");
    }

    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input) {
        $input = $_POST;
    }

    $studentId = $input['student_id'] ?? null;
    $courseId = $input['course_id'] ?? null;
    $day = $input['day'] ?? null;
    $time = $input['time'] ?? null;

    if (!$studentId || !$courseId || !$day || !$time) {
        throw new Exception("Missing required fields (student_id, course_id, day, time)");
    }

    // Validate if already exists a pending or approved request for same student, course, day, time
    $checkStmt = $pdo->prepare("SELECT id FROM schedule_requests WHERE student_id = ? AND course_id = ? AND requested_day = ? AND requested_time = ? AND (status = 'pending' OR status = 'approved')");
    $checkStmt->execute([$studentId, $courseId, $day, $time]);
    if ($checkStmt->fetch()) {
        throw new Exception("Ya tienes una solicitud pendiente o aprobada para este mismo día y hora en este curso.");
    }

    $stmt = $pdo->prepare("INSERT INTO schedule_requests (student_id, course_id, requested_day, requested_time, status) VALUES (?, ?, ?, ?, 'pending')");
    $stmt->execute([$studentId, $courseId, $day, $time]);

    echo json_encode(["success" => true, "message" => "Solicitud enviada correctamente. El administrador revisará tu horario."]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>