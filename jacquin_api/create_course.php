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

    // Iniciar transacción
    $pdo->beginTransaction();

    // Obtener y validar teacher_ids
    $teacher_ids = [];
    if (isset($data->teacher_ids) && is_array($data->teacher_ids)) {
        $teacher_ids = array_filter(array_map('intval', $data->teacher_ids));
    } elseif (isset($data->teacher_id) && $data->teacher_id) {
        $teacher_ids = [intval($data->teacher_id)];
    }

    if (!empty($teacher_ids)) {
        $teacher_ids = array_values(array_unique($teacher_ids));
        $placeholders = implode(',', array_fill(0, count($teacher_ids), '?'));
        $stmtUser = $pdo->prepare("SELECT id_usuario, id_rol FROM usuario WHERE id_usuario IN ($placeholders)");
        $stmtUser->execute($teacher_ids);
        $users = $stmtUser->fetchAll(PDO::FETCH_ASSOC);

        $valid_teacher_ids = [];
        foreach ($users as $user) {
            if ($user['id_rol'] == 2) {
                $valid_teacher_ids[] = intval($user['id_usuario']);
            }
        }

        if (count($valid_teacher_ids) !== count($teacher_ids)) {
            throw new Exception("Uno o más usuarios de la lista no son docentes válidos.");
        }
        $teacher_ids = $valid_teacher_ids;
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

    // Si la tabla tiene columna 'teacher_id', la incluimos (legacy - primer profesor o null)
    if (in_array('teacher_id', $columns)) {
        $insertCols[] = 'teacher_id';
        $insertPlaceholders[] = ':tid';
        $params[':tid'] = !empty($teacher_ids) ? $teacher_ids[0] : null;
    }

    $sql = "INSERT INTO courses (" . implode(', ', $insertCols) . ") VALUES (" . implode(', ', $insertPlaceholders) . ")";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $course_id = $pdo->lastInsertId();

    // Registrar en la tabla intermedia course_teachers
    if (!empty($teacher_ids)) {
        $stmtInsert = $pdo->prepare("INSERT INTO course_teachers (course_id, teacher_id) VALUES (?, ?)");
        foreach ($teacher_ids as $t_id) {
            $stmtInsert->execute([$course_id, $t_id]);
        }
    }

    logAudit($pdo, 'create', 'course', $course_id, [
        'name' => $courseName
    ]);

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Curso creado exitosamente.', 'id' => $course_id]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>