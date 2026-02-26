<?php
/**
 * conflict_helper.php
 * Helper function to check if a student has an existing schedule conflict.
 */

function checkScheduleConflict($pdo, $studentId, $newScheduleId)
{
    // 1. Get New Schedule Details
    $stmtNew = $pdo->prepare("SELECT day, time_start, time_end FROM schedules WHERE id_schedule = ?");
    $stmtNew->execute([$newScheduleId]);
    $newSchedule = $stmtNew->fetch(PDO::FETCH_ASSOC);

    if (!$newSchedule) {
        return ["conflict" => false, "message" => "Horario no encontrado"];
    }

    $newDay = $newSchedule['day'];
    $newStart = $newSchedule['time_start'];
    $newEnd = $newSchedule['time_end'];

    // 2. Get Existing Active/Pending Schedules for the student
    // Union to capture both single-day and multi-day models
    $sql = "
        SELECT s.id_schedule, s.day, s.time_start, s.time_end, c.course_name
        FROM enrollments e
        JOIN schedules s ON e.schedule_id = s.id_schedule
        JOIN courses c ON e.course_id = c.id_course
        WHERE e.student_id = ? 
        AND e.status IN ('Activo', 'Inscrito', 'Pendiente')
        
        UNION
        
        SELECT s.id_schedule, s.day, s.time_start, s.time_end, c.course_name
        FROM enrollments e
        JOIN enrollment_schedules es ON e.id_enrollment = es.enrollment_id
        JOIN schedules s ON es.schedule_id = s.id_schedule
        JOIN courses c ON e.course_id = c.id_course
        WHERE e.student_id = ? 
        AND e.status IN ('Activo', 'Inscrito', 'Pendiente')
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$studentId, $studentId]);
    $existingSchedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($existingSchedules as $existing) {
        // Skip if it is the EXACT same schedule (this is handled by duplicate checks elsewhere)
        if ((int) $existing['id_schedule'] === (int) $newScheduleId)
            continue;

        if ($existing['day'] === $newDay) {
            // Overlap check: NewStart < ExistingEnd AND NewEnd > ExistingStart
            if ($newStart < $existing['time_end'] && $newEnd > $existing['time_start']) {
                $timeFormatted = substr($existing['time_start'], 0, 5) . " - " . substr($existing['time_end'], 0, 5);
                return [
                    "conflict" => true,
                    "message" => "Su inscripción no puede ser procesada. Ya tiene el curso \"{$existing['course_name']}\" activo en ese horario ({$existing['day']} {$timeFormatted})."
                ];
            }
        }
    }

    return ["conflict" => false];
}
