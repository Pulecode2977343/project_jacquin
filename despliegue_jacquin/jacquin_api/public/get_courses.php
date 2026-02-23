<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/connection.php';

header('Content-Type: application/json');

try {
    // Fetch courses with teacher info from schedules (many-to-many)
    // We group by course to avoid duplicates if multiple schedules exist
    $sql = "SELECT c.*, 
                   GROUP_CONCAT(DISTINCT u.full_name SEPARATOR ', ') as teacher_name 
            FROM courses c 
            LEFT JOIN schedules s ON c.id_course = s.id_course
            LEFT JOIN schedule_teachers st ON s.id_schedule = st.id_schedule
            LEFT JOIN usuario u ON st.id_teacher = u.id_usuario
            GROUP BY c.id_course
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