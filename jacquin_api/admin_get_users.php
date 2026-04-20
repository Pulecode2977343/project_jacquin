<?php
// Prevent HTML warnings from breaking JSON - MUST BE FIRST
ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT & ~E_USER_NOTICE & ~E_USER_DEPRECATED);

header('Content-Type: application/json; charset=UTF-8');
require_once 'config/cors.php';
require_once 'config/connection.php';
require_once 'helpers/auth_helper.php';

require_once 'helpers/session_helper.php';
startSecureSession();

file_put_contents(__DIR__ . "/delete_debug.log", "[" . date('Y-m-d H:i:s') . "] GET_USERS: Acceso detectado\n", FILE_APPEND);

try {
    $sessionInfo = "SessionID: " . session_id() . " | UserID: " . ($_SESSION['user_id'] ?? 'NONE') . " | Role: " . ($_SESSION['id_rol'] ?? 'NONE');
    file_put_contents(__DIR__ . "/delete_debug.log", "[" . date('Y-m-d H:i:s') . "] GET_USERS AUTH: " . $sessionInfo . "\n", FILE_APPEND);

    // Validar permisos: Solo Administrador (rol 1)

    $admin = validateAdmin();


    // Consulta con conteo de acciones pendientes para estudiantes/aspirantes
    $sql = "
        SELECT u.id_usuario, u.full_name, u.email, u.id_rol, u.avatar_url, u.n_phone, u.address,
        (
            SELECT COUNT(*) FROM enrollments e
            WHERE e.student_id = u.id_usuario
              AND e.status IN ('Pendiente', 'Pre-inscrito')
        ) AS pending_actions,
        (
            SELECT COUNT(*) FROM user_positions up
            WHERE up.user_id = u.id_usuario AND up.is_active = 1
        ) AS position_count
        FROM usuario u
        ORDER BY u.id_usuario DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    // Convertir pending_actions a int
    foreach ($users as &$u) {
        $u['pending_actions'] = (int)$u['pending_actions'];
    }

    echo json_encode(['success' => true, 'data' => $users]);

} catch (Exception $e) {
    // Si falla, intentamos devolver un error JSON 
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'DB Error: ' . $e->getMessage()]);
}