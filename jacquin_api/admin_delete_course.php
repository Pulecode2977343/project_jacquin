<?php
/**
 * admin_delete_course.php
 * Endpoint para eliminar un curso de forma definitiva (ADMIN ONLY).
 * Realiza una limpieza completa de dependencias asociadas.
 */

session_start();
require_once 'config/cors.php';
require_once 'config/connection.php';
require_once 'helpers/auth_helper.php';
require_once 'helpers/audit_helper.php';

// 1. Validar permisos: Solo Administrador
$admin = validateAdmin();

try {
    $input = json_decode(file_get_contents("php://input"), true);
    $id_course = intval($input['id'] ?? 0);

    if ($id_course <= 0) {
        throw new Exception("ID de curso inválido.");
    }

    // 2. Obtener datos básicos para el log
    $stmtC = $pdo->prepare("SELECT course_name FROM courses WHERE id_course = ?");
    $stmtC->execute([$id_course]);
    $course = $stmtC->fetch(PDO::FETCH_ASSOC);

    if (!$course) {
        throw new Exception("El curso no existe.");
    }

    // 3. INICIAR TRANSACCIÓN
    $pdo->beginTransaction();

    // -- Limpieza de dependencias profundas --

    // Obtener todos los horarios de este curso para limpiar sus hijos
    $stmtS = $pdo->prepare("SELECT id_schedule FROM schedules WHERE id_course = ?");
    $stmtS->execute([$id_course]);
    $schedules = $stmtS->fetchAll(PDO::FETCH_COLUMN);

    if (!empty($schedules)) {
        $inQuery = implode(',', array_fill(0, count($schedules), '?'));
        
        // Tabla: enrollment_schedules (vínculo horario-estudiante)
        $pdo->prepare("DELETE FROM enrollment_schedules WHERE schedule_id IN ($inQuery)")->execute($schedules);
        
        // Tabla: schedule_teachers (vínculo horario-docente)
        $pdo->prepare("DELETE FROM schedule_teachers WHERE id_schedule IN ($inQuery)")->execute($schedules);
        
        // Tabla: attendance
        $pdo->prepare("DELETE FROM attendance WHERE id_schedule IN ($inQuery)")->execute($schedules);
    }

    // Tabla: academic_notes (notas asociadas a este curso)
    $pdo->prepare("DELETE FROM academic_notes WHERE course_id = ?")->execute([$id_course]);

    // Tabla: course_assignments (docentes asignados como titulares)
    $pdo->prepare("DELETE FROM course_assignments WHERE course_id = ?")->execute([$id_course]);

    // Tabla: enrollments (inscripciones activas o pendientes)
    $pdo->prepare("DELETE FROM enrollments WHERE course_id = ?")->execute([$id_course]);

    // Tabla: schedule_requests
    $pdo->prepare("DELETE FROM schedule_requests WHERE course_id = ?")->execute([$id_course]);

    // Tabla: schedules (los horarios mismos)
    $pdo->prepare("DELETE FROM schedules WHERE id_course = ?")->execute([$id_course]);

    // 4. POR ÚLTIMO: ELIMINAR EL CURSO
    $stmtDelete = $pdo->prepare("DELETE FROM courses WHERE id_course = ?");
    $stmtDelete->execute([$id_course]);

    // 5. REGISTRAR AUDITORÍA (DENTRO DE LA TRANSACCIÓN)
    logAudit(
        $pdo,
        'delete',
        'course',
        $id_course,
        [
            'course_name' => $course['course_name'],
            'deleted_by' => $_SESSION['full_name'] ?? 'Admin'
        ]
    );

    // 6. CONFIRMAR CAMBIOS
    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Curso y todos sus datos asociados fueron eliminados correctamente."
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Error al eliminar el curso: " . $e->getMessage()
    ]);
}
?>