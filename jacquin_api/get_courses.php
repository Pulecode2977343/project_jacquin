<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';

try {
    if (!isset($pdo)) {
        throw new Exception("Error de conexión a BD code: 1");
    }

    $query = "
        SELECT 
            c.id_course, 
            c.course_name as name, 
            c.description, 
            c.image_url,
            c.teacher_id,
            u.full_name as teacher_name,
            COALESCE(pending.p_count, 0) as pending_count
        FROM courses c
        LEFT JOIN usuario u ON c.teacher_id = u.id_usuario
        LEFT JOIN (
            SELECT course_id, COUNT(*) as p_count 
            FROM enrollments 
            WHERE status IN ('Pendiente', 'Pre-inscrito')
            GROUP BY course_id
        ) as pending ON c.id_course = pending.course_id
        ORDER BY c.course_name ASC
    ";
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $courses]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>