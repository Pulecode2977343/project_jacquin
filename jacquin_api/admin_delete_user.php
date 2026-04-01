<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';
require_once __DIR__ . '/helpers/auth_helper.php';
require_once __DIR__ . '/helpers/audit_helper.php';

$admin = validateAdmin();

header('Content-Type: application/json');

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id_usuario = isset($data['id_usuario']) ? intval($data['id_usuario']) : 0;

if ($id_usuario <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID de usuario no válido.']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Check if user exists
    $stmt = $pdo->prepare("SELECT id_rol, full_name FROM usuario WHERE id_usuario = ?");
    $stmt->execute([$id_usuario]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception("El usuario no existe.");
    }

    // Protection: Don't delete the last admin (optional but good)
    if ($user['id_rol'] == 1) {
        $stmtCount = $pdo->query("SELECT COUNT(*) FROM usuario WHERE id_rol = 1");
        if ($stmtCount->fetchColumn() <= 1) {
            throw new Exception("No se puede eliminar al único administrador del sistema.");
        }
    }

    // 2. Clean up child records (manual cascade for safety/clarity)
    
    // Academic & Progress
    $pdo->prepare("DELETE FROM academic_notes WHERE student_id = ? OR teacher_id = ?")->execute([$id_usuario, $id_usuario]);
    $pdo->prepare("DELETE FROM attendance WHERE student_id = ?")->execute([$id_usuario]);
    $pdo->prepare("DELETE FROM student_submissions WHERE student_id = ?")->execute([$id_usuario]);
    $pdo->prepare("DELETE FROM enrollments WHERE student_id = ?")->execute([$id_usuario]);
    $pdo->prepare("DELETE FROM schedule_requests WHERE student_id = ?")->execute([$id_usuario]);

    // Teaching
    $pdo->prepare("DELETE FROM schedule_teachers WHERE id_teacher = ?")->execute([$id_usuario]);
    $pdo->prepare("DELETE FROM teacher_functions WHERE teacher_id = ?")->execute([$id_usuario]);
    // For courses assigned to this teacher, we set teacher_id to NULL rather than deleting the course
    $pdo->prepare("UPDATE courses SET teacher_id = NULL WHERE teacher_id = ?")->execute([$id_usuario]);
    $pdo->prepare("UPDATE course_assignments SET teacher_id = ? WHERE teacher_id = ?")->execute([0, $id_usuario]); // Or different strategy

    // Chat & Communications
    $pdo->prepare("DELETE FROM chat_participants WHERE user_id = ?")->execute([$id_usuario]);
    // Note: chat_messages might be kept for history if sender is anonymous, but usually deleted if account is purged
    $pdo->prepare("DELETE FROM chat_messages WHERE sender_id = ?")->execute([$id_usuario]);
    // Conversations created by this user
    $pdo->prepare("DELETE FROM chat_conversations WHERE created_by = ?")->execute([$id_usuario]);

    // Administrative
    $pdo->prepare("DELETE FROM compliance_tracking WHERE user_id = ?")->execute([$id_usuario]);
    $pdo->prepare("DELETE FROM user_positions WHERE user_id = ?")->execute([$id_usuario]);

    // 3. Final step: delete from user profile
    $stmtDelete = $pdo->prepare("DELETE FROM usuario WHERE id_usuario = ?");
    $stmtDelete->execute([$id_usuario]);

    if ($stmtDelete->rowCount() > 0) {
        $pdo->commit();

        logAudit(
            $pdo,
            'delete',
            'user',
            $id_usuario,
            ['full_name' => $user['full_name'], 'deleted_by' => $admin['full_name']]
        );

        echo json_encode(['success' => true, 'message' => "Usuario '{$user['full_name']}' eliminado correctamente."]);
    } else {
        throw new Exception("No se pudo eliminar el registro principal del usuario.");
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => "Error: " . $e->getMessage()]);
}
