<?php
// recover_request.php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
header('Content-Type: application/json');

try {
    require_once __DIR__ . '/config/cors.php';
    require_once __DIR__ . '/config/connection.php';
    // Load env first if needed, though usually connection handles it. 
    // If connection.php depends on env_loader, it should be included there or before.
    // Assuming independent loaders for now.
    if (file_exists(__DIR__ . '/config/env_loader.php')) {
        require_once __DIR__ . '/config/env_loader.php';
    }
    require_once __DIR__ . '/services/EmailService.php';

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido.');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';

    if (empty($email)) {
        throw new Exception('El correo es obligatorio.');
    }

    // 1. Verificar si el usuario existe
    $stmt = $pdo->prepare("SELECT id_usuario, full_name FROM usuario WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        // Por seguridad, no decimos si el email existe o no, pero simulamos éxito
        // Opcional: throw Exception('Email no registrado') si la política es laxa.
        // Haremos politica laxa para mejor UX en este proyecto.
        throw new Exception('No encontramos una cuenta con ese correo.');
    }

    // 2. Generar Código (6 dígitos)
    $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    $expires = date('Y-m-d H:i:s', strtotime('+15 minutes'));

    // 3. Guardar en BD
    $update = $pdo->prepare("UPDATE usuario SET recovery_code = ?, recovery_expires = ? WHERE id_usuario = ?");
    $update->execute([$code, $expires, $user['id_usuario']]);

    // 4. Enviar Correo
    $emailService = new EmailService();
    // sendRecoveryCode ahora lanza excepción si falla, no devuelve booleano false silencioso
    $emailService->sendRecoveryCode($email, $user['full_name'], $code);

    echo json_encode(['success' => true, 'message' => 'Código enviado. Revisa tu correo.']);

} catch (Exception $e) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>