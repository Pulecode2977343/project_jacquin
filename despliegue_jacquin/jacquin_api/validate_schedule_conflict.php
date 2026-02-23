<?php
/**
 * Validate Schedule Conflict
 * Checks if a student has a time conflict with a new schedule.
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config/connection.php';

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->student_id) || !isset($data->new_schedule_id)) {
        throw new Exception("Datos incompletos.");
    }

    $studentId = $data->student_id;
    $newScheduleId = $data->new_schedule_id;

    // 1. Get New Schedule Details
    $stmtNew = $pdo->prepare("SELECT day, time_start, time_end FROM schedules WHERE id_schedule = ?");
    $stmtNew->execute([$newScheduleId]);
    $newSchedule = $stmtNew->fetch(PDO::FETCH_ASSOC);

    if (!$newSchedule) {
        throw new Exception("El horario seleccionado no existe.");
    }

    $newDay = $newSchedule['day'];
    $newStart = $newSchedule['time_start'];
    $newEnd = $newSchedule['time_end'];

    // 2. Get Existing Schedules for Student
    // Join enrollments -> enrollment_schedules -> schedules
    $sql = "
        SELECT 
            s.id_schedule, 
            s.day, 
            s.time_start, 
            s.time_end, 
            c.name as course_name 
        FROM enrollments e
        JOIN enrollment_schedules es ON e.id_enrollment = es.enrollment_id
        JOIN schedules s ON es.schedule_id = s.id_schedule
        JOIN courses c ON e.course_id = c.id_course
        WHERE e.student_id = ? 
        AND (e.status = 'Inscrito' OR e.status = 'Activo')
    ";

    $stmtExisting = $pdo->prepare($sql);
    $stmtExisting->execute([$studentId]);
    $existingSchedules = $stmtExisting->fetchAll(PDO::FETCH_ASSOC);

    $conflict = false;
    $conflictDetails = null;

    foreach ($existingSchedules as $existing) {
        // Check Day Match
        if ($existing['day'] === $newDay) {
            // Check Time Overlap
            // Conflict if: NewStart < ExistingEnd AND NewEnd > ExistingStart
            if ($newStart < $existing['time_end'] && $newEnd > $existing['time_start']) {
                $conflict = true;
                $conflictDetails = [
                    "course" => $existing['course_name'],
                    "day" => $existing['day'],
                    "time" => substr($existing['time_start'], 0, 5) . " - " . substr($existing['time_end'], 0, 5)
                ];
                break;
            }
        }
    }

    if ($conflict) {
        echo json_encode([
            "success" => false,
            "conflict" => true,
            "message" => "Conflicto de horario detectado con el curso: " . $conflictDetails['course'] . " (" . $conflictDetails['time'] . ")"
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