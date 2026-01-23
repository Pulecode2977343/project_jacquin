<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';

try {
    // Role 2 = Docente
    $stmt = $pdo->prepare("SELECT id_usuario, full_name, avatar_url FROM usuario WHERE id_rol = 2 ORDER BY full_name ASC");
    $stmt->execute();
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $teachers]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>