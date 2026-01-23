<?php
// admin_get_schedule_requests.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/config/connection.php';

try {
    $sql = "
        SELECT 
            sr.id,
            sr.student_id,
            sr.course_id,
            sr.requested_day,
            sr.requested_time,
            sr.status,
            sr.created_at,
            u.full_name as student_name,
            u.email as student_email,
            c.name as course_name,
            (SELECT full_name FROM usuario WHERE id_usuario = c.teacher_id) as current_teacher
        FROM schedule_requests sr
        JOIN usuario u ON sr.student_id = u.id_usuario
        JOIN courses c ON sr.course_id = c.id_course
        WHERE sr.status = 'pending'
        ORDER BY sr.created_at ASC
    ";

    $stmt = $pdo->query($sql);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $requests]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>