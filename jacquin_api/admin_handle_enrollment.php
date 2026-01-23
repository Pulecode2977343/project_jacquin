<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config/connection.php';
require_once 'services/EmailService.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id_enrollment) && !empty($data->action)) {
    try {
        $newStatus = ($data->action === 'approve') ? 'Activo' : 'Cancelado'; // Or 'Rechazado'? ENUM has 'Cancelado'.

        $stmt = $pdo->prepare("UPDATE enrollments SET status = ? WHERE id_enrollment = ?");

        if ($stmt->execute([$newStatus, $data->id_enrollment])) {

            // Notify Student
            // Fetch student email and course details
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
                $subject = "Actualización de Inscripción - Academia Jacquin";
                $msgBody = "";

                if ($data->action === 'approve') {
                    $msgBody = "
                        <h2>¡Felicidades, {$info['full_name']}!</h2>
                        <p>Tu solicitud de inscripción al curso <strong>{$info['course_name']}</strong> ha sido <strong>APROBADA</strong>.</p>
                        <p>Ya puedes ver el curso en tu panel de estudiante.</p>
                    ";
                } else {
                    $msgBody = "
                        <h2>Solicitud Rechazada</h2>
                        <p>Hola {$info['full_name']}, lamentamos informarte que tu solicitud para el curso <strong>{$info['course_name']}</strong> no ha sido aprobada en esta ocasión.</p>
                        <p>Por favor contacta con administración para más detalles.</p>
                    ";
                }

                $emailService->sendEmail($info['email'], $subject, $msgBody);
            }

            echo json_encode(["success" => true, "message" => "Solicitud actualizada a " . $newStatus]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al actualizar."]);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
}
?>