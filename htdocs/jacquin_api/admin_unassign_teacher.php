<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
// Created: 2026-01-20 - Unassign teacher from all schedules of a course

include_once 'config/connection.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->course_id) || !isset($data->teacher_id)) {
    echo json_encode(["success" => false, "message" => "Datos incompletos (course_id, teacher_id)."]);
    exit;
}

try {
    // 1. Verify teacher exists
    $stmtUser = $pdo->prepare("SELECT full_name FROM usuario WHERE id_usuario = ?");
    $stmtUser->execute([$data->teacher_id]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "Docente no encontrado."]);
        exit;
    }

    // 2. Get course name for response message
    $stmtCourse = $pdo->prepare("SELECT course_name FROM courses WHERE id_course = ?");
    $stmtCourse->execute([$data->course_id]);
    $course = $stmtCourse->fetch(PDO::FETCH_ASSOC);

    if (!$course) {
        echo json_encode(["success" => false, "message" => "Curso no encontrado."]);
        exit;
    }

    // 3. Unassign teacher from all schedules of this course
    $stmt = $pdo->prepare("UPDATE schedules SET teacher_id = NULL WHERE id_course = ? AND teacher_id = ?");
    $result = $stmt->execute([$data->course_id, $data->teacher_id]);
    
    if ($result) {
        $affectedRows = $stmt->rowCount();
        if ($affectedRows > 0) {
            echo json_encode([
                "success" => true, 
                "message" => "Docente {$user['full_name']} desasignado de {$course['course_name']} ({$affectedRows} horario(s))."
            ]);
        } else {
            echo json_encode([
                "success" => false, 
                "message" => "El docente no estaba asignado a ningún horario de este curso."
            ]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "No se pudo actualizar."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>
