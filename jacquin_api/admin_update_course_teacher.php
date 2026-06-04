<?php
/**
 * admin_update_course_teacher.php
 * Endpoint para asignar el docente principal y los docentes adicionales de un curso.
 */
include_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';
require_once 'helpers/auth_helper.php';

validateAdminOrSecretary($pdo);

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['course_id'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos (course_id)']);
    exit;
}

$course_id = $data['course_id'];

// Obtener teacher_ids
$teacher_ids = [];
if (isset($data['teacher_ids']) && is_array($data['teacher_ids'])) {
    $teacher_ids = array_filter(array_map('intval', $data['teacher_ids']));
} elseif (isset($data['teacher_id']) && $data['teacher_id'] !== null) {
    $teacher_ids = [intval($data['teacher_id'])];
}

try {
    // Iniciar transacción para asegurar consistencia
    $pdo->beginTransaction();

    // Si hay profesores en la lista, validar que todos existan y tengan id_rol = 2
    if (!empty($teacher_ids)) {
        // Eliminar duplicados
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

        // Si la cantidad de profesores válidos no coincide con la solicitada, hay algún id incorrecto o que no es profesor
        if (count($valid_teacher_ids) !== count($teacher_ids)) {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Uno o más usuarios de la lista no son docentes válidos']);
            exit;
        }
        
        $teacher_ids = $valid_teacher_ids;
    }

    // 1. Limpiar las relaciones previas del curso en course_teachers
    $stmtClean = $pdo->prepare("DELETE FROM course_teachers WHERE course_id = ?");
    $stmtClean->execute([$course_id]);

    // 2. Insertar las nuevas relaciones en course_teachers
    if (!empty($teacher_ids)) {
        $stmtInsert = $pdo->prepare("INSERT INTO course_teachers (course_id, teacher_id) VALUES (?, ?)");
        foreach ($teacher_ids as $t_id) {
            $stmtInsert->execute([$course_id, $t_id]);
        }
    }

    // 3. Actualizar la columna legacy courses.teacher_id con el primer profesor de la lista (o NULL)
    $legacy_teacher_id = !empty($teacher_ids) ? $teacher_ids[0] : null;
    $stmtLegacy = $pdo->prepare("UPDATE courses SET teacher_id = ? WHERE id_course = ?");
    $stmtLegacy->execute([$legacy_teacher_id, $course_id]);

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Profesores del curso actualizados correctamente']);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'message' => 'Error DB: ' . $e->getMessage()]);
}
?>