<?php
// Prevent HTML warnings from breaking JSON - MUST BE FIRST
ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT & ~E_USER_NOTICE & ~E_USER_DEPRECATED);

include_once 'helpers/cors_helper.php';
handleCors();
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

try {
    // Consulta con conteo de acciones pendientes para estudiantes/aspirantes
    $sql = "
        SELECT u.id_usuario, u.full_name, u.email, u.id_rol, u.avatar_url,
        (
            SELECT COUNT(*) FROM enrollments e
            WHERE e.student_id = u.id_usuario
              AND e.status IN ('Pendiente', 'Pre-inscrito')
        ) AS pending_actions
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