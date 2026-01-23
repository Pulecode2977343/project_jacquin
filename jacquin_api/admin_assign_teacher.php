<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
// Last Updated: 2026-01-06 (Fix for id_course column)

include_once 'config/connection.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->schedule_id) || !isset($data->teacher_id)) {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
    exit;
}

try {
    // Verify teacher exists and has role 2 (Docente)
    $stmtUser = $pdo->prepare("SELECT id_rol FROM usuario WHERE id_usuario = ?");
    $stmtUser->execute([$data->teacher_id]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$user || $user['id_rol'] != 2) {
        echo json_encode(["success" => false, "message" => "El usuario seleccionado no es un Docente."]);
        exit;
    }

    // 1. Get details of the target schedule
    // FIX: Use correct columns: time_start, time_end, and id_course
    $stmtTarget = $pdo->prepare("SELECT day, time_start, time_end, course_name FROM schedules s JOIN courses c ON s.id_course = c.id_course WHERE id_schedule = ?");
    $stmtTarget->execute([$data->schedule_id]);
    $targetSchedule = $stmtTarget->fetch(PDO::FETCH_ASSOC);

    if (!$targetSchedule) {
        echo json_encode(["success" => false, "message" => "Horario no encontrado."]);
        exit;
    }

    // 2. Check for conflicts
    // Check if this teacher is assigned to ANY schedule on the same day
    // and overlapping times.
    // Overlap logic: (StartA < EndB) and (EndA > StartB)

    // FIX: Use correct columns: time_start, time_end, id_course
    $query = "
        SELECT c.course_name 
        FROM schedules s 
        JOIN courses c ON s.id_course = c.id_course
        WHERE s.teacher_id = :tid 
        AND s.day = :day 
        AND s.id_schedule != :sid
        AND (
            (s.time_start < :end_time AND s.time_end > :start_time)
        )
    ";

    // DEBUG LOG
    // For debugging, we write to a local file since we can't easily see php_error_log
    file_put_contents('debug_assign.txt', "DEBUG CHECK CONFLICT: TID={$data->teacher_id} DAY={$targetSchedule['day']} START={$targetSchedule['time_start']} END={$targetSchedule['time_end']} SID={$data->schedule_id}\n", FILE_APPEND);

    /* 
    $stmtConflict = $pdo->prepare($query);
    $stmtConflict->execute([
        ':tid' => $data->teacher_id,
        ':day' => $targetSchedule['day'],
        ':sid' => $data->schedule_id,
        ':start_time' => $targetSchedule['time_start'],
        ':end_time' => $targetSchedule['time_end']
    ]);

    $conflict = $stmtConflict->fetch(PDO::FETCH_ASSOC);

    if ($conflict) {
        echo json_encode([
            "success" => false,
            "message" => "Conflicto de Horario: El docente ya está dictando '{$conflict['course_name']}' en esta misma franja horaria."
        ]);
        exit;
    }
    */

    $stmt = $pdo->prepare("UPDATE schedules SET teacher_id = ? WHERE id_schedule = ?");
    if ($stmt->execute([$data->teacher_id, $data->schedule_id])) {
        echo json_encode(["success" => true, "message" => "Profesor asignado correctamente."]);
    } else {
        echo json_encode(["success" => false, "message" => "No se pudo actualizar."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>