<?php
require_once 'config/cors.php';
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';

$id_usuario = isset($_GET['id']) ? intval($_GET['id']) : 0;

// Helper to normalize corrupted ENUM day names
function normalizeDayName($raw) {
    if (!$raw) return $raw;
    $lower = mb_strtolower($raw, 'UTF-8');
    if (strpos($lower, 'lu') === 0) return 'Lunes';
    if (strpos($lower, 'ma') === 0) return 'Martes';
    if (strpos($lower, 'mi') === 0) return 'Miércoles';
    if (strpos($lower, 'ju') === 0) return 'Jueves';
    if (strpos($lower, 'vi') === 0) return 'Viernes';
    if (strpos($lower, 's') === 0) return 'Sábado';
    if (strpos($lower, 'do') === 0) return 'Domingo';
    return $raw;
}

$result = [
    'user_info' => null,
    'enrollments' => [],
    'academic_load' => [],
    'functions' => [],
    'pending' => []
];

if ($id_usuario > 0) {
    try {
        // 1. User Info
        $stmt = $pdo->prepare("SELECT id_usuario, full_name, email, n_phone, address, avatar_url, id_rol FROM usuario WHERE id_usuario = ?");
        $stmt->execute([$id_usuario]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $result['user_info'] = $user;

            // 2. Enrollments (Student) - MULTI-SCHEDULE SUPPORT
            $stmtEnroll = $pdo->prepare("
                SELECT 
                    e.id_enrollment, 
                    e.course_id as id_course, 
                    c.course_name as course_name, 
                    e.status,
                    e.enrollment_date,
                    s.day_of_week as day,
                    s.start_time as time_start,
                    s.end_time as time_end,
                    s.id_schedule,
                    u_prof.full_name as teacher_name,
                    u_prof.id_rol as teacher_role
                FROM enrollments e
                LEFT JOIN courses c ON e.course_id = c.id_course
                LEFT JOIN enrollment_schedules es ON e.id_enrollment = es.enrollment_id
                LEFT JOIN schedules s ON es.schedule_id = s.id_schedule
                LEFT JOIN schedule_teachers st ON s.id_schedule = st.id_schedule
                LEFT JOIN usuario u_prof ON st.id_teacher = u_prof.id_usuario
                WHERE e.student_id = ? AND e.status IN ('Activo', 'Pendiente', 'Pre-inscrito', 'Inscrito')
                ORDER BY e.id_enrollment DESC, s.day_of_week
            ");
            $stmtEnroll->execute([$id_usuario]);
            $enrollRows = $stmtEnroll->fetchAll(PDO::FETCH_ASSOC);

            $enrollMap = [];
            foreach ($enrollRows as $row) {
                $eId = $row['id_enrollment'];

                if (!isset($enrollMap[$eId])) {
                    $tName = $row['teacher_name'];
                    if (!$tName || $row['teacher_role'] == 1) {
                        $tName = 'Por asignar';
                    }

                    $enrollMap[$eId] = [
                        'id_enrollment' => (int) $eId,
                        'id_course' => (int) $row['id_course'],
                        'name' => $row['course_name'],
                        'course_name' => $row['course_name'],
                        'status' => $row['status'],
                        'teacher_name' => $tName,
                        'id_schedule' => $row['id_schedule'] ? (int) $row['id_schedule'] : null,
                        'created_at' => $row['enrollment_date'] ?? date('Y-m-d'),
                        'schedules' => []
                    ];
                }

                if ($row['id_schedule']) {
                    $exists = false;
                    foreach ($enrollMap[$eId]['schedules'] as $sch) {
                        if ($sch['id_schedule'] == $row['id_schedule']) {
                            $exists = true;
                            break;
                        }
                    }

                    if (!$exists) {
                        $schTeacher = $row['teacher_name'];
                        if (!$schTeacher || $row['teacher_role'] == 1) {
                            $schTeacher = 'Por asignar';
                        }
                        
                        $dayStr = mb_strtolower($row['day'], 'UTF-8');
                        $dayIndex = 0;
                        if (strpos($dayStr, 'lu') !== false) $dayIndex = 1;
                        elseif (strpos($dayStr, 'ma') !== false) $dayIndex = 2;
                        elseif (strpos($dayStr, 'mi') !== false) $dayIndex = 3;
                        elseif (strpos($dayStr, 'ju') !== false) $dayIndex = 4;
                        elseif (strpos($dayStr, 'vi') !== false) $dayIndex = 5;
                        elseif (strpos($dayStr, 's') !== false && strpos($dayStr, 'ba') !== false) $dayIndex = 6;
                        elseif (strpos($dayStr, 'do') !== false) $dayIndex = 7;

                        $enrollMap[$eId]['schedules'][] = [
                            'id_schedule' => (int) $row['id_schedule'],
                            'day_of_week' => normalizeDayName($row['day']),
                            'day_index'   => $dayIndex,
                            'start_time' => $row['time_start'],
                            'end_time' => $row['time_end'],
                            'teacher_name' => $schTeacher
                        ];
                    }

                    if (!$enrollMap[$eId]['id_schedule']) {
                        $enrollMap[$eId]['id_schedule'] = (int) $row['id_schedule'];
                    }
                }
            }

            foreach ($enrollMap as $item) {
                if ($item['status'] === 'Activo') {
                    $result['enrollments'][] = $item;
                } else {
                    $result['pending'][] = $item;
                }
            }

            // 3. Teaching (Teacher & Admin academic load) - Optimized join and grouping
            if (in_array($user['id_rol'], [1, 2, 3, 6])) {
                $stmtTeach = $pdo->prepare("
                    SELECT 
                        c.id_course,
                        c.course_name,
                        s.id_schedule,
                        s.day_of_week as day,
                        s.start_time as time_start,
                        s.end_time as time_end,
                        s.max_students as quota,
                        (SELECT COUNT(*) FROM enrollment_schedules es 
                         JOIN enrollments e ON es.enrollment_id = e.id_enrollment
                         WHERE es.schedule_id = s.id_schedule AND e.status = 'Activo') as student_count
                    FROM courses c
                    LEFT JOIN schedules s ON c.id_course = s.course_id
                    LEFT JOIN schedule_teachers st ON s.id_schedule = st.id_schedule
                    WHERE c.teacher_id = ? OR s.teacher_id = ? OR st.id_teacher = ?
                    ORDER BY c.course_name ASC, s.day_of_week, s.start_time ASC
                ");
                $stmtTeach->execute([$id_usuario, $id_usuario, $id_usuario]);
                $teachingRaw = $stmtTeach->fetchAll(PDO::FETCH_ASSOC);

                $coursesMap = [];
                foreach ($teachingRaw as $t) {
                    $cid = $t['id_course'];
                    if (!isset($coursesMap[$cid])) {
                        $coursesMap[$cid] = [
                            'id_course' => (int) $cid,
                            'name' => $t['course_name'],
                            'schedules' => [],
                            'total_students' => 0,
                            'students' => []
                        ];
                    }

                    if ($t['id_schedule']) {
                        $sCount = (int) $t['student_count'];
                        
                        $dayStr = mb_strtolower($t['day'], 'UTF-8');
                        $dayIndex = 0;
                        if (strpos($dayStr, 'lu') !== false) $dayIndex = 1;
                        elseif (strpos($dayStr, 'ma') !== false) $dayIndex = 2;
                        elseif (strpos($dayStr, 'mi') !== false) $dayIndex = 3;
                        elseif (strpos($dayStr, 'ju') !== false) $dayIndex = 4;
                        elseif (strpos($dayStr, 'vi') !== false) $dayIndex = 5;
                        elseif (strpos($dayStr, 's') !== false && strpos($dayStr, 'ba') !== false) $dayIndex = 6;
                        elseif (strpos($dayStr, 'do') !== false) $dayIndex = 7;

                        $normalDay = normalizeDayName($t['day']);
                        $coursesMap[$cid]['schedules'][] = [
                            'id_schedule' => (int) $t['id_schedule'],
                            'schedule_name' => $normalDay . " " . $t['time_start'] . "-" . $t['time_end'],
                            'day_of_week' => $normalDay,
                            'day_index'   => $dayIndex,
                            'start_time' => $t['time_start'],
                            'end_time' => $t['time_end'],
                            'time_start' => $t['time_start'],
                            'time_end' => $t['time_end'],
                            'quota' => (int) $t['quota'],
                            'student_count' => $sCount
                        ];
                        $coursesMap[$cid]['total_students'] += $sCount;
                    }
                }

                // Fetch students for each course to allow list display and notes management
                foreach ($coursesMap as $cid => &$courseData) {
                    $stmtStudents = $pdo->prepare("
                        SELECT DISTINCT u.id_usuario, u.full_name, u.email, u.n_phone, e.status
                        FROM enrollments e
                        JOIN usuario u ON e.student_id = u.id_usuario
                        WHERE e.course_id = ? AND e.status = 'Activo'
                        ORDER BY u.full_name ASC
                    ");
                    $stmtStudents->execute([$cid]);
                    $courseData['students'] = $stmtStudents->fetchAll(PDO::FETCH_ASSOC);
                }

                $academicLoadFlat = [];
                foreach ($coursesMap as $c) {
                    foreach ($c['schedules'] as $s) {
                        $academicLoadFlat[] = [
                            'id_course' => $c['id_course'],
                            'course_name' => $c['name'],
                            'id_schedule' => $s['id_schedule'],
                            'schedule_name' => $s['schedule_name'],
                            'day_of_week' => $s['day_of_week'],
                            'day_index' => $s['day_index'],
                            'time_start' => $s['time_start'],
                            'time_end' => $s['time_end'],
                            'student_count' => $s['student_count']
                        ];
                    }
                }
                $result['academic_load'] = $academicLoadFlat;
                $result['teaching'] = $academicLoadFlat; // Alias for frontend hooks
                $result['courses'] = array_values($coursesMap); // Array de cursos con sus estudiantes
            } else {
                $result['academic_load'] = [];
                $result['teaching'] = [];
                $result['courses'] = [];
            }

            // 4. Positions & Functions (Administrative/Staff)
            $stmtPos = $pdo->prepare("
                SELECT 
                    up.id as association_id,
                    p.id_position,
                    p.position_name,
                    p.description as position_description,
                    up.assigned_at,
                    up.is_active
                FROM user_positions up
                JOIN positions p ON up.position_id = p.id_position
                WHERE up.user_id = ? AND up.is_active = 1
                ORDER BY up.assigned_at DESC
            ");
            $stmtPos->execute([$id_usuario]);
            $positions = $stmtPos->fetchAll(PDO::FETCH_ASSOC);

            foreach ($positions as &$pos) {
                $stmtFunc = $pdo->prepare("SELECT description FROM position_functions WHERE position_id = ?");
                $stmtFunc->execute([$pos['id_position']]);
                $pos['functions'] = $stmtFunc->fetchAll(PDO::FETCH_COLUMN);
            }
            $result['positions'] = $positions;

        }

        echo json_encode(["success" => true, "data" => $result]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "ID requerido."]);
}
?>