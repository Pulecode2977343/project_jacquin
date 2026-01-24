<?php
// get_academic_data.php
// Endpoint unificado para obtener data académica compleja (View-Models)

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

try {
    $action = $_GET['action'] ?? '';
    $courseId = $_GET['course_id'] ?? null;
    $scheduleId = $_GET['schedule_id'] ?? null;
    $studentId = $_GET['student_id'] ?? null;

    if (!$action)
        throw new Exception("Acción requerida");

    // ===============================================
    // TEACHER: GET ROSTER (Lista de Estudiantes)
    // ===============================================
    if ($action === 'get_roster') {
        if (!$courseId)
            throw new Exception("course_id requerido");

        // Obtener estudiantes inscritos en el curso
        // Si se pasa schedule_id, filtrar solo los de ese horario si aplica (depende de lógica de inscripción)
        // En este sistema, la inscripción es por curso, y schedules son parte del curso.
        // Pero attendance es por schedule. 
        // Si queremos lista de estudiantes del curso general:

        $sql = "SELECT u.id_usuario, u.full_name, u.email, u.avatar_url,
                (SELECT COUNT(*) FROM attendance a WHERE a.student_id = u.id_usuario AND a.schedule_id = ? AND a.status = 'absent') as absences
                FROM users u
                JOIN enrollments e ON u.id_usuario = e.student_id
                WHERE e.course_id = ?";

        // CORRECCION: TABLA usuario NO users.
        $sql = "SELECT u.id_usuario, u.full_name, u.email, u.avatar_url
                FROM usuario u
                JOIN enrollments e ON u.id_usuario = e.student_id
                WHERE e.course_id = ?";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$courseId]);
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Si se requiere asistencia, calcularla aparte o joining complicada
        // Vamos a devolver la lista simple primero
        echo json_encode(['success' => true, 'data' => $students]);
        exit;
    }

    // ===============================================
    // TEACHER: GET STUDENTS FOR SPECIFIC SCHEDULE CHECKLIST
    // ===============================================
    if ($action === 'get_schedule_students') {
        // En este modelo, el alumno se inscribe al CURSO.
        // ¿Cómo sabemos a qué HORARIO asiste?
        // Revisemos `enrollment_schedules`?
        // Sí, existe enrollment_schedules (enrollment_id, schedule_id).

        if (!$scheduleId)
            throw new Exception("schedule_id requerido");

        $sql = "SELECT u.id_usuario, u.full_name, u.avatar_url
                FROM usuario u
                JOIN enrollments e ON u.id_usuario = e.student_id
                JOIN enrollment_schedules es ON e.id_enrollment = es.enrollment_id
                WHERE es.schedule_id = ?";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$scheduleId]);
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $students]);
        exit;
    }

    // ===============================================
    // STUDENT: GET MY ASSIGNMENTS
    // ===============================================
    if ($action === 'get_my_assignments') {
        if (!$studentId)
            throw new Exception("student_id requerido");

        $sql = "SELECT a.*, c.course_name as course_name, 
                s.status as submission_status, s.grade, s.feedback
                FROM course_assignments a
                JOIN courses c ON a.course_id = c.id_course
                JOIN enrollments e ON c.id_course = e.course_id
                LEFT JOIN student_submissions s ON a.id = s.assignment_id AND s.student_id = ?
                WHERE e.student_id = ? AND a.is_active = 1
                ORDER BY a.due_date ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$studentId, $studentId]);
        $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $assignments]);
        exit;
    }

    // ===============================================
    // STUDENT: GET MY NOTES
    // ===============================================
    if ($action === 'get_my_notes') {
        if (!$studentId)
            throw new Exception("student_id requerido");

        $sql = "SELECT n.*, c.course_name as course_name, u.full_name as teacher_name
                 FROM academic_notes n
                 JOIN courses c ON n.course_id = c.id_course
                 JOIN usuario u ON n.teacher_id = u.id_usuario
                 WHERE n.student_id = ? AND n.is_private_admin = 0
                 ORDER BY n.created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$studentId]);
        $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $notes]);
        exit;
    }

    throw new Exception("Acción desconocida");

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>