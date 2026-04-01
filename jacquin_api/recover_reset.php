<?php
// recover_reset.php
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
    $newPassword = $input['new_password'] ?? '';

    if (empty($email) || empty($code) || empty($newPassword)) {
        throw new Exception('Faltan datos.');
    }

    // 1. Validar Usuario y Código nuevamente (Seguridad doble)
    $sql = "SELECT id_usuario FROM usuario 
            WHERE email = ? 
            AND recovery_code = ? 
            AND recovery_expires > NOW()";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email, $code]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('Sesión expirada o código inválido.');
    }

    // 2. Hash Password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // 3. Actualizar Password y Limpiar Código + Seguridad
    $update = $pdo->prepare("UPDATE usuario SET password = ?, recovery_code = NULL, recovery_expires = NULL, force_password_reset = 0, login_attempts = 0, locked_until = NULL WHERE id_usuario = ?");
    $update->execute([$hashedPassword, $user['id_usuario']]);

    echo json_encode(['success' => true, 'message' => 'Contraseña actualizada correctamente.']);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>