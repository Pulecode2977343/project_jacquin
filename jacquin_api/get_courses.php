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
            (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id_course AND e.status IN ('Pendiente', 'Pre-inscrito')) as pending_count
        FROM courses c
        LEFT JOIN usuario u ON c.teacher_id = u.id_usuario
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