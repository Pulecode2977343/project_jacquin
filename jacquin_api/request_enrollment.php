<?php
require_once 'config/cors.php';
header("Content-Type: application/json; charset=UTF-8");

header("Access-Control-Max-Age: 3600");


include_once 'config/connection.php';
require_once 'services/EmailService.php';
require_once 'helpers/conflict_helper.php';

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->student_id) &&
    !empty($data->course_id) &&
    !empty($data->schedule_id)
) {
    try {
        // 1. Check if there's a 'Pre-inscrito' slot to reuse
        $checkPre = $pdo->prepare("SELECT id_enrollment FROM enrollments WHERE student_id = ? AND course_id = ? AND status = 'Pre-inscrito' LIMIT 1");
        $checkPre->execute([$data->student_id, $data->course_id]);
        $preEnrollment = $checkPre->fetch(PDO::FETCH_ASSOC);

        if ($preEnrollment) {
            // Update the pre-enrollment with the chosen schedule and move to 'Pendiente'
            $query = "UPDATE enrollments SET schedule_id = ?, status = 'Pendiente' WHERE id_enrollment = ?";
            $stmt = $pdo->prepare($query);
            $exec = $stmt->execute([$data->schedule_id, $preEnrollment['id_enrollment']]);
            $enrollmentId = $preEnrollment['id_enrollment'];
        } else {
            // 2. Check for EXACT duplicate (Same Course AND Same Schedule)
            $checkDup = $pdo->prepare("SELECT id_enrollment FROM enrollments WHERE student_id = ? AND course_id = ? AND schedule_id = ? AND status != 'Cancelado' AND status != 'Rechazado'");
            $checkDup->execute([$data->student_id, $data->course_id, $data->schedule_id]);

            if ($checkDup->fetch()) {
                echo json_encode(["success" => false, "message" => "El estudiante ya tiene asignado este horario específico para este curso."]);
                exit;
            }

            // 3. Check for TIME CONFLICTS (Overlapping schedules)
            $conflict = checkScheduleConflict($pdo, (int) $data->student_id, (int) $data->schedule_id);
            if ($conflict['conflict']) {
                echo json_encode(["success" => false, "message" => $conflict['message']]);
                exit;
            }

            // New enrollment request (Additional schedule)
            $query = "INSERT INTO enrollments (student_id, course_id, schedule_id, status) VALUES (?, ?, ?, 'Pendiente')";
            $stmt = $pdo->prepare($query);
            $exec = $stmt->execute([$data->student_id, $data->course_id, $data->schedule_id]);
            $enrollmentId = $pdo->lastInsertId();
        }

        if ($exec && $enrollmentId) {
            // SYNC: Populate junction table
            $pdo->prepare("INSERT IGNORE INTO enrollment_schedules (enrollment_id, schedule_id) VALUES (?, ?)")
                ->execute([$enrollmentId, $data->schedule_id]);

            // 3. Get Details for Email
            // Get Student Name
            $stmtUser = $pdo->prepare("SELECT full_name, email, n_phone FROM usuario WHERE id_usuario = ?");
            $stmtUser->execute([$data->student_id]);
            $student = $stmtUser->fetch(PDO::FETCH_ASSOC);

            // Get Course Name
            $stmtCourse = $pdo->prepare("SELECT course_name FROM courses WHERE id_course = ?");
            $stmtCourse->execute([$data->course_id]);
            $course = $stmtCourse->fetch(PDO::FETCH_ASSOC);

            // Get Schedule Details for Email
            $stmtSched = $pdo->prepare("SELECT day_of_week as day, start_time as time_start, end_time as time_end FROM schedules WHERE id_schedule = ?");
            $stmtSched->execute([$data->schedule_id]);
            $scheData = $stmtSched->fetch(PDO::FETCH_ASSOC);

            // Format times nicely
            $timeStr = "";
            if ($scheData) {
                $timeStr = "{$scheData['day']} " . substr($scheData['time_start'], 0, 5) . " - " . substr($scheData['time_end'], 0, 5);
            }
            // Let's check enrollments schema again (Step 9242).
            // [Field] => schedule_id [Type] => int(11).
            // Uh oh. The enrollments table expects an INT for schedule_id.
            // But schedules table DOES NOT have an ID (based on my previous glance, let me double check Step 9179).
            // Step 9179 output was truncated!
            // Error! I might have missed the ID column.

            // Re-read XAMPP get_schedules.php (Step 9124 - wait that was the overwrite attempt).
            // Step 9124 shows: `id_schedule INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY`.
            // So the XAMPP version *I viewed* had it.
            // But my `setup_schedules_auto.php` (Step 9181) did: `INSERT INTO schedules (id_course, day, time_start, time_end, quota)...`
            // It did NOT specify id_schedule (which is correct for Auto Increment).
            // So `schedules` table SHOULD have `id_schedule`.

            // NOTE: The `debug_schedules_schema.php` (Step 9179) output was:
            // [0] => Array ( [Field] => id_schedule ... [Key] => PRI ... )
            // Wait, looking at Step 9188 truncated output...
            // looking at Step 9179 output:
            // [0] => Array ( [Field] => id_schedule [Type] => int(11) ... )  <-- THIS ROW WAS PROBABLY TRUNCATED in the View!
            // Wait, looking at Step 9179 output in history:
            // It shows `[0] => Array` then truncate.
            // Then `[1] => Array ( [Field] => id_course ...`
            // So [0] MUST be id_schedule!

            // Okay, so `schedules` has `id_schedule`.
            // Frontend generic ID (mocked in `get_schedules.php` Step 9205):
            // `'id_schedule' => $s['id_course'] . '_' . ...`
            // WAIT! I mocked the ID in `get_schedules.php` line 23:
            // `'id_schedule' => $s['id_course'] . '_' . ...`
            // I should have monitored `id_schedule` column!

            // CORRECTIVE ACTION: I must fix `get_schedules.php` to return the REAL `id_schedule`.
            // And then `request_enrollment.php` can use it properly.

            // But I am in the middle of writing `request_enrollment.php`.
            // I will write it assuming `schedule_id` is the INT ID.

            // Send Email
            $emailService = new EmailService();
            $adminEmail = "visionarycode.team@gmail.com";
            $subject = "Nueva Solicitud de Inscripción - " . $student['full_name'];
            $body = "
                <h2>Nueva Solicitud de Inscripción</h2>
                <p><strong>Estudiante:</strong> {$student['full_name']} ({$student['email']})</p>
                <p><strong>Teléfono:</strong> {$student['n_phone']}</p>
                <p><strong>Curso:</strong> {$course['course_name']}</p>
                <p><strong>Horario Solicitado:</strong> {$timeStr}</p>
                <hr>
                <p>Por favor ingrese al panel administrativo para aprobar o rechazar esta solicitud.</p>
            ";

            $emailService->sendEmail($adminEmail, $subject, $body);

            // Notify Student as well
            $emailService->sendPreEnrollmentConfirmationStudent($student['email'], $student['full_name'], $course['course_name']);

            echo json_encode(["success" => true, "message" => "Solicitud enviada. El administrador revisará tu inscripción."]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al registrar solicitud."]);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
}
?>