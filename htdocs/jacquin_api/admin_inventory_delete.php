<?php
// admin_inventory_delete.php
require_once 'config/env_loader.php';
require_once 'config/connection.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id_item'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID requerido"]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM inventario WHERE id_item = ?");
    $stmt->execute([$data['id_item']]);
    echo json_encode(["success" => true, "message" => "Ítem eliminado"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>