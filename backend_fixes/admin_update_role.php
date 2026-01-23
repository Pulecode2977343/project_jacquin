<?php
require_once '../config/cors.php';
require_once '../config/connection.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id_usuario']) || !isset($data['id_rol'])) {
        throw new Exception("Faltan parametros");
    }

    $sql = "UPDATE usuario SET id_rol = :id_rol WHERE id_usuario = :id_usuario";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id_rol' => $data['id_rol'],
        ':id_usuario' => $data['id_usuario']
    ]);

    echo json_encode(['success' => true, 'message' => 'Rol actualizado correctamente']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
