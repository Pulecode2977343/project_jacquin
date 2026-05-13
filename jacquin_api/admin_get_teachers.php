<?php
include_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';

try {
    // Role 1=Admin, 2=SubAdmin, 3=Profesor, 6=Secretaria
    $stmt = $pdo->prepare("SELECT id_usuario, full_name, avatar_url FROM usuario WHERE id_rol IN (1, 2, 3, 6) ORDER BY full_name ASC");
    $stmt->execute();
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $teachers]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>