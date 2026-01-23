<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos inválidos"]);
    exit;
}

try {
    $sql = "INSERT INTO inventory (name, type, status, serial_number, purchase_date, notes) 
            VALUES (:name, :type, :status, :serial_number, :purchase_date, :notes)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':name' => $input['name'],
        ':type' => $input['type'],
        ':status' => $input['status'] ?? 'Bueno',
        ':serial_number' => $input['serial_number'] ?? null,
        ':purchase_date' => $input['purchase_date'] ?? null,
        ':notes' => $input['notes'] ?? null
    ]);

    echo json_encode(["success" => true, "message" => "Item registrado exitosamente", "id" => $pdo->lastInsertId()]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>