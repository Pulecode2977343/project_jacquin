<?php
/**
 * admin_delete_user.php
 * Endpoint para eliminar un usuario de forma definitiva (ADMIN ONLY).
 * Realiza una limpieza manual de cascada para asegurar integridad.
 */

header('Content-Type: application/json; charset=UTF-8');
require_once 'config/cors.php';
require_once 'config/connection.php';
require_once 'helpers/auth_helper.php';
require_once 'helpers/audit_helper.php';
$rawInput = file_get_contents("php://input");
// LOG DE DEPURACIÓN (Al inicio absoluto)
$logMsg = "[" . date('Y-m-d H:i:s') . "] ACCESO DETECTADO! Method: " . $_SERVER['REQUEST_METHOD'] . " | IP: " . $_SERVER['REMOTE_ADDR'] . " | Raw: " . $rawInput . "\n";
file_put_contents(__DIR__ . "/delete_debug.log", $logMsg, FILE_APPEND);

// TEMPORAL: Forzar respuesta para ver si llega el frontend
// echo json_encode(["success" => false, "message" => "BACKEND ALCANZADO: " . $rawInput]);
// exit;

try {
    require_once 'helpers/session_helper.php';
    startSecureSession();
    
    // Debug de sesión muy detallado
    $sessionInfo = "SessionID: " . session_id() . " | UserID: " . ($_SESSION['user_id'] ?? 'NONE') . " | Role: " . ($_SESSION['id_rol'] ?? 'NONE');
    $cookiesInfo = "Cookies recibidas en request: " . json_encode($_COOKIE);
    file_put_contents(__DIR__ . "/delete_debug.log", "[" . date('Y-m-d H:i:s') . "] DELETE_USER ENDPOINT HIT\n", FILE_APPEND);
    file_put_contents(__DIR__ . "/delete_debug.log", "  - Auth data: $sessionInfo\n", FILE_APPEND);


    // 1. Validar permisos: Solo Administrador (rol 1)
    $admin = validateAdmin();
    
    file_put_contents(__DIR__ . "/delete_debug.log", "[" . date('Y-m-d H:i:s') . "] AUTH EXITOSA. Usuario actuante: " . ($_SESSION['full_name'] ?? 'Admin') . " (ID: " . $_SESSION['user_id'] . ")\n", FILE_APPEND);

    $input = json_decode($rawInput, true);
    $id_usuario = intval($input['id_usuario'] ?? 0);

    if ($id_usuario <= 0) {
        throw new Exception("ID de usuario inválido.");
    }

    // 2. Protecciones de seguridad críticas
    if ($id_usuario == $_SESSION['user_id']) {
        throw new Exception("No puedes eliminar tu propia cuenta.");
    }
    
    // Protección adicional: no permitir eliminar al administrador raíz (usualmente ID 1)
    if ($id_usuario === 1) {
        throw new Exception("No se puede eliminar la cuenta principal del sistema.");
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

    // Tabla: enrollments y enrollment_schedules (limpieza de inscripciones)
    // Borramos primero los horarios de la inscripción para evitar FK
    $pdo->prepare("DELETE FROM enrollment_schedules WHERE enrollment_id IN (SELECT id_enrollment FROM enrollments WHERE student_id = ?)")->execute([$id_usuario]);
    $pdo->prepare("DELETE FROM enrollments WHERE student_id = ?")->execute([$id_usuario]);

    // Tabla: tickets y event_reservations (reservas y boletas)
    // Borramos boletas vinculadas a reservas del usuario
    $pdo->prepare("DELETE FROM tickets WHERE id_reservation IN (SELECT id_reservation FROM event_reservations WHERE id_user = ?)")->execute([$id_usuario]);
    $pdo->prepare("DELETE FROM event_reservations WHERE id_user = ?")->execute([$id_usuario]);

    // Tabla: student_submissions (tareas entregables)
    // Se intenta borrar si existe la tabla
    try {
        $pdo->prepare("DELETE FROM student_submissions WHERE student_id = ?")->execute([$id_usuario]);
    } catch (Exception $e) { /* Tabla opcional */ }

    // Tabla: user_positions (historial de cargos)
    // También limpiamos quien asignó cargos a otros
    $pdo->prepare("UPDATE user_positions SET assigned_by = NULL WHERE assigned_by = ?")->execute([$id_usuario]);
    $pdo->prepare("DELETE FROM user_positions WHERE user_id = ?")->execute([$id_usuario]);

    // Tablas de control de personal
    $pdo->prepare("DELETE FROM staff_checkin WHERE id_usuario = ?")->execute([$id_usuario]);
    $pdo->prepare("DELETE FROM permission_requests WHERE id_usuario = ?")->execute([$id_usuario]);
    
    // Tabla: attendance (registros tomados por este usuario si es docente)
    $pdo->prepare("DELETE FROM attendance WHERE recorded_by = ?")->execute([$id_usuario]);

    // Tablas adicionales que podrían existir (basado en otros endpoints)
    try {
        $pdo->prepare("DELETE FROM schedule_teachers WHERE id_teacher = ?")->execute([$id_usuario]);
    } catch (Exception $e) { /* Ignorar si no existe */ }

    // Tabla: students (datos específicos del perfil de estudiante)
    $pdo->prepare("DELETE FROM students WHERE id_usuario = ?")->execute([$id_usuario]);

    // Tablas de control de personal
    $pdo->prepare("DELETE FROM staff_checkin WHERE id_usuario = ?")->execute([$id_usuario]);
    $pdo->prepare("DELETE FROM permission_requests WHERE id_usuario = ?")->execute([$id_usuario]);
    
    // Tabla: attendance (registros tomados por este usuario si es docente)
    // Nota: recorded_by es NOT NULL, así que debemos borrar o reasignar. Borramos para limpieza total.
    $pdo->prepare("DELETE FROM attendance WHERE recorded_by = ?")->execute([$id_usuario]);

    // REFERENCIAS LOOSE: SET NULL
    $pdo->prepare("UPDATE courses SET teacher_id = NULL WHERE teacher_id = ?")->execute([$id_usuario]);
    $pdo->prepare("UPDATE schedules SET teacher_id = NULL WHERE teacher_id = ?")->execute([$id_usuario]);
    $pdo->prepare("UPDATE audit_log SET user_id = NULL WHERE user_id = ?")->execute([$id_usuario]);
    // La columna 'created_by' no existe en positions. Se omite.
    // La columna 'resolved_by' no existe en permission_requests. Se omite.

    // 5. POR ÚLTIMO: ELIMINAR REGISTRO PRINCIPAL EN USUARIO
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

    $pdo->commit();
    
    // Notificamos éxito en el log
    file_put_contents(__DIR__ . "/delete_debug.log", "[" . date('Y-m-d H:i:s') . "] ELIMINACIÓN EXITOSA de " . $user['full_name'] . " (ID: $id_usuario)\n", FILE_APPEND);

    echo json_encode([
        'success' => true, 
        'message' => "El usuario " . $user['full_name'] . " y todos sus datos relacionados han sido eliminados permanentemente."
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // Notificamos error en el log
    file_put_contents(__DIR__ . "/delete_debug.log", "[" . date('Y-m-d H:i:s') . "] ERROR: " . $e->getMessage() . "\n", FILE_APPEND);

    http_response_code(400);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
