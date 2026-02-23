<?php
/**
 * Get Schedules assigned to a specific Enrollment
 * 
 * GET /jacquin_api/get_enrollment_schedules.php?enrollment_id=15
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';

$enrollmentId = isset($_GET['enrollment_id']) ? intval($_GET['enrollment_id']) : 0;

if ($enrollmentId <= 0) {
    echo json_encode(["success" => false, "message" => "enrollment_id es requerido."]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            es.schedule_id,
            s.day,
            s.time_start,
            s.time_end,
            s.quota,
            u.full_name as teacher_name,
            c.course_name
        FROM enrollment_schedules es
        JOIN schedules s ON es.schedule_id = s.id_schedule
        LEFT JOIN courses c ON s.id_course = c.id_course
        LEFT JOIN usuario u ON COALESCE(s.teacher_id, c.teacher_id) = u.id_usuario
        WHERE es.enrollment_id = ?
        ORDER BY 
            CASE s.day
                WHEN 'Lunes' THEN 1
                WHEN 'Martes' THEN 2
                WHEN 'Miércoles' THEN 3
                WHEN 'Miercoles' THEN 3
                WHEN 'Jueves' THEN 4
                WHEN 'Viernes' THEN 5
                WHEN 'Sábado' THEN 6
                WHEN 'Sabado' THEN 6
                WHEN 'Domingo' THEN 7
                ELSE 8
            END ASC,
            s.time_start ASC
    ");

    $stmt->execute([$enrollmentId]);
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $schedules,
        "count" => count($schedules)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>