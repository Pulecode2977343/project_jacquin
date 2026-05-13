<?php
/**
 * Validate Schedule Conflict
 * Checks if a student has a time conflict with a new schedule.
 */
require_once __DIR__ . '/config/cors.php';
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once __DIR__ . '/config/connection.php';

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->student_id) || !isset($data->new_schedule_id)) {
        throw new Exception("Datos incompletos.");
    }

    $studentId = $data->student_id;
    $newScheduleId = $data->new_schedule_id;

    // 1. Get New Schedule Details (correct column names)
    $stmtNew = $pdo->prepare("SELECT day_of_week, start_time, end_time FROM schedules WHERE id_schedule = ?");
    $stmtNew->execute([$newScheduleId]);
    $newSchedule = $stmtNew->fetch(PDO::FETCH_ASSOC);

    if (!$newSchedule) {
        throw new Exception("El horario seleccionado no existe.");
    }

    $newDay = $newSchedule['day_of_week'];
    $newStart = $newSchedule['start_time'];
    $newEnd = $newSchedule['end_time'];

    // 2. Get Existing Schedules for Student
    // Union to capture both single-schedule and multi-schedule enrollment models
    $sql = "
        SELECT 
            s.id_schedule, 
            s.day_of_week, 
            s.start_time, 
            s.end_time, 
            c.course_name 
        FROM enrollments e
        JOIN schedules s ON e.schedule_id = s.id_schedule
        JOIN courses c ON e.course_id = c.id_course
        WHERE e.student_id = ? 
        AND e.status IN ('Activo', 'Inscrito', 'Pendiente')

        UNION

        SELECT 
            s.id_schedule, 
            s.day_of_week, 
            s.start_time, 
            s.end_time, 
            c.course_name 
        FROM enrollments e
        JOIN enrollment_schedules es ON e.id_enrollment = es.enrollment_id
        JOIN schedules s ON es.schedule_id = s.id_schedule
        JOIN courses c ON e.course_id = c.id_course
        WHERE e.student_id = ? 
        AND e.status IN ('Activo', 'Inscrito', 'Pendiente')
    ";

    $stmtExisting = $pdo->prepare($sql);
    $stmtExisting->execute([$studentId, $studentId]);
    $existingSchedules = $stmtExisting->fetchAll(PDO::FETCH_ASSOC);

    $conflict = false;
    $conflictDetails = null;

    foreach ($existingSchedules as $existing) {
        // Skip same schedule
        if ((int)$existing['id_schedule'] === (int)$newScheduleId) continue;

        // Check Day Match
        if ($existing['day_of_week'] === $newDay) {
            // Check Time Overlap: NewStart < ExistingEnd AND NewEnd > ExistingStart
            if ($newStart < $existing['end_time'] && $newEnd > $existing['start_time']) {
                $conflict = true;
                $conflictDetails = [
                    "course" => $existing['course_name'],
                    "day" => $existing['day_of_week'],
                    "time" => substr($existing['start_time'], 0, 5) . " - " . substr($existing['end_time'], 0, 5)
                ];
                break;
            }
        }
    }

    if ($conflict) {
        echo json_encode([
            "success" => false,
            "conflict" => true,
            "message" => "Su inscripción no puede ser procesada. Ya tiene el curso \"" . $conflictDetails['course'] . "\" activo en ese horario (" . $conflictDetails['time'] . ")."
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "conflict" => false,
            "message" => "No hay conflictos."
        ]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>