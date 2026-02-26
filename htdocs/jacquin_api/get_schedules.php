<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';

$course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : 0;

try {
    if (!isset($pdo)) {
        throw new Exception("Error de conexión a BD code: 2");
    }

    if ($course_id > 0) {
        $stmt = $pdo->prepare("
            SELECT 
                s.*, 
                (SELECT GROUP_CONCAT(u.full_name SEPARATOR ', ') 
                 FROM schedule_teachers st 
                 JOIN usuario u ON st.teacher_id = u.id_usuario 
                 WHERE st.schedule_id = s.id_schedule) as teacher_name,
                (SELECT COUNT(*) FROM enrollment_schedules es WHERE es.schedule_id = s.id_schedule) as enrolled_count
            FROM schedules s
            WHERE s.id_course = ?
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
        $stmt->execute([$course_id]);
        $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $mapped = array_map(function ($s) {
            return [
                'id_schedule' => (int) $s['id_schedule'],
                'day' => $s['day'],
                'time_start' => $s['time_start'],
                'time_end' => $s['time_end'],
                'teacher_id' => $s['teacher_id'], // Legacy
                'teacher_name' => $s['teacher_name'] ? $s['teacher_name'] : 'Sin Asignar',
                'quota' => $s['quota'],
                'enrolled_count' => (int) $s['enrolled_count']
            ];
        }, $schedules);

        echo json_encode(["success" => true, "data" => $mapped]);
    } else {
        echo json_encode(["success" => false, "message" => "ID de curso requerido."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>