<?php
/**
 * Obtener detalles de un horario por ID
 */
require_once 'config/cors.php';
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';

$scheduleId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($scheduleId <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID de horario requerido']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            s.id_schedule,
            s.course_id,
            s.day_of_week,
            s.start_time,
            s.end_time,
            s.max_students as quota,
            c.course_name,
            (SELECT GROUP_CONCAT(u.full_name SEPARATOR ', ') 
             FROM schedule_teachers st 
             JOIN usuario u ON st.id_teacher = u.id_usuario 
             WHERE st.id_schedule = s.id_schedule) as teacher_name,
            (SELECT GROUP_CONCAT(st.id_teacher SEPARATOR ',') 
             FROM schedule_teachers st 
             WHERE st.id_schedule = s.id_schedule) as teacher_id
        FROM schedules s
        LEFT JOIN courses c ON s.course_id = c.id_course
        WHERE s.id_schedule = ?
    ");
    $stmt->execute([$scheduleId]);
    $schedule = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($schedule) {
        echo json_encode(['success' => true, 'data' => $schedule]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Horario no encontrado']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>