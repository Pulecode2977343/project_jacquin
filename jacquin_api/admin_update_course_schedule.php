<?php
include_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config/connection.php';
require_once 'helpers/auth_helper.php';
require_once 'helpers/audit_helper.php';

// Protegemos el endpoint: Solo administradores
validateAdmin();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->course_id) || !isset($data->day) || !isset($data->time_start) || !isset($data->time_end)) {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
    exit;
}

try {
    $quota = isset($data->quota) ? intval($data->quota) : 15;
    // Handle id_docente or id_usuario depending on what frontend sends
    $teacherId = !empty($data->id_docente) ? intval($data->id_docente) : ( !empty($data->id_usuario) ? intval($data->id_usuario) : null );

    if (isset($data->id_schedule) && $data->id_schedule > 0) {
        // UPDATE
        $stmt = $pdo->prepare("UPDATE schedules SET day = ?, time_start = ?, time_end = ?, quota = ?, teacher_id = ? WHERE id_schedule = ?");
        $stmt->execute([$data->day, $data->time_start, $data->time_end, $quota, $teacherId, $data->id_schedule]);

        // Sync with schedule_teachers junction table (Modern mapping)
        $pdo->prepare("DELETE FROM schedule_teachers WHERE id_schedule = ?")->execute([$data->id_schedule]);
        if ($teacherId) {
            $pdo->prepare("INSERT INTO schedule_teachers (id_schedule, id_teacher) VALUES (?, ?)")->execute([$data->id_schedule, $teacherId]);
        }

        // Audit Log
        logAudit($pdo, 'update', 'schedule', $data->id_schedule, [
            'course_id' => $data->course_id,
            'day' => $data->day,
            'time' => $data->time_start . ' - ' . $data->time_end,
            'quota' => $quota
        ]);

        echo json_encode(["success" => true, "message" => "Horario actualizado."]);
    } else {
        // INSERT
        $stmt = $pdo->prepare("INSERT INTO schedules (id_course, day, time_start, time_end, quota, teacher_id) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$data->course_id, $data->day, $data->time_start, $data->time_end, $quota, $teacherId]);
        $newId = $pdo->lastInsertId();

        if ($teacherId && $newId) {
            $pdo->prepare("INSERT INTO schedule_teachers (id_schedule, id_teacher) VALUES (?, ?)")->execute([$newId, $teacherId]);
        }

        // Audit Log
        logAudit($pdo, 'create', 'schedule', $newId, [
            'course_id' => $data->course_id,
            'day' => $data->day,
            'time' => $data->time_start . ' - ' . $data->time_end,
            'quota' => $quota
        ]);

        echo json_encode(["success" => true, "message" => "Nuevo horario creado."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>