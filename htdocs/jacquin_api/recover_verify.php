<?php
// recover_verify.php
ini_set('display_errors', 0);
header('Content-Type: application/json');

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido.');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';
    $code = $input['code'] ?? '';

    if (empty($email) || empty($code)) {
        throw new Exception('Faltan datos.');
    }

    // 1. Buscar usuario con ese email y código válido no expirado
    $sql = "SELECT id_usuario FROM usuario 
            WHERE email = ? 
            AND recovery_code = ? 
            AND recovery_expires > NOW()";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email, $code]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('Código incorrecto o expirado.');
    }

    echo json_encode(['success' => true, 'message' => 'Código verificado.']);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>