<?php
// teacher_attendance.php
// guardar asistencia

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (empty($input['schedule_id']) || empty($input['date']) || empty($input['students'])) {
            throw new Exception("Datos incompletos");
        }

        $scheduleId = $input['schedule_id'];
        $date = $input['date'];
        $students = $input['students']; // Array de {student_id, status, notes}
        $recordedBy = isset($input['recorded_by']) ? $input['recorded_by'] : 0;

        $pdo->beginTransaction();

        // Nota: El esquema usa class_date.recorded_by es obligatorio.
        $stmt = $pdo->prepare("INSERT INTO attendance (schedule_id, student_id, class_date, status, notes, recorded_by) 
                               VALUES (?, ?, ?, ?, ?, ?)
                               ON DUPLICATE KEY UPDATE 
                               status = VALUES(status), 
                               notes = VALUES(notes),
                               recorded_by = VALUES(recorded_by)");

        foreach ($students as $student) {
            $stmt->execute([
                $scheduleId,
                $student['student_id'],
                $date,
                $student['status'],
                isset($student['notes']) ? $student['notes'] : null,
                $recordedBy
            ]);
        }

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Asistencia guardada']);
    } else {
        // GET Attendance for specific date/schedule
        if (empty($_GET['schedule_id']) || empty($_GET['date']))
            throw new Exception("Params requeridos");

        $sql = "SELECT student_id, status, notes FROM attendance WHERE schedule_id = ? AND class_date = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$_GET['schedule_id'], $_GET['date']]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $data]);
    }

} catch (Exception $e) {
    if ($pdo->inTransaction())
        $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>