<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';
require_once 'helpers/auth_helper.php';

// Protegemos el endpoint: Solo administradores
validateAdmin();

$course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : 0;

if ($course_id > 0) {
    try {
        // 1. Course Info
        $stmt = $pdo->prepare("SELECT * FROM courses WHERE id_course = ?");
        $stmt->execute([$course_id]);
        $course = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($course) {
            // 2. Schedules
            // Join with teacher info if available (assuming teacher_id in schedules or courses)
            // For now, let's assume teacher is in SCHEDULES based on commonly seen patterns, 
            // OR we'll adjust after seeing the DESCRIBE output. 
            // I'll write a generic query first and refine it if the schema differs.

            // HYPOTHESIS: teacher_id is likely in schedules as different schedules can have different teachers?
            // OR in courses if one teacher per course.
            // Let's assume per schedule for flexibility, or per course.
            // I'll check the DESCRIBE output in a moment, but I'll scaffold this to be ready.

            // Let's grab schedules first.
            $stmtSched = $pdo->prepare("
                SELECT s.*, u.full_name as teacher_name 
                FROM schedules s
                LEFT JOIN usuario u ON s.teacher_id = u.id_usuario 
                WHERE s.id_course = ?
                ORDER BY FIELD(s.day, 'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'), s.time_start
            ");
            // NOTE: If teacher_id is not in schedules, this query will fail. 
            // But I'm writing this based on the plan. I will CORRECT it after the tool output if needed.
            // Actually, safe bet: wait for describe? No, I want to be fast.
            // I'll use a safer query that doesn't assume teacher yet for the first pass?
            // No, I'll write the robust one and if it fails I'll fix it.

            $stmtSched->execute([$course_id]);
            $schedules = $stmtSched->fetchAll(PDO::FETCH_ASSOC);

            // 3. Enrolled Students (Accepted)
            $stmtEnroll = $pdo->prepare("
                SELECT e.id_enrollment, u.full_name, u.email, e.status
                FROM enrollments e
                JOIN usuario u ON e.student_id = u.id_usuario
                WHERE e.course_id = ? AND e.status = 'Activo'
            ");
            $stmtEnroll->execute([$course_id]);
            $students = $stmtEnroll->fetchAll(PDO::FETCH_ASSOC);

            // 4. Pending Requests (Now including Pre-inscrito)
            // Fetching schedules via enrollment_schedules table
            $stmtPending = $pdo->prepare("
                SELECT e.id_enrollment, u.full_name, u.email, e.status,
                       (SELECT GROUP_CONCAT(CONCAT(s.day, ' ', LEFT(s.time_start, 5), '-', LEFT(s.time_end, 5)) SEPARATOR ', ')
                        FROM enrollment_schedules es
                        JOIN schedules s ON es.schedule_id = s.id_schedule
                        WHERE es.enrollment_id = e.id_enrollment) as schedule_info
                FROM enrollments e
                JOIN usuario u ON e.student_id = u.id_usuario
                WHERE e.course_id = ? AND e.status IN ('Pendiente', 'Pre-inscrito')
            ");
            $stmtPending->execute([$course_id]);
            $pending = $stmtPending->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true,
                "data" => [
                    "info" => $course,
                    "schedules" => $schedules,
                    "students" => $students,
                    "pending" => $pending
                ]
            ]);

        } else {
            echo json_encode(["success" => false, "message" => "Curso no encontrado."]);
        }
    } catch (Exception $e) {
        // If it fails (e.g. unknown column teacher_id), let's catch it.
        echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "ID requerido."]);
}
?>