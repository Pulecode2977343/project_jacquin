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
            s.teacher_id,
            c.course_name,
            u.full_name as teacher_name
        FROM schedules s
        LEFT JOIN courses c ON s.course_id = c.id_course
        LEFT JOIN usuario u ON s.teacher_id = u.id_usuario
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