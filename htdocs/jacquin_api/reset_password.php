<?php
/**
 * Script de emergencia para resetear contraseña de un usuario
 * USO: php reset_password.php <email> <nueva_contraseña>
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/connection.php';

// Check command line arguments
if ($argc < 3) {
    echo "Uso: php reset_password.php <email> <nueva_contraseña>\n";
    echo "Ejemplo: php reset_password.php admin@example.com admin123\n";
    exit(1);
}

$email = $argv[1];
$newPassword = $argv[2];

try {
    // Verify user exists
    $stmt = $pdo->prepare("SELECT id_usuario, email, full_name FROM usuario WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo "ERROR: No se encontró usuario con email: $email\n";
        exit(1);
    }

    echo "Usuario encontrado: {$user['full_name']} (ID: {$user['id_usuario']})\n";

    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

    // Update password
    $stmt = $pdo->prepare("UPDATE usuario SET password = ? WHERE id_usuario = ?");
    $stmt->execute([$hashedPassword, $user['id_usuario']]);

    echo "✓ Contraseña actualizada exitosamente para: $email\n";
    echo "Nueva contraseña: $newPassword\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>