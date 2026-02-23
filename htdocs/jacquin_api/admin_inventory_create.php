<?php
// admin_inventory_create.php
require_once 'config/env_loader.php';
require_once 'config/connection.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['nombre']) || !isset($data['tipo'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Nombre y Tipo son obligatorios"]);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO inventario (nombre, tipo, serial, estado, fecha_adquisicion, descripcion) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['nombre'],
        $data['tipo'],
        $data['serial'] ?? '',
        $data['estado'] ?? 'Bueno',
        $data['fecha_adquisicion'] ?? null,
        $data['descripcion'] ?? ''
    ]);

    echo json_encode(["success" => true, "message" => "Ítem creado"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>