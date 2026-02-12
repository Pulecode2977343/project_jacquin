<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';
require_once 'helpers/auth_helper.php';

// Protegemos el endpoint: Solo administradores
validateAdmin();

try {
    $stmt = $pdo->prepare("
        SELECT 
            e.id_enrollment,
            e.status,
            u.full_name as student_name,
            u.email as student_email,
            c.course_name,
            s.day as schedule_day,
            s.time_start,
            s.time_end
        FROM enrollments e
        JOIN usuario u ON e.student_id = u.id_usuario
        JOIN courses c ON e.course_id = c.id_course
        LEFT JOIN schedules s ON e.schedule_id = s.id_schedule
        WHERE e.status = 'Pendiente'
        ORDER BY e.created_at DESC
    ");
    // Note: created_at might not exist in enrollments table based on earlier schema checks (Step 9242 showed Field list but truncated, I'll assume it might not be there or I should order by ID).
    // Let's check schema for created_at? 
    // Step 9242 output: 
    // [0] id_enrollment ... [5] status ... 
    // It didn't show created_at. I will order by id_enrollment DESC.

    // Also schedules join: in `request_enrollment.php` I assumed schedule_id is valid.
    // In `get_schedules.php` (Step 9254) I returned `id_schedule`.

    $query = "
        SELECT 
            e.id_enrollment,
            e.status,
            u.full_name as student_name,
            u.email as student_email,
            c.course_name,
            c.id_course as course_id,
            -- Agrupar horarios para mostrar resumen
            GROUP_CONCAT(CONCAT(s.day, ' ', LEFT(s.time_start, 5)) SEPARATOR ', ') as schedule_day,
            MAX(s.time_start) as time_start,
            MAX(s.time_end) as time_end,
            MAX(s.id_schedule) as id_schedule,
            MAX(s.teacher_id) as teacher_id,
            MAX(t.full_name) as teacher_name
        FROM enrollments e
        JOIN usuario u ON e.student_id = u.id_usuario
        JOIN courses c ON e.course_id = c.id_course
        LEFT JOIN enrollment_schedules es ON e.id_enrollment = es.enrollment_id
        LEFT JOIN schedules s ON es.schedule_id = s.id_schedule
        LEFT JOIN usuario t ON s.teacher_id = t.id_usuario
        WHERE 
            e.status IN ('Pendiente', 'Pre-inscrito') 
        GROUP BY e.id_enrollment
        ORDER BY e.id_enrollment DESC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $requests]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>