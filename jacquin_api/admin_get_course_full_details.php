<?php
include_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';
require_once 'helpers/auth_helper.php';

// Protegemos el endpoint: Solo administradores
validateAdmin();

$course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : 0;

if ($course_id > 0) {
    try {
        // 1. Course Info
        $stmt = $pdo->prepare("SELECT * FROM courses WHERE id_course = ?");
        $stmt->execute([$course_id]);
        $course = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($course) {
            // 2. Schedules
            // Join with teacher info if available (assuming teacher_id in schedules or courses)
            // For now, let's assume teacher is in SCHEDULES based on commonly seen patterns, 
            // OR we'll adjust after seeing the DESCRIBE output. 
            // I'll write a generic query first and refine it if the schema differs.

            // HYPOTHESIS: teacher_id is likely in schedules as different schedules can have different teachers?
            // OR in courses if one teacher per course.
            // Let's assume per schedule for flexibility, or per course.
            // I'll check the DESCRIBE output in a moment, but I'll scaffold this to be ready.

            // Let's grab schedules first.
            $stmtSched = $pdo->prepare("
                SELECT s.*, 
                       (SELECT GROUP_CONCAT(u.full_name SEPARATOR ', ') 
                        FROM schedule_teachers st 
                        JOIN usuario u ON st.id_teacher = u.id_usuario 
                        WHERE st.id_schedule = s.id_schedule) as teacher_names,
                       (SELECT GROUP_CONCAT(st.id_teacher SEPARATOR ',') 
                        FROM schedule_teachers st 
                        WHERE st.id_schedule = s.id_schedule) as teacher_ids,
                       (SELECT COUNT(*) 
                        FROM enrollment_schedules es 
                        JOIN enrollments e ON es.enrollment_id = e.id_enrollment 
                        WHERE es.schedule_id = s.id_schedule AND e.status = 'Activo') as enrolled_count,
                       u_legacy.full_name as legacy_teacher_name
                FROM schedules s
                LEFT JOIN usuario u_legacy ON s.teacher_id = u_legacy.id_usuario 
                WHERE s.id_course = ?
                ORDER BY FIELD(s.day, 'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'), s.time_start
            ");
            $stmtSched->execute([$course_id]);
            $schedules = $stmtSched->fetchAll(PDO::FETCH_ASSOC);

            // Fetch detailed teacher info for all these schedules
            // We use FETCH_GROUP to group by id_schedule automatically
            $stmtTeachers = $pdo->prepare("
                SELECT st.id_schedule, u.id_usuario as id, u.full_name as name
                FROM schedule_teachers st
                JOIN usuario u ON st.id_teacher = u.id_usuario
                WHERE st.id_schedule IN (
                    SELECT id_schedule FROM schedules WHERE id_course = ?
                )
            ");
            $stmtTeachers->execute([$course_id]);
            $teachersMap = $stmtTeachers->fetchAll(PDO::FETCH_GROUP | PDO::FETCH_ASSOC);

            // Post-process to attach teachers array and legacy support
            foreach ($schedules as &$sch) {
                // Attach structured teachers array from junction table
                $sch['teachers'] = isset($teachersMap[$sch['id_schedule']]) ? $teachersMap[$sch['id_schedule']] : [];

                // If junction table has no entry but legacy column does, build synthetic entry
                if (empty($sch['teachers']) && !empty($sch['legacy_teacher_name']) && !empty($sch['teacher_id'])) {
                    $sch['teachers'] = [['id' => (int)$sch['teacher_id'], 'name' => $sch['legacy_teacher_name']]];
                }

                // Validar legacy/display string
                if (!empty($sch['teacher_names'])) {
                    $sch['teacher_name'] = $sch['teacher_names'];
                } elseif (!empty($sch['teachers'])) {
                    $names = array_column($sch['teachers'], 'name');
                    $sch['teacher_name'] = implode(', ', $names);
                } else {
                    $sch['teacher_name'] = $sch['legacy_teacher_name'];
                }
            }

            // 3. Enrolled Students (Accepted)
            $stmtEnroll = $pdo->prepare("
                SELECT e.id_enrollment, u.full_name as student_name, u.email, e.status, DATE_FORMAT(e.enrollment_date, '%Y-%m-%d') as enrollment_date
                FROM enrollments e
                JOIN usuario u ON e.student_id = u.id_usuario
                WHERE e.course_id = ? AND e.status = 'Activo'
            ");
            $stmtEnroll->execute([$course_id]);
            $students = $stmtEnroll->fetchAll(PDO::FETCH_ASSOC);

            // Fetch assigned schedules for students
             if (!empty($students)) {
                $enrollmentIds = array_column($students, 'id_enrollment');
                if (!empty($enrollmentIds)) {
                    $inQuery = implode(',', array_fill(0, count($enrollmentIds), '?'));
                    $stmtStudSched = $pdo->prepare("
                        SELECT es.enrollment_id, s.day, s.time_start, s.time_end
                        FROM enrollment_schedules es
                        JOIN schedules s ON es.schedule_id = s.id_schedule
                        WHERE es.enrollment_id IN ($inQuery)
                    ");
                    $stmtStudSched->execute($enrollmentIds);
                    $studSchedMap = $stmtStudSched->fetchAll(PDO::FETCH_GROUP | PDO::FETCH_ASSOC);

                    foreach ($students as &$stud) {
                        $stud['schedules_assigned'] = isset($studSchedMap[$stud['id_enrollment']]) ? $studSchedMap[$stud['id_enrollment']] : [];
                    }
                }
            }

            // 4. Pending Requests (Now including Pre-inscrito)
            // Fetching schedules via enrollment_schedules table
            $stmtPending = $pdo->prepare("
                SELECT e.id_enrollment, u.full_name as student_name, u.email, e.status, DATE_FORMAT(e.enrollment_date, '%Y-%m-%d') as request_date,
                       (SELECT GROUP_CONCAT(CONCAT(s.day, ' ', LEFT(s.time_start, 5), '-', LEFT(s.time_end, 5)) SEPARATOR ', ')
                        FROM enrollment_schedules es
                        JOIN schedules s ON es.schedule_id = s.id_schedule
                        WHERE es.enrollment_id = e.id_enrollment) as schedule_info,
                       (SELECT s.id_schedule FROM enrollment_schedules es JOIN schedules s ON es.schedule_id = s.id_schedule WHERE es.enrollment_id = e.id_enrollment LIMIT 1) as id_schedule,
                       (SELECT s.day FROM enrollment_schedules es JOIN schedules s ON es.schedule_id = s.id_schedule WHERE es.enrollment_id = e.id_enrollment LIMIT 1) as day,
                       (SELECT s.time_start FROM enrollment_schedules es JOIN schedules s ON es.schedule_id = s.id_schedule WHERE es.enrollment_id = e.id_enrollment LIMIT 1) as time_start
                FROM enrollments e
                JOIN usuario u ON e.student_id = u.id_usuario
                WHERE e.course_id = ? AND e.status IN ('Pendiente', 'Pre-inscrito')
            ");
            $stmtPending->execute([$course_id]);
            $pending = $stmtPending->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true,
                "data" => [
                    "info" => $course,
                    "schedules" => $schedules,
                    "students" => $students,
                    "pending" => $pending
                ]
            ]);

        } else {
            echo json_encode(["success" => false, "message" => "Curso no encontrado."]);
        }
    } catch (Exception $e) {
        // If it fails (e.g. unknown column teacher_id), let's catch it.
        echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "ID requerido."]);
}
?>