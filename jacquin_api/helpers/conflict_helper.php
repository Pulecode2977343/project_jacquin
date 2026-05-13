<?php
/**
 * conflict_helper.php
 * Funciones de ayuda para verificar conflictos de horario (Estudiantes y Docentes).
 */

/**
 * Verifica si un estudiante tiene cruces de horario.
 */
function checkScheduleConflict($pdo, $studentId, $newScheduleId)
{
    // 1. Obtener detalles del nuevo horario
    $stmtNew = $pdo->prepare("SELECT day_of_week as day, start_time as time_start, end_time as time_end FROM schedules WHERE id_schedule = ?");
    $stmtNew->execute([$newScheduleId]);
    $newSchedule = $stmtNew->fetch(PDO::FETCH_ASSOC);

    if (!$newSchedule) {
        return ["conflict" => false, "message" => "Horario no encontrado"];
    }

    $newDay = $newSchedule['day'];
    $newStart = $newSchedule['time_start'];
    $newEnd = $newSchedule['time_end'];

    // 2. Obtener inscripciones activas/pendientes del estudiante
    $sql = "
        SELECT s.id_schedule, s.day_of_week as day, s.start_time as time_start, s.end_time as time_end, c.course_name
        FROM enrollments e
        JOIN schedules s ON e.schedule_id = s.id_schedule
        JOIN courses c ON e.course_id = c.id_course
        WHERE e.student_id = ? 
        AND e.status IN ('Activo', 'Inscrito', 'Pendiente')
        
        UNION
        
        SELECT s.id_schedule, s.day_of_week as day, s.start_time as time_start, s.end_time as time_end, c.course_name
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
        if ((int) $existing['id_schedule'] === (int) $newScheduleId) continue;

        if ($existing['day'] == $newDay) {
            if ($newStart < $existing['time_end'] && $newEnd > $existing['time_start']) {
                $timeFormatted = substr($existing['time_start'], 0, 5) . " - " . substr($existing['time_end'], 0, 5);
                return [
                    "conflict" => true,
                    "message" => "El estudiante ya tiene el curso \"{$existing['course_name']}\" en ese horario ({$newDay} {$timeFormatted})."
                ];
            }
        }
    }

    return ["conflict" => false];
}

/**
 * Verifica si un docente/administrador tiene conflictos en un horario específico.
 */
function checkTeacherTimeConflict($pdo, $id_teacher, $day_index, $start_time, $end_time, $exclude_schedule_id = 0) {
    try {
        if (strlen($start_time) == 5) $start_time .= ":00";
        if (strlen($end_time) == 5) $end_time .= ":00";

        $sql = "SELECT c.course_name, s.start_time, s.end_time
                FROM schedules s
                JOIN courses c ON s.course_id = c.id_course
                WHERE (s.teacher_id = :id_t 
                       OR s.id_schedule IN (SELECT id_schedule FROM schedule_teachers WHERE id_teacher = :id_t2))
                AND s.day_of_week = :day
                AND s.id_schedule != :exclude
                AND (s.start_time < :endT AND s.end_time > :startT)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id_t' => $id_teacher,
            ':id_t2' => $id_teacher,
            ':day' => $day_index,
            ':exclude' => $exclude_schedule_id,
            ':startT' => $start_time,
            ':endT' => $end_time
        ]);

        $conflict = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($conflict) {
            $tStmt = $pdo->prepare("SELECT full_name FROM usuario WHERE id_usuario = ?");
            $tStmt->execute([$id_teacher]);
            $name = $tStmt->fetchColumn() ?: "El docente";

            return [
                'status' => 'error',
                'message' => "Conflicto: {$name} ya tiene el curso \"{$conflict['course_name']}\" de " . 
                             substr($conflict['start_time'], 0, 5) . " a " . substr($conflict['end_time'], 0, 5) . " este día."
            ];
        }

        return ['status' => 'success'];
    } catch (Exception $e) {
        return ['status' => 'error', 'message' => "Error validando horarios: " . $e->getMessage()];
    }
}

/**
 * Verifica si un docente tiene conflictos para un id_schedule existente.
 */
function checkTeacherScheduleConflict($pdo, $id_teacher, $id_schedule) {
    try {
        $stmt = $pdo->prepare("SELECT day_of_week, start_time, end_time FROM schedules WHERE id_schedule = ?");
        $stmt->execute([$id_schedule]);
        $target = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$target) return ['status' => 'success'];

        return checkTeacherTimeConflict(
            $pdo, 
            $id_teacher, 
            $target['day_of_week'], 
            $target['start_time'], 
            $target['end_time'], 
            $id_schedule
        );
    } catch (Exception $e) {
        return ['status' => 'error', 'message' => "Error: " . $e->getMessage()];
    }
}
