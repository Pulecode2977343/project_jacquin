<?php
// get_schedule_details.php
require_once 'config/cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/config/connection.php';

try {
    $scheduleId = $_GET['schedule_id'] ?? null;
    if (!$scheduleId)
        throw new Exception("Schedule ID required");

    // Get Schedule Info
    $stmt = $pdo->prepare("
        SELECT s.day_of_week as day, s.start_time as time_start, s.end_time as time_end, s.quota, c.course_name as course_name
        FROM schedules s
        JOIN courses c ON s.id_course = c.id_course
        WHERE s.id_schedule = ?
    ");
    $stmt->execute([$scheduleId]);
    $schedule = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$schedule)
        throw new Exception("Schedule not found");

    // Get Students
    $stmtStudents = $pdo->prepare("
        SELECT u.id_usuario, u.full_name, u.email, u.phone, u.avatar_url, e.status as enrollment_status
        FROM enrollment_schedules es
        JOIN enrollments e ON es.enrollment_id = e.id_enrollment
        JOIN usuario u ON e.student_id = u.id_usuario
        WHERE es.schedule_id = ? AND e.status = 'active'
    ");
    $stmtStudents->execute([$scheduleId]);
    $students = $stmtStudents->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => [
            "schedule" => $schedule,
            "students" => $students
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>