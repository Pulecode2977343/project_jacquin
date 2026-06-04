<?php
/**
 * admin_handle_enrollment.php
 * Aprueba o Rechaza solicitudes de inscripción.
 */
include_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config/connection.php';
require_once 'services/EmailService.php';
require_once 'helpers/auth_helper.php';
require_once 'helpers/audit_helper.php';

// Protegemos el endpoint: Administradores o Secretarios
validateAdminOrSecretary($pdo);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id_enrollment) && !empty($data->action)) {
    try {
        $newStatus = ($data->action === 'approve') ? 'Activo' : 'Cancelado';

        $pdo->beginTransaction();

        $stmt = $pdo->prepare("UPDATE enrollments SET status = ? WHERE id_enrollment = ?");
        $stmt->execute([$newStatus, $data->id_enrollment]);

        if ($data->action === 'approve') {
            $stmtSched = $pdo->prepare("SELECT schedule_id FROM enrollments WHERE id_enrollment = ? AND schedule_id IS NOT NULL");
            $stmtSched->execute([$data->id_enrollment]);
            $schedRow = $stmtSched->fetch(PDO::FETCH_ASSOC);

            if ($schedRow && !empty($schedRow['schedule_id'])) {
                $pdo->prepare("INSERT IGNORE INTO enrollment_schedules (enrollment_id, schedule_id) VALUES (?, ?)")
                    ->execute([$data->id_enrollment, $schedRow['schedule_id']]);
            }
        }

        // Auditoría
        logAudit($pdo, 'update', 'enrollment', $data->id_enrollment, [
            'action' => $data->action,
            'new_status' => $newStatus
        ]);

        $pdo->commit();

        // Notify Student
        $stmtInfo = $pdo->prepare("
            SELECT u.email, u.full_name, c.course_name
            FROM enrollments e
            JOIN usuario u ON e.student_id = u.id_usuario
            JOIN courses c ON e.course_id = c.id_course
            WHERE e.id_enrollment = ?
        ");
        $stmtInfo->execute([$data->id_enrollment]);
        $info = $stmtInfo->fetch(PDO::FETCH_ASSOC);

        if ($info) {
            $emailService = new EmailService();

            if ($data->action === 'approve') {
                $stmtSched = $pdo->prepare("
                    SELECT s.day_of_week as day, s.start_time as time_start, s.end_time as time_end FROM schedules s
                    JOIN enrollments e ON e.schedule_id = s.id_schedule WHERE e.id_enrollment = ?
                    UNION
                    SELECT s.day_of_week as day, s.start_time as time_start, s.end_time as time_end FROM schedules s
                    JOIN enrollment_schedules es ON es.schedule_id = s.id_schedule WHERE es.enrollment_id = ?
                    ORDER BY FIELD(day,'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'), time_start
                ");
                $stmtSched->execute([$data->id_enrollment, $data->id_enrollment]);
                $scheduleDetails = $stmtSched->fetchAll(PDO::FETCH_ASSOC);

                if (!empty($scheduleDetails)) {
                    $emailService->sendEnrollmentConfirmation($info['email'], $info['full_name'], $info['course_name'], $scheduleDetails);
                }
            } else {
                // Rejection: Simplified message
                $emailService->sendEmail($info['email'], "Actualización de tu solicitud - Academia Jacquin", "Hola {$info['full_name']}, tu solicitud para el curso {$info['course_name']} ha sido rechazada.");
            }
        }

        echo json_encode(["success" => true, "message" => "Solicitud actualizada a " . $newStatus]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
}