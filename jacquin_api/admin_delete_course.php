<?php
/**
 * admin_delete_course.php
 * Endpoint para eliminar un curso de forma definitiva (ADMIN ONLY).
 * Realiza una limpieza completa de dependencias asociadas.
 */

require_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");

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
    // Función auxiliar para eliminar de tablas que pueden no existir
    $safeDelete = function($sql, $params) use ($pdo) {
        try {
            $pdo->prepare($sql)->execute($params);
        } catch (PDOException $e) {
            // Tabla no existe, ignorar silenciosamente
        }
    };

    // Obtener todos los horarios de este curso para limpiar sus hijos
    $stmtS = $pdo->prepare("SELECT id_schedule FROM schedules WHERE course_id = ?");
    try {
        $stmtS->execute([$id_course]);
        $schedules = $stmtS->fetchAll(PDO::FETCH_COLUMN);
    } catch (PDOException $e) {
        // Intentar con id_course
        $stmtS = $pdo->prepare("SELECT id_schedule FROM schedules WHERE id_course = ?");
        $stmtS->execute([$id_course]);
        $schedules = $stmtS->fetchAll(PDO::FETCH_COLUMN);
    }

    if (!empty($schedules)) {
        $inQuery = implode(',', array_fill(0, count($schedules), '?'));
        
        $safeDelete("DELETE FROM enrollment_schedules WHERE schedule_id IN ($inQuery)", $schedules);
        $safeDelete("DELETE FROM schedule_teachers WHERE id_schedule IN ($inQuery)", $schedules);
        $safeDelete("DELETE FROM attendance WHERE id_schedule IN ($inQuery)", $schedules);
    }

    // Tablas opcionales — eliminar si existen
    $safeDelete("DELETE FROM academic_notes WHERE course_id = ?", [$id_course]);
    $safeDelete("DELETE FROM course_assignments WHERE course_id = ?", [$id_course]);
    $safeDelete("DELETE FROM enrollments WHERE course_id = ?", [$id_course]);
    $safeDelete("DELETE FROM schedule_requests WHERE course_id = ?", [$id_course]);

    // Tabla: schedules (los horarios mismos)
    $safeDelete("DELETE FROM schedules WHERE course_id = ?", [$id_course]);
    $safeDelete("DELETE FROM schedules WHERE id_course = ?", [$id_course]);

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