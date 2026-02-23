<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config/connection.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id_usuario) && !empty($data->currentPassword) && !empty($data->newPassword)) {
    try {
        // 1. Get current user
        $stmt = $pdo->prepare("SELECT password FROM usuario WHERE id_usuario = ?");
        $stmt->execute([$data->id_usuario]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($data->currentPassword, $user['password'])) {
            // 2. Hash new password
            $newHashed = password_hash($data->newPassword, PASSWORD_DEFAULT);
            $update = $pdo->prepare("UPDATE usuario SET password = ? WHERE id_usuario = ?");
            if ($update->execute([$newHashed, $data->id_usuario])) {
                echo json_encode(["success" => true, "message" => "Contraseña actualizada."]);
            } else {
                echo json_encode(["success" => false, "message" => "Error al actualizar."]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Contraseña actual incorrecta."]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
}
?>