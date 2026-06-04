<?php
// get_student_tasks.php
require_once 'config/cors.php';
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/config/connection.php';

try {
    $studentId = $_GET['student_id'] ?? null;

    if (!$studentId) {
        throw new Exception("Student ID is required");
    }

    $sql = "
        SELECT 
            ca.id as assignment_id,
            ca.course_id,
            ca.title,
            ca.description,
            ca.due_date,
            ca.media_type,
            ca.media_url,
            c.course_name as course_name,
            u_teacher.full_name as teacher_name,
            ss.status as submission_status,
            ss.grade,
            ss.submission_text,
            ss.submitted_at
        FROM course_assignments ca
        JOIN courses c ON ca.course_id = c.id_course
        JOIN enrollments e ON c.id_course = e.course_id
        LEFT JOIN usuario u_teacher ON ca.teacher_id = u_teacher.id_usuario
        LEFT JOIN student_submissions ss ON ca.id = ss.assignment_id AND ss.student_id = ?
        WHERE e.student_id = ? 
        AND e.status = 'Activo'
        AND ca.is_active = 1
        ORDER BY ca.due_date ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$studentId, $studentId]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $tasks]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>