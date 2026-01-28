<?php
// Prevent HTML warnings from breaking JSON - MUST BE FIRST
ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT & ~E_USER_NOTICE & ~E_USER_DEPRECATED);

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

try {
    // Consulta simple y directa
    // Consulta incluyendo conteo de alertas (cursos activos sin docente)
    // Updated to use enrollment_schedules table instead of e.schedule_id
    // Optimized query: Use a derived table for counts to avoid per-row subquery overhead
    // Consulta directa para asegurar carga inmediata
    $sql = "SELECT id_usuario, full_name, email, id_rol, avatar_url FROM usuario ORDER BY id_usuario DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $users]);

} catch (Exception $e) {
    // Si falla, intentamos devolver un error JSON 
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'DB Error: ' . $e->getMessage()]);
}