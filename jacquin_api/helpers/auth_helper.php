<?php
/**
 * Auth Helper - Protege los endpoints de administración
 * Solo permite acceso a usuarios con id_rol = 1 (Administrador)
 */

function validateAdmin() {
    // Iniciamos sesión si no está iniciada
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

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
}
?>
