<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/connection.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->course_id) || !isset($data->day) || !isset($data->start_time) || !isset($data->end_time)) {
        throw new Exception("Datos incompletos para el horario public.");
    }

    // Optional: teacher_id (if not provided, remains NULL)
    $teacherId = isset($data->teacher_id) && !empty($data->teacher_id) ? $data->teacher_id : null;

    // === VALIDATION LOGIC ===
    $start = new DateTime($data->start_time);
    $end = new DateTime($data->end_time);
    $day = $data->day;

    // Basic logic: start < end
    if ($start >= $end) {
        throw new Exception("La hora de inicio debe ser antes de la hora de fin.");
    }

    // Insert Schedule - USING CORRECT COLUMNS: id_course, day, time_start, time_end
    $sql = "INSERT INTO schedules (id_course, day, time_start, time_end, teacher_id) 
            VALUES (:cid, :day, :start, :end, :tid)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':cid' => $data->course_id,
        ':day' => $data->day,
        ':start' => $data->start_time, // The INPUT json still uses start_time from frontend, but we map to time_start column
        ':end' => $data->end_time,
        ':tid' => $teacherId
    ]);

    echo json_encode(['success' => true, 'message' => 'Horario asignado correctamente']);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>