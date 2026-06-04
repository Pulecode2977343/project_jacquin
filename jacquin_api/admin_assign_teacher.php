<?php
include_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
// Last Updated: 2026-01-06 (Fix for id_course column)

include_once 'config/connection.php';
require_once 'helpers/auth_helper.php';
require_once 'helpers/audit_helper.php';

// Solo administradores pueden asignar docentes
validateAdmin();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->schedule_id) || (!isset($data->teacher_id) && !isset($data->teacher_ids))) {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
    exit;
}

try {
    // 1. Get details of the target schedule
    // FIX: Use correct columns: start_time, end_time, and course_id
    $stmtTarget = $pdo->prepare("SELECT day_of_week, start_time, end_time, course_name FROM schedules s JOIN courses c ON s.course_id = c.id_course WHERE id_schedule = ?");
    $stmtTarget->execute([$data->schedule_id]);
    $targetSchedule = $stmtTarget->fetch(PDO::FETCH_ASSOC);

    if (!$targetSchedule) {
        echo json_encode(["success" => false, "message" => "Horario no encontrado."]);
        exit;
    }

    // Handle 'teacher_id' as array or single value
    $teacherIds = [];
    if (isset($data->teacher_ids) && is_array($data->teacher_ids)) {
        $teacherIds = $data->teacher_ids;
    } elseif (isset($data->teacher_id) && $data->teacher_id !== 'remove') {
        $teacherIds = [$data->teacher_id];
    }

    // Handle explicit single removal
    if (isset($data->action) && $data->action === 'remove_single' && isset($data->teacher_id)) {
        $pdo->prepare("DELETE FROM schedule_teachers WHERE id_schedule = ? AND id_teacher = ?")->execute([$data->schedule_id, $data->teacher_id]);
        
        // Check if any teachers remain; if not, clear legacy column
        $count = $pdo->query("SELECT COUNT(*) FROM schedule_teachers WHERE id_schedule = {$data->schedule_id}")->fetchColumn();
        if ($count == 0) {
           $pdo->prepare("UPDATE schedules SET teacher_id = NULL WHERE id_schedule = ?")->execute([$data->schedule_id]);
        }
        
        echo json_encode(["success" => true, "message" => "Docente desasignado."]);
        exit;
    }

    if (empty($teacherIds) && isset($data->teacher_id) && $data->teacher_id === 'remove') {
        // Clear all assignments
        $pdo->prepare("DELETE FROM schedule_teachers WHERE id_schedule = ?")->execute([$data->schedule_id]);
        $pdo->prepare("UPDATE schedules SET teacher_id = NULL WHERE id_schedule = ?")->execute([$data->schedule_id]);
        echo json_encode(["success" => true, "message" => "Todos los docentes desasignados."]);
        exit;
    }

    // 2. Conflict Checking for EACH teacher
    foreach ($teacherIds as $tid) {
        $stmtUser = $pdo->prepare("SELECT full_name FROM usuario WHERE id_usuario = ?");
        $stmtUser->execute([$tid]);
        $teacherName = $stmtUser->fetchColumn();

        // Check conflicts in schedule_teachers table
        // Conflict if: Same Teacher, Same Day, Overlapping Time, Different Schedule ID
        $query = "
            SELECT c.course_name 
            FROM schedule_teachers st
            JOIN schedules s ON st.id_schedule = s.id_schedule
            JOIN courses c ON s.course_id = c.id_course
            WHERE st.id_teacher = :tid 
            AND s.day_of_week = :day 
            AND s.id_schedule != :sid
            AND (
                (s.start_time < :end_time AND s.end_time > :start_time)
            )
        ";
        
        $stmtConflict = $pdo->prepare($query);
        $stmtConflict->execute([
            ':tid' => $tid,
            ':day' => $targetSchedule['day_of_week'],
            ':sid' => $data->schedule_id,
            ':start_time' => $targetSchedule['start_time'],
            ':end_time' => $targetSchedule['end_time']
        ]);

        $conflict = $stmtConflict->fetch(PDO::FETCH_ASSOC);
        if ($conflict) {
            echo json_encode([
                "success" => false,
                "message" => "La asignación no puede ser procesada. El docente {$teacherName} ya tiene el curso \"{$conflict['course_name']}\" activo en ese horario. Por favor selecciona un horario diferente."
            ]);
            exit;
        }
    }

    // 3. Apply Assignments
    $pdo->beginTransaction();
    
    // Clear old
    $pdo->prepare("DELETE FROM schedule_teachers WHERE id_schedule = ?")->execute([$data->schedule_id]);
    
    // Insert new
    $stmtInsert = $pdo->prepare("INSERT INTO schedule_teachers (id_schedule, id_teacher) VALUES (?, ?)");
    foreach ($teacherIds as $tid) {
        $stmtInsert->execute([$data->schedule_id, $tid]);
    }

    // Force NULL for legacy column to ensure schedule_teachers is the single source of truth
    $pdo->prepare("UPDATE schedules SET teacher_id = NULL WHERE id_schedule = ?")->execute([$data->schedule_id]);

    $pdo->commit();

    // Audit Log
    logAudit($pdo, 'update', 'schedule', $data->schedule_id, [
        'info' => "Se asignó docente(s) al horario",
        'teacher_ids' => $teacherIds
    ]);

    echo json_encode(["success" => true, "message" => "Docentes asignados correctamente."]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>