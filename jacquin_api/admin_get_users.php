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
    $sql = "
        SELECT 
            u.id_usuario, 
            u.full_name, 
            u.email, 
            u.id_rol, 
            u.avatar_url,
            (
                SELECT COUNT(DISTINCT e.id_enrollment) 
                FROM enrollments e 
                LEFT JOIN enrollment_schedules es ON e.id_enrollment = es.enrollment_id
                LEFT JOIN schedules s ON es.schedule_id = s.id_schedule 
                LEFT JOIN usuario t ON s.teacher_id = t.id_usuario
                WHERE e.student_id = u.id_usuario 
                  AND e.status = 'Activo' 
                  AND (s.teacher_id IS NULL OR s.teacher_id = 0 OR t.id_rol = 1)
            ) as alert_count
        FROM usuario u 
        ORDER BY u.id_usuario DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $users]);

} catch (Exception $e) {
    // Si falla, intentamos devolver un error JSON 
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'DB Error: ' . $e->getMessage()]);
}