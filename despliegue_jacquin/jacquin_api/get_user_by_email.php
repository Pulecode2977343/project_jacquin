<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'config/connection.php';

$email = isset($_GET['email']) ? trim($_GET['email']) : '';

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Email requerido']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id_usuario, full_name, email, id_rol, avatar_url FROM usuario WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error DB: ' . $e->getMessage()]);
}
?>