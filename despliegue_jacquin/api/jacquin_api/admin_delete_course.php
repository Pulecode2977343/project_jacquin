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