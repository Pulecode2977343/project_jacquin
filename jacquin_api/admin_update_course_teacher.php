<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['course_id'])) {
    echo json_encode(['success' => false, 'message' => 'Falta ID del curso']);
    exit;
}

$course_id = $data['course_id'];
$teacher_id = isset($data['teacher_id']) ? $data['teacher_id'] : null;

try {
    // If teacher_id provided, verify role
    if ($teacher_id) {
        $stmtUser = $pdo->prepare("SELECT id_rol FROM usuario WHERE id_usuario = ?");
        $stmtUser->execute([$teacher_id]);
        $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
        if (!$user || $user['id_rol'] != 2) {
            echo json_encode(['success' => false, 'message' => 'El usuario no es docente']);
            exit;
        }
    }

    $sql = "UPDATE courses SET teacher_id = ? WHERE id_course = ?";
    $stmt = $pdo->prepare($sql);
    if ($stmt->execute([$teacher_id, $course_id])) {
        echo json_encode(['success' => true, 'message' => 'Profesor actualizado correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error SQL: ' . $e->getMessage()]);
}
?>