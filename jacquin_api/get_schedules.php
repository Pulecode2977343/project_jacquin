<?php
require_once 'config/cors.php';
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';
session_start();

// Determinar si el usuario tiene permiso para ver el conteo de inscritos
// Roles permitidos: 1 (Admin), 2 (Docente)
// Cargos permitidos: 2 (Secretario/Recepcionista) en $_SESSION['positions']
$canSeeEnrolled = false;
if (isset($_SESSION['user_id'])) {
    $role = (int)($_SESSION['id_rol'] ?? 0);
    $positions = $_SESSION['positions'] ?? [];
    if (!is_array($positions)) $positions = [];
    
    if ($role === 1 || $role === 2 || in_array(2, $positions) || in_array('2', $positions)) {
        $canSeeEnrolled = true;
    }
}

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
                 JOIN usuario u ON st.id_teacher = u.id_usuario 
                 WHERE st.id_schedule = s.id_schedule) as teacher_name,
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

        $mapped = array_map(function ($s) use ($canSeeEnrolled) {
            return [
                'id_schedule' => (int) $s['id_schedule'],
                'day' => $s['day'],
                'time_start' => $s['time_start'],
                'time_end' => $s['time_end'],
                'teacher_id' => $s['teacher_id'], // Legacy
                'teacher_name' => $s['teacher_name'] ? $s['teacher_name'] : 'Sin Asignar',
                'quota' => $canSeeEnrolled ? (int)$s['quota'] : 0, 
                'enrolled_count' => $canSeeEnrolled ? (int) $s['enrolled_count'] : 0
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