<?php
/**
 * admin_delete_user.php
 * Endpoint para eliminar un usuario de forma definitiva (ADMIN ONLY).
 * Realiza una limpieza manual de cascada para asegurar integridad.
 */

session_start();
require_once 'config/cors.php';
require_once 'config/connection.php';
require_once 'helpers/auth_helper.php';
require_once 'helpers/audit_helper.php';

// 1. Validar permisos: Solo Administrador (rol 1)
$admin = validateAdmin();

try {
    $input = json_decode(file_get_contents("php://input"), true);
    $id_usuario = intval($input['id_usuario'] ?? 0);

    if ($id_usuario <= 0) {
        throw new Exception("ID de usuario inválido.");
    }

    // 2. No permitir que un administrador se elimine a sí mismo
    if ($id_usuario == $_SESSION['user_id']) {
        throw new Exception("No puedes eliminar tu propia cuenta.");
    }

    // 3. Obtener datos básicos para el log antes de borrar
    $stmtUser = $pdo->prepare("SELECT full_name, email FROM usuario WHERE id_usuario = ?");
    $stmtUser->execute([$id_usuario]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception("El usuario no existe.");
    }

    // 4. INICIAR TRANSACCIÓN DE LIMPIEZA
    $pdo->beginTransaction();

    // -- Limpieza de dependencias en orden jerárquico --
    
    // Tabla: academic_notes (estudiante y docente)
    $pdo->prepare("DELETE FROM academic_notes WHERE student_id = ? OR teacher_id = ?")->execute([$id_usuario, $id_usuario]);

    // Tabla: attendance
    $pdo->prepare("DELETE FROM attendance WHERE student_id = ?")->execute([$id_usuario]);

    // Tabla: chat_messages (mensajes enviados por el usuario)
    $pdo->prepare("DELETE FROM chat_messages WHERE sender_id = ?")->execute([$id_usuario]);

    // Tabla: chat_participants
    $pdo->prepare("DELETE FROM chat_participants WHERE user_id = ?")->execute([$id_usuario]);
    
    // Tabla: chat_conversations (donde sea el creador)
    $pdo->prepare("DELETE FROM chat_conversations WHERE created_by = ?")->execute([$id_usuario]);

    // Tabla: compliance_tracking
    $pdo->prepare("DELETE FROM compliance_tracking WHERE user_id = ?")->execute([$id_usuario]);

    // Tabla: enrollments
    $pdo->prepare("DELETE FROM enrollments WHERE student_id = ?")->execute([$id_usuario]);

    // Tabla: course_assignments (docentes)
    $pdo->prepare("DELETE FROM course_assignments WHERE teacher_id = ?")->execute([$id_usuario]);

    // Tabla: schedule_requests
    $pdo->prepare("DELETE FROM schedule_requests WHERE student_id = ?")->execute([$id_usuario]);

    // Tabla: schedule_teachers (horarios asignados a docente)
    $pdo->prepare("DELETE FROM schedule_teachers WHERE id_teacher = ?")->execute([$id_usuario]);

    // Tabla: student_submissions (tareas entregables)
    $pdo->prepare("DELETE FROM student_submissions WHERE student_id = ?")->execute([$id_usuario]);

    // Tabla: teacher_functions (funciones de cargo de docente)
    $pdo->prepare("DELETE FROM teacher_functions WHERE teacher_id = ?")->execute([$id_usuario]);

    // Tabla: user_positions (historial de cargos)
    $pdo->prepare("DELETE FROM user_positions WHERE user_id = ?")->execute([$id_usuario]);

    // REFERENCIAS LOOSE: SET NULL
    $pdo->prepare("UPDATE courses SET teacher_id = NULL WHERE teacher_id = ?")->execute([$id_usuario]);
    $pdo->prepare("UPDATE schedules SET teacher_id = NULL WHERE teacher_id = ?")->execute([$id_usuario]);
    $pdo->prepare("UPDATE audit_log SET user_id = NULL WHERE user_id = ?")->execute([$id_usuario]);
    $pdo->prepare("UPDATE positions SET created_by = NULL WHERE created_by = ?")->execute([$id_usuario]);

    // 5. POR ÚLTIMO: ELIMINAR REGISTRO PRINCIPAL
    $stmtDelete = $pdo->prepare("DELETE FROM usuario WHERE id_usuario = ?");
    $stmtDelete->execute([$id_usuario]);

    // 6. REGISTRAR AUDITORÍA (DENTRO DE LA TRANSACCIÓN)
    logAudit(
        $pdo,
        'delete',
        'usuario',
        $id_usuario,
        [
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'deleted_by' => $_SESSION['full_name'] ?? 'Admin'
        ]
    );

    // 7. CONFIRMAR CAMBIOS
    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Usuario y todos sus registros asociados eliminados correctamente."
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
