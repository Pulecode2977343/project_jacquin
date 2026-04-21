<?php
require_once __DIR__ . '/helpers/cors_helper.php';
handleCors();
require_once __DIR__ . '/config/connection.php';
require_once __DIR__ . '/helpers/auth_helper.php';
require_once __DIR__ . '/helpers/audit_helper.php';

header('Content-Type: application/json; charset=UTF-8');

validateAdmin();

try {
    $data = json_decode(file_get_contents("php://input"));

    // Soportar ambos formatos: {course_name} (frontend) y {name} (legacy)
    $courseName = $data->course_name ?? $data->name ?? null;

    if (!$courseName || trim($courseName) === '') {
        throw new Exception("El nombre del curso es obligatorio.");
    }

    // Detectar columnas disponibles dinámicamente
    $columns = $pdo->query("SHOW COLUMNS FROM courses")->fetchAll(PDO::FETCH_COLUMN);

    $insertCols = ['course_name'];
    $insertPlaceholders = [':name'];
    $params = [':name' => trim($courseName)];

    // Si la tabla tiene columna 'description', la incluimos
    if (in_array('description', $columns)) {
        $insertCols[] = 'description';
        $insertPlaceholders[] = ':desc';
        $params[':desc'] = $data->description ?? '';
    }

    // Si la tabla tiene columna 'teacher_id', la incluimos (opcional)
    if (in_array('teacher_id', $columns) && isset($data->teacher_id) && $data->teacher_id) {
        $insertCols[] = 'teacher_id';
        $insertPlaceholders[] = ':tid';
        $params[':tid'] = intval($data->teacher_id);
    }

    $sql = "INSERT INTO courses (" . implode(', ', $insertCols) . ") VALUES (" . implode(', ', $insertPlaceholders) . ")";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $course_id = $pdo->lastInsertId();

    logAudit($pdo, 'create', 'course', $course_id, [
        'name' => $courseName
    ]);

    echo json_encode(['success' => true, 'message' => 'Curso creado exitosamente.', 'id' => $course_id]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>