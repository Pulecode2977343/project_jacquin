<?php
require_once '../config/cors.php';
require_once '../config/connection.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id_usuario'])) {
        throw new Exception("Falta el ID del usuario");
    }

    // Prevent deleting yourself or the main admin (id 1)
    if ($data['id_usuario'] == 1) {
        throw new Exception("No se puede eliminar al administrador principal");
    }

    $sql = "DELETE FROM usuario WHERE id_usuario = :id_usuario";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id_usuario' => $data['id_usuario']]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Usuario eliminado correctamente']);
    } else {
        throw new Exception("Usuario no encontrado");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
