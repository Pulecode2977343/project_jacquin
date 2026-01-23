<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input['id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID requerido"]);
    exit;
}

try {
    $sql = "DELETE FROM inventory WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $input['id']]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Item eliminado correctamente"]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Item no encontrado"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>