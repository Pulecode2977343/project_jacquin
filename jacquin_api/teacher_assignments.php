<?php
// teacher_assignments.php
// Gestión de tareas por el docente

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

require_once __DIR__ . '/helpers/session_helper.php';

header('Content-Type: application/json');

startSecureSession();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        throw new Exception("No autorizado. Sesión inválida.");
    }

    $teacher_id = $_SESSION['user_id'];

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input)
        $input = $_POST;

    // CREAR TAREA
    if ($method === 'POST') {
        // Validar datos mínimos
        if (empty($input['course_id']) || empty($input['title'])) {
            throw new Exception("Datos incompletos (course_id, title)");
        }

        $media_url = $input['media_url'] ?? '';
        $media_type = $input['media_type'] ?? 'none';

        if (isset($_FILES['media_file']) && $_FILES['media_file']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../public/uploads/assignments/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9.\-_]/', '', basename($_FILES['media_file']['name']));
            $targetPath = $uploadDir . $fileName;
            if (move_uploaded_file($_FILES['media_file']['tmp_name'], $targetPath)) {
                $media_url = 'public/uploads/assignments/' . $fileName;
                $media_type = 'file';
            } else {
                throw new Exception("Error al subir el archivo de la tarea");
            }
        }

        $sql = "INSERT INTO course_assignments (course_id, teacher_id, title, description, media_type, media_url, due_date, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $input['course_id'],
            $teacher_id,
            $input['title'],
            $input['description'] ?? '',
            $media_type,
            $media_url,
            !empty($input['due_date']) ? $input['due_date'] : null,
            1
        ]);

        echo json_encode(['success' => true, 'message' => 'Tarea creada', 'id' => $pdo->lastInsertId()]);
        exit;
    }

    // LISTAR TAREAS (Teacher View)
    if ($method === 'GET') {
        if (!isset($_GET['course_id']))
            throw new Exception("course_id requerido");

        $sql = "SELECT * FROM course_assignments WHERE course_id = ? ORDER BY created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$_GET['course_id']]);
        $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $assignments]);
        exit;
    }

    // DELETE? (Opcional, implementar si necesario)

    throw new Exception("Método no soportado");

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>