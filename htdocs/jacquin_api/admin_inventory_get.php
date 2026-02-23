<?php
// admin_inventory_get.php
require_once 'config/env_loader.php';
require_once 'config/connection.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT * FROM inventario ORDER BY created_at DESC");
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($items);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>