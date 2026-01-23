<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->name) || !isset($data->teacher_id)) {
        throw new Exception("Nombre del curso y ID del profesor son obligatorios.");
    }

    $sql = "INSERT INTO courses (course_name, description, teacher_id) VALUES (:name, :desc, :tid)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':name' => $data->name,
        ':desc' => $data->description ?? '',
        ':tid' => $data->teacher_id
    ]);

    $course_id = $pdo->lastInsertId();

    echo json_encode(['success' => true, 'message' => 'Curso creado', 'id' => $course_id]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>