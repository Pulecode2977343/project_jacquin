<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once __DIR__ . '/config/connection.php';
require_once __DIR__ . '/helpers/auth_helper.php';

// Protegemos el endpoint: Solo administradores
validateAdmin();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id_course) && !empty($data->course_name)) {
    try {
        $stmt = $pdo->prepare("
            UPDATE courses 
            SET course_name = ?, 
                description = ?, 
                price = ? 
            WHERE id_course = ?
        ");

        if ($stmt->execute([
            $data->course_name, 
            $data->description ?? "", 
            $data->price ?? 0, 
            $data->id_course
        ])) {
            echo json_encode(["success" => true, "message" => "Curso actualizado correctamente."]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al actualizar el curso."]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
}
?>
