<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'ID requerido']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM courses WHERE id_course = ?");
    if ($stmt->execute([$data['id']])) {
        echo json_encode(['success' => true, 'message' => 'Curso eliminado']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar']);
    }
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode(['success' => false, 'message' => 'No se puede eliminar el curso porque tiene alumnos o horarios asociados.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error SQL: ' . $e->getMessage()]);
    }
}
?>