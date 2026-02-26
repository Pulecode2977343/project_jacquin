<?php
include_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config/connection.php';
require_once 'services/EmailService.php';
require_once 'helpers/auth_helper.php';

// Protegemos el endpoint: Solo administradores
validateAdmin();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id_enrollment) && !empty($data->action)) {
    try {
        $newStatus = ($data->action === 'approve') ? 'Activo' : 'Cancelado';

        $pdo->beginTransaction();

        $stmt = $pdo->prepare("UPDATE enrollments SET status = ? WHERE id_enrollment = ?");
        $stmt->execute([$newStatus, $data->id_enrollment]);

        // Si aprobamos: insertar en enrollment_schedules si el enrollment tiene schedule_id
        if ($data->action === 'approve') {
            $stmtSched = $pdo->prepare("
                SELECT schedule_id FROM enrollments
                WHERE id_enrollment = ? AND schedule_id IS NOT NULL
            ");
            $stmtSched->execute([$data->id_enrollment]);
            $schedRow = $stmtSched->fetch(PDO::FETCH_ASSOC);

            if ($schedRow && !empty($schedRow['schedule_id'])) {
                // Insertar en junction table (ignorar si ya existe)
                $stmtIns = $pdo->prepare("
                    INSERT IGNORE INTO enrollment_schedules (enrollment_id, schedule_id)
                    VALUES (?, ?)
                ");
                $stmtIns->execute([$data->id_enrollment, $schedRow['schedule_id']]);
            }
        }

        $pdo->commit();

        if (true) {
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

                $safeName   = htmlspecialchars($info['full_name']);
                $safeCourse = htmlspecialchars($info['course_name']);

                if ($data->action === 'approve') {
                    $subject = "🎉 ¡Inscripción aprobada! - Academia Jacquin";
                    $msgBody = "
                    <!DOCTYPE html><html lang='es'><head><meta charset='UTF-8'></head>
                    <body style='margin:0;padding:0;background:#f0f2f5;font-family:Arial,sans-serif;'>
                      <table width='100%' cellpadding='0' cellspacing='0' style='background:#f0f2f5;padding:30px 0;'>
                        <tr><td align='center'>
                          <table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);'>
                            <tr><td style='background:#0d1926;padding:28px 40px;text-align:center;'>
                              <h1 style='margin:0;color:#E78C3B;font-size:24px;'>Academia Jacquin</h1>
                            </td></tr>
                            <tr><td style='padding:36px 40px;'>
                              <div style='text-align:center;margin-bottom:24px;'>
                                <div style='width:64px;height:64px;background:#d4edda;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:30px;'>✅</div>
                              </div>
                              <h2 style='color:#0d1926;font-size:22px;text-align:center;margin:0 0 12px;'>¡Felicidades, {$safeName}!</h2>
                              <p style='color:#4a5568;font-size:15px;line-height:1.7;text-align:center;margin:0 0 24px;'>
                                Tu inscripción al programa <strong>{$safeCourse}</strong> ha sido <span style='color:#27ae60;font-weight:bold;'>APROBADA</span>.<br>
                                Ya puedes acceder al curso desde tu panel de estudiante.
                              </p>
                              <table width='100%'><tr><td align='center'>
                                <a href='https://academiajacquin.infinityfreeapp.com/gestion.html' style='display:inline-block;background:#E78C3B;color:#fff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:14px;font-weight:bold;'>
                                  Ir a mi Panel
                                </a>
                              </td></tr></table>
                            </td></tr>
                            <tr><td style='background:#f7f8fa;padding:14px 40px;text-align:center;border-top:1px solid #e2e8f0;'>
                              <p style='margin:0;color:#a0aec0;font-size:11px;'>© " . date('Y') . " Academia Jacquin</p>
                            </td></tr>
                          </table>
                        </td></tr>
                      </table>
                    </body></html>";
                } else {
                    $subject = "Actualización de tu solicitud - Academia Jacquin";
                    $msgBody = "
                    <!DOCTYPE html><html lang='es'><head><meta charset='UTF-8'></head>
                    <body style='margin:0;padding:0;background:#f0f2f5;font-family:Arial,sans-serif;'>
                      <table width='100%' cellpadding='0' cellspacing='0' style='background:#f0f2f5;padding:30px 0;'>
                        <tr><td align='center'>
                          <table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);'>
                            <tr><td style='background:#0d1926;padding:28px 40px;text-align:center;'>
                              <h1 style='margin:0;color:#E78C3B;font-size:24px;'>Academia Jacquin</h1>
                            </td></tr>
                            <tr><td style='padding:36px 40px;'>
                              <h2 style='color:#0d1926;font-size:20px;margin:0 0 12px;'>Hola, {$safeName}</h2>
                              <p style='color:#4a5568;font-size:15px;line-height:1.7;margin:0 0 20px;'>
                                Lamentamos informarte que en esta ocasión tu solicitud para el programa <strong>{$safeCourse}</strong> no pudo ser procesada.
                              </p>
                              <p style='color:#4a5568;font-size:15px;line-height:1.7;margin:0 0 24px;'>
                                Puedes contactarnos directamente para conocer más detalles o explorar otras opciones disponibles.
                              </p>
                              <table width='100%'><tr><td align='center'>
                                <a href='https://academiajacquin.infinityfreeapp.com/contactenos.html' style='display:inline-block;background:#0d1926;color:#E78C3B;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:14px;font-weight:bold;border:2px solid #E78C3B;'>
                                  Contáctanos
                                </a>
                              </td></tr></table>
                            </td></tr>
                            <tr><td style='background:#f7f8fa;padding:14px 40px;text-align:center;border-top:1px solid #e2e8f0;'>
                              <p style='margin:0;color:#a0aec0;font-size:11px;'>© " . date('Y') . " Academia Jacquin</p>
                            </td></tr>
                          </table>
                        </td></tr>
                      </table>
                    </body></html>";
                }

                $emailService->sendEmail($info['email'], $subject, $msgBody);
            }

            echo json_encode(["success" => true, "message" => "Solicitud actualizada a " . $newStatus]);
        }

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
}
?>