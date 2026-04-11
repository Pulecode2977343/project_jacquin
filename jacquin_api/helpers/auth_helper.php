<?php
/**
 * Auth Helper - Protege los endpoints de administración
 * Solo permite acceso a usuarios con id_rol = 1 (Administrador)
 */

function validateAdmin() {
    // Iniciamos sesión si no está iniciada
    require_once __DIR__ . '/session_helper.php';
    startSecureSession();


    // Verificamos si existe la sesión del usuario
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['id_rol'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Sesión no iniciada. Acceso denegado."]);
        exit();
    }

    // Verificamos que sea administrador (rol 1)
    if ($_SESSION['id_rol'] != 1) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Permisos insuficientes. Solo administradores pueden realizar esta acción."]);
        exit();
    }

    return $_SESSION;
}

/**
 * Permite acceso a Admin (rol 1) O a usuarios con cargo de Secretario (id_position = 2)
 */
function validateAdminOrSecretary($pdo) {
    require_once __DIR__ . '/session_helper.php';
    startSecureSession();

    if (!isset($_SESSION['user_id']) || !isset($_SESSION['id_rol'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Sesión no iniciada."]);
        exit();
    }

    // Si es Administrador, tiene acceso total
    if ($_SESSION['id_rol'] == 1) {
        return true;
    }

    // Si no es Admin, verificamos si tiene cargo de Secretario (id_position 2)
    // El id_position suele estar en la tabla user_positions
    $userId = $_SESSION['user_id'];
    $stmt = $pdo->prepare("SELECT id FROM user_positions WHERE user_id = ? AND position_id = 2 AND is_active = 1 LIMIT 1");
    $stmt->execute([$userId]);
    
    if ($stmt->fetch()) {
        return true;
    }

    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Permisos insuficientes. Se requiere cargo de Secretario o Administrador."]);
    exit();
}
?>
