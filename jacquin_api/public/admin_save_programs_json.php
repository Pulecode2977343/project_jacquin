<?php
// DEPRECATED: Este endpoint es un duplicado del raíz.
// El endpoint activo es jacquin_api/admin_save_programs_json.php
// Este archivo se mantiene protegido por seguridad pero no debe usarse.

// [SECURITY FIX 1] session_start() antes de cualquier header
session_start();
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

// [SECURITY FIX 1] Verificar sesión de administrador
if (!isset($_SESSION['user']) || $_SESSION['user']['id_rol'] != 1) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acceso denegado.']);
    exit;
}

// Redirigir internamente al endpoint canónico (raíz)
// Los clientes deben llamar a /jacquin_api/admin_save_programs_json.php directamente.
http_response_code(410);
echo json_encode([
    'success' => false,
    'message' => 'Este endpoint está obsoleto. Usar /jacquin_api/admin_save_programs_json.php'
]);
?>
