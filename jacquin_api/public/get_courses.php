<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/connection.php';

header('Content-Type: application/json');

try {
    // Fetch courses with teacher info
    $sql = "SELECT c.*, u.full_name as teacher_name 
            FROM courses c 
            LEFT JOIN usuario u ON c.teacher_id = u.id_usuario
            ORDER BY c.created_at DESC";

    $stmt = $pdo->query($sql);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // For each course, fetch its schedule
    foreach ($courses as &$course) {
        $stmtSched = $pdo->prepare("SELECT * FROM schedules WHERE id_course = ?");
        $stmtSched->execute([$course['id_course']]);
        $course['schedules'] = $stmtSched->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(['success' => true, 'data' => $courses]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>