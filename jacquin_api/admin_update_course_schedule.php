<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config/connection.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->course_id) || !isset($data->day) || !isset($data->time_start) || !isset($data->time_end)) {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
    exit;
}

try {
    if (isset($data->id_schedule) && $data->id_schedule > 0) {
        // UPDATE
        $stmt = $pdo->prepare("UPDATE schedules SET day = ?, time_start = ?, time_end = ? WHERE id_schedule = ?");
        $stmt->execute([$data->day, $data->time_start, $data->time_end, $data->id_schedule]);
        echo json_encode(["success" => true, "message" => "Horario actualizado."]);
    } else {
        // INSERT
        // Note: Default capacity is 15 based on previous scripts.
        $stmt = $pdo->prepare("INSERT INTO schedules (id_course, day, time_start, time_end, capacity, enrolled_count) VALUES (?, ?, ?, ?, 15, 0)");
        $stmt->execute([$data->course_id, $data->day, $data->time_start, $data->time_end]);
        echo json_encode(["success" => true, "message" => "Nuevo horario creado."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>