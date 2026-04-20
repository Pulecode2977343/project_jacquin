<?php
// login.php - Iniciar Sesión en JACQUIN
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
header('Content-Type: application/json');

try {
    require_once __DIR__ . '/config/cors.php';
    require_once __DIR__ . '/config/connection.php';
    require_once __DIR__ . '/helpers/session_helper.php';


    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido. Use POST.');
    }

    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($email) || empty($password)) {
        throw new Exception('Por favor ingrese correo y contraseña.');
    }

    $stmt = $pdo->prepare("SELECT id_usuario, full_name, email, password, id_rol, avatar_url, n_phone, address, login_attempts, locked_until, force_password_reset FROM usuario WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('Credenciales incorrectas.');
    }

    // 1. Bloqueo temporal
    if ($user['locked_until']) {
        $lockedTime = strtotime($user['locked_until']);
        $now = time();
        if ($lockedTime > $now) {
            $minutesLeft = ceil(($lockedTime - $now) / 60);
            throw new Exception("Cuenta bloqueada temporalmente. Intente en $minutesLeft minutos.");
        }
    }

    // 2. Forzado de reset
    if ($user['force_password_reset']) {
        echo json_encode(['success' => false, 'force_reset' => true, 'message' => 'Debes restablecer tu contraseña para continuar.']);
        exit;
    }

    // 3. Contraseña
    if (!password_verify($password, $user['password'])) {
        $attempts = (int)$user['login_attempts'] + 1;
        $updateFields = ["login_attempts = ?"];
        $params = [$attempts];

        if ($attempts >= 5) {
            $updateFields[] = "locked_until = ?";
            $params[] = date('Y-m-d H:i:s', strtotime('+10 minutes'));
            if ($user['login_attempts'] >= 5) {
                $updateFields[] = "force_password_reset = 1";
            }

            $msg = "Cuenta bloqueada por 10 minutos.";
        } else {
            $msg = "Credenciales incorrectas. Intentos restantes: " . (5 - $attempts);
        }

        $pdo->prepare("UPDATE usuario SET " . implode(", ", $updateFields) . " WHERE id_usuario = ?")->execute($params);
        
        // Registrar intento fallido crítico (bloqueo)
        if ($attempts >= 5) {
            require_once __DIR__ . '/helpers/audit_helper.php';
            logAudit($pdo, 'account_locked', 'usuario', $user['id_usuario'], "Cuenta bloqueada por 10 minutos tras 5 intentos fallidos.");
        }
        
        throw new Exception($msg);
    }

    // Login Exitoso
    $pdo->prepare("UPDATE usuario SET login_attempts = 0, locked_until = NULL WHERE id_usuario = ?")->execute([$user['id_usuario']]);

    // Obtener Positions
    $stmtPos = $pdo->prepare("SELECT position_id FROM user_positions WHERE user_id = ? AND is_active = 1");
    $stmtPos->execute([$user['id_usuario']]);
    $positions = $stmtPos->fetchAll(PDO::FETCH_ASSOC);
    $user['positions'] = array_map(fn($p) => (int)$p['position_id'], $positions);

    unset($user['password'], $user['login_attempts'], $user['locked_until'], $user['force_password_reset']);
    
    startSecureSession();
    
    $_SESSION['user_id'] = $user['id_usuario'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['id_rol'] = $user['id_rol'];
    $_SESSION['positions'] = $user['positions'];
    $_SESSION['user'] = $user;

    // Registrar Login en bitácora
    require_once __DIR__ . '/helpers/audit_helper.php';
    logAudit($pdo, 'login', 'usuario', $user['id_usuario'], "Inicio de sesión exitoso vía web.");

    echo json_encode(['success' => true, 'message' => 'Inicio de sesión exitoso', 'user' => $user]);

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
