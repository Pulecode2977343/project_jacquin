<?php
require_once 'config/cors.php';
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';
require_once __DIR__ . '/helpers/session_helper.php';
startSecureSession();

// Helper to normalize corrupted ENUM day names
function normalizeDayName($raw) {
    if (!$raw) return $raw;
    $lower = mb_strtolower($raw, 'UTF-8');
    if (strpos($lower, 'lu') === 0) return 'Lunes';
    if (strpos($lower, 'ma') === 0) return 'Martes';
    if (strpos($lower, 'mi') === 0) return 'Miércoles';
    if (strpos($lower, 'ju') === 0) return 'Jueves';
    if (strpos($lower, 'vi') === 0) return 'Viernes';
    if (strpos($lower, 's') === 0) return 'Sábado';
    if (strpos($lower, 'do') === 0) return 'Domingo';
    return $raw;
}

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
                FIELD(s.day_of_week, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo') as day_index,
                (SELECT GROUP_CONCAT(u.full_name SEPARATOR ', ') 
                 FROM schedule_teachers st 
                 JOIN usuario u ON st.id_teacher = u.id_usuario 
                 WHERE st.id_schedule = s.id_schedule) as teacher_name,
                (SELECT COUNT(*) FROM enrollment_schedules es WHERE es.schedule_id = s.id_schedule) as enrolled_count
            FROM schedules s
            WHERE s.course_id = ?
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
        $stmt->execute([$course_id]);
        $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $mapped = array_map(function ($s) use ($canSeeEnrolled) {
            $dayStr = mb_strtolower($s['day_of_week'], 'UTF-8');
            $dayIndex = (int) $s['day_index'];
            if ($dayIndex === 0) {
                if (strpos($dayStr, 'lunes') !== false) $dayIndex = 1;
                elseif (strpos($dayStr, 'martes') !== false) $dayIndex = 2;
                elseif (strpos($dayStr, 'mi') !== false) $dayIndex = 3;
                elseif (strpos($dayStr, 'jueves') !== false) $dayIndex = 4;
                elseif (strpos($dayStr, 'viernes') !== false) $dayIndex = 5;
                elseif (strpos($dayStr, 's') !== false && strpos($dayStr, 'bado') !== false) $dayIndex = 6;
                elseif (strpos($dayStr, 'domingo') !== false) $dayIndex = 7;
            }
            return [
                'id_schedule' => (int) $s['id_schedule'],
                'day' => normalizeDayName($s['day_of_week']),
                'day_index' => $dayIndex,
                'time_start' => $s['start_time'],
                'time_end' => $s['end_time'],
                'teacher_id' => $s['teacher_id'], // Legacy
                'teacher_name' => $s['teacher_name'] ? $s['teacher_name'] : 'Sin Asignar',
                'quota' => $canSeeEnrolled ? (int)$s['max_students'] : 0, 
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