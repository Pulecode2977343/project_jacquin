<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input['id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID y Datos requeridos"]);
    exit;
}

try {
    $sql = "UPDATE inventory SET 
            name = :name, 
            type = :type, 
            status = :status, 
            serial_number = :serial_number, 
            purchase_date = :purchase_date, 
            notes = :notes 
            WHERE id = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $input['id'],
        ':name' => $input['name'],
        ':type' => $input['type'],
        ':status' => $input['status'],
        ':serial_number' => $input['serial_number'] ?? null,
        ':purchase_date' => $input['purchase_date'] ?? null,
        ':notes' => $input['notes'] ?? null
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Item actualizado correctamente"]);
    } else {
        echo json_encode(["success" => false, "message" => "No se encontraron cambios o ID inválido"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>