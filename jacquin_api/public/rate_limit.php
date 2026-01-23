<?php

/**
 * Verifica si una IP ha excedido el límite de intentos.
 * Límite: 5 intentos fallidos en los últimos 15 minutos.
 */
function check_rate_limit($pdo, $ip_address) {
    if ($ip_address === '::1' || $ip_address === '127.0.0.1') {
        return true; // Excepción para localhost si se desea, o remover para ser estricto
    }

    $stmt = $pdo->prepare("
        SELECT COUNT(*) as failures 
        FROM login_attempts 
        WHERE ip_address = ? 
          AND is_success = 0 
          AND attempt_time > (NOW() - INTERVAL 15 MINUTE)
    ");
    $stmt->execute([$ip_address]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result && $result['failures'] >= 5) {
        return false; // Bloqueado
    }
    return true; // Permitido
}

/**
 * Registra un intento de login (exitoso o fallido).
 */
function log_login_attempt($pdo, $ip_address, $email, $success) {
    $stmt = $pdo->prepare("
        INSERT INTO login_attempts (ip_address, email_attempt, is_success, attempt_time) 
        VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([
        $ip_address, 
        substr($email, 0, 100), // Truncar por seguridad 
        $success ? 1 : 0
    ]);
}
?>
