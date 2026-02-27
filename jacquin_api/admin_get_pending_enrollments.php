<?php
include_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';
require_once 'helpers/auth_helper.php';

// Protegemos el endpoint: Solo administradores
validateAdmin();

try {
    // Query principal para obtener inscripciones pendientes con detalles agrupados

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
            MAX(st.id_teacher) as teacher_id,
            MAX(t.full_name) as teacher_name
        FROM enrollments e
        JOIN usuario u ON e.student_id = u.id_usuario
        JOIN courses c ON e.course_id = c.id_course
        LEFT JOIN enrollment_schedules es ON e.id_enrollment = es.enrollment_id
        LEFT JOIN schedules s ON es.schedule_id = s.id_schedule
        LEFT JOIN schedule_teachers st ON s.id_schedule = st.id_schedule
        LEFT JOIN usuario t ON st.id_teacher = t.id_usuario
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