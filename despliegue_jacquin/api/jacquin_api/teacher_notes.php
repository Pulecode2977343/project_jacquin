<?php
// teacher_notes.php
// guardar notas/observaciones

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Campos requeridos
        if (empty($input['student_id']) || empty($input['course_id']) || empty($input['teacher_id'])) {
            throw new Exception("Datos incompletos");
        }

        $sql = "INSERT INTO academic_notes (student_id, course_id, teacher_id, note_type, score, comment, is_private_admin)
                VALUES (?, ?, ?, ?, ?, ?, ?)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $input['student_id'],
            $input['course_id'],
            $input['teacher_id'],
            $input['note_type'] ?? 'observation',
            $input['score'] ?? null,
            $input['comment'] ?? '',
            isset($input['is_private_admin']) ? $input['is_private_admin'] : 0
        ]);

        echo json_encode(['success' => true, 'message' => 'Nota guardada', 'id' => $pdo->lastInsertId()]);
    } else {
        // GET notes for a student in a course
        if (empty($_GET['student_id']) || empty($_GET['course_id']))
            throw new Exception("Params requeridos");

        $sql = "SELECT * FROM academic_notes WHERE student_id = ? AND course_id = ? ORDER BY created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$_GET['student_id'], $_GET['course_id']]);
        $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $notes]);
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>