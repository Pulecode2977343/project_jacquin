<?php
require_once '../config/cors.php';
require_once '../config/connection.php';

header('Content-Type: application/json');

try {
    $sql = "SELECT id_usuario, full_name, email, id_rol FROM usuario ORDER BY id_usuario DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $users]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
