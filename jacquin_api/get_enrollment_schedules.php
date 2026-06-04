<?php
/**
 * Get Schedules assigned to a specific Enrollment
 * 
 * GET /jacquin_api/get_enrollment_schedules.php?enrollment_id=15
 */

require_once 'config/cors.php';
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
            s.day_of_week,
            s.start_time as time_start,
            s.end_time as time_end,
            s.max_students as quota,
            COALESCE(
                (SELECT GROUP_CONCAT(u.full_name SEPARATOR ', ')
                 FROM schedule_teachers st
                 JOIN usuario u ON st.id_teacher = u.id_usuario
                 WHERE st.id_schedule = s.id_schedule),
                (SELECT u.full_name FROM usuario u WHERE u.id_usuario = c.teacher_id)
            ) as teacher_name,
            c.course_name
        FROM enrollment_schedules es
        JOIN schedules s ON es.schedule_id = s.id_schedule
        LEFT JOIN courses c ON s.course_id = c.id_course
        WHERE es.enrollment_id = ?
        ORDER BY 
            CASE s.day_of_week
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
            s.start_time ASC
    ");

    $stmt->execute([$enrollmentId]);
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $mapped = array_map(function($s) {
        $dayStr = mb_strtolower($s['day_of_week'], 'UTF-8');
        $dayIndex = 0;
        if (strpos($dayStr, 'lunes') !== false) $dayIndex = 1;
        elseif (strpos($dayStr, 'martes') !== false) $dayIndex = 2;
        elseif (strpos($dayStr, 'mi') !== false) $dayIndex = 3;
        elseif (strpos($dayStr, 'jueves') !== false) $dayIndex = 4;
        elseif (strpos($dayStr, 'viernes') !== false) $dayIndex = 5;
        elseif (strpos($dayStr, 's') !== false && strpos($dayStr, 'bado') !== false) $dayIndex = 6;
        elseif (strpos($dayStr, 'domingo') !== false) $dayIndex = 7;
        
        $s['day_index'] = $dayIndex;
        return $s;
    }, $schedules);

    echo json_encode([
        "success" => true,
        "data" => $mapped,
        "count" => count($mapped)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>